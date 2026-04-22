"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError, apiRequest } from "../lib/apiClient";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: "user" | "mod" | "admin";
  bio: string;
  avatarUrl: string;
  provider?: "local" | "google" | "discord" | "facebook" | "github";
  joinedAt?: string;
};

type RefreshOptions = {
  background?: boolean;
  preserveUser?: boolean;
  force?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshing: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: (options?: RefreshOptions) => Promise<AuthUser | null>;
  signInPromptOpen: boolean;
  requestSignIn: () => void;
  closeSignInPrompt: () => void;
};

type AuthEventPayload = {
  type: "login" | "logout";
  payload: AuthUser | null;
  at: number;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_EVENT_KEY = "aniverse:auth:event";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);

  const userRef = useRef<AuthUser | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthUser | null> | null>(null);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const broadcastAuthEvent = useCallback(
    (type: "login" | "logout", payload: AuthUser | null = null) => {
      if (channelRef.current) {
        channelRef.current.postMessage({ type, payload });
      }

      try {
        localStorage.setItem(
          AUTH_EVENT_KEY,
          JSON.stringify({
            type,
            payload,
            at: Date.now(),
          } satisfies AuthEventPayload),
        );
      } catch {
        // Ignore storage restrictions.
      }
    },
    [],
  );

  const refreshUser = useCallback(async (options: RefreshOptions = {}) => {
    const force = Boolean(options.force);
    const wantsBackground = Boolean(options.background);
    const hasKnownUser = Boolean(userRef.current);
    const background = Boolean(wantsBackground && hasKnownUser);
    const preserveUser = Boolean(options.preserveUser && userRef.current);
    const now = Date.now();
    const cooldownMs = background ? 2000 : 1500;

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    if (!force && now - lastRefreshAtRef.current < cooldownMs) {
      return userRef.current;
    }

    if (!force && wantsBackground && !hasKnownUser) {
      return null;
    }

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const pending = (async () => {
      try {
        const maxAttempts = preserveUser ? 2 : 1;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          try {
            const data = await apiRequest<{ user: AuthUser | null }>(
              "/api/auth/me",
              {
                suppressAuthPrompt: true,
              },
            );
            setUser(data.user || null);
            return data.user || null;
          } catch (error) {
            const isFinalAttempt = attempt + 1 >= maxAttempts;
            const isAuthFailure =
              error instanceof ApiError && error.status === 401;

            if (isFinalAttempt) {
              if (preserveUser && !isAuthFailure && userRef.current) {
                return userRef.current;
              }
              throw error;
            }

            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, 150);
            });
          }
        }

        return userRef.current;
      } catch {
        if (preserveUser && userRef.current) {
          return userRef.current;
        }
        setUser(null);
        return null;
      } finally {
        lastRefreshAtRef.current = Date.now();
        refreshPromiseRef.current = null;
        if (background) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    })();

    refreshPromiseRef.current = pending;
    return pending;
  }, []);

  useEffect(() => {
    refreshUser({ preserveUser: false }).catch(() => null);
  }, [refreshUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromServer = () => {
      refreshUser({ background: true, preserveUser: true }).catch(() => null);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_EVENT_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as AuthEventPayload;

        if (payload.type === "logout") {
          setUser(null);
          setLoading(false);
          setRefreshing(false);
          setSignInPromptOpen(false);
          return;
        }

        if (payload.type === "login" && payload.payload) {
          setUser(payload.payload);
          setLoading(false);
          setRefreshing(false);
          setSignInPromptOpen(false);
          return;
        }
      } catch {
        // Ignore malformed payloads.
      }

      syncFromServer();
    };

    window.addEventListener("storage", onStorage);

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("aniverse-auth");
      channelRef.current.onmessage = (
        event: MessageEvent<AuthEventPayload>,
      ) => {
        const message = event.data || { type: "logout", payload: null, at: 0 };

        if (message.type === "logout") {
          setUser(null);
          setLoading(false);
          setRefreshing(false);
          setSignInPromptOpen(false);
          return;
        }

        if (message.type === "login" && message.payload) {
          setUser(message.payload);
          setLoading(false);
          setRefreshing(false);
          setSignInPromptOpen(false);
          return;
        }

        syncFromServer();
      };
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      setSignInPromptOpen(false);
    }
  }, [user]);

  useEffect(() => {
    const openSignInPrompt = () => setSignInPromptOpen(true);
    window.addEventListener("aniverse:auth-required", openSignInPrompt);
    return () => {
      window.removeEventListener("aniverse:auth-required", openSignInPrompt);
    };
  }, []);

  const login = useCallback(
    (nextUser: AuthUser) => {
      setUser(nextUser);
      setLoading(false);
      setRefreshing(false);
      setSignInPromptOpen(false);
      broadcastAuthEvent("login", nextUser);
    },
    [broadcastAuthEvent],
  );

  const logout = useCallback(async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoading(false);
    setRefreshing(false);
    setSignInPromptOpen(false);
    broadcastAuthEvent("logout");
  }, [broadcastAuthEvent]);

  const requestSignIn = useCallback(() => {
    setSignInPromptOpen(true);
  }, []);

  const closeSignInPrompt = useCallback(() => {
    setSignInPromptOpen(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshing,
      isAuthenticated: Boolean(user),
      setUser,
      login,
      logout,
      refreshUser,
      signInPromptOpen,
      requestSignIn,
      closeSignInPrompt,
    }),
    [
      user,
      loading,
      refreshing,
      login,
      logout,
      refreshUser,
      signInPromptOpen,
      requestSignIn,
      closeSignInPrompt,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
