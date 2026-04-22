"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";

type AuthRole = "user" | "mod" | "admin";

type AuthUser = Record<string, any> & {
  role: AuthRole;
};

type UseProtectedAuthOptions = {
  roles?: AuthRole[];
};

type UseProtectedAuthResult = {
  user: AuthUser | null;
  checking: boolean;
  accessBlocked: boolean;
  forbidden: boolean;
  requestSignIn: () => void;
  handleUnauthorized: () => Promise<AuthUser | null>;
};

function hasRequiredRole(user: AuthUser, roles: AuthRole[]) {
  if (!roles.length) {
    return true;
  }
  return roles.includes(user.role);
}

export function useProtectedAuth(
  options: UseProtectedAuthOptions = {},
): UseProtectedAuthResult {
  const roles = options.roles || [];
  const rolesKey = roles.join("|");
  const requiredRoles = useMemo(
    () => (rolesKey ? (rolesKey.split("|") as AuthRole[]) : ([] as AuthRole[])),
    [rolesKey],
  );

  const { user, loading, refreshing, refreshUser, requestSignIn } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const applyRoleState = useCallback(
    (nextUser: AuthUser | null) => {
      if (!nextUser) {
        setForbidden(false);
        return;
      }
      setForbidden(!hasRequiredRole(nextUser, requiredRoles));
    },
    [requiredRoles],
  );

  useEffect(() => {
    let cancelled = false;

    const ensureAuthenticated = async () => {
      if (loading || refreshing) {
        return;
      }

      setChecking(true);

      let nextUser = (user as AuthUser | null) || null;
      if (!nextUser) {
        nextUser = (await refreshUser({
          preserveUser: false,
        })) as AuthUser | null;
      }

      if (cancelled) {
        return;
      }

      if (!nextUser) {
        setAccessBlocked(true);
        setForbidden(false);
        setChecking(false);
        return;
      }

      setAccessBlocked(false);
      applyRoleState(nextUser);
      setChecking(false);
    };

    ensureAuthenticated().catch(() => {
      if (cancelled) {
        return;
      }
      setAccessBlocked(true);
      setForbidden(false);
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [applyRoleState, loading, refreshUser, refreshing, user]);

  const handleUnauthorized = useCallback(async () => {
    try {
      const syncedUser = (await refreshUser({
        background: Boolean(user),
        preserveUser: false,
        force: true,
      })) as AuthUser | null;

      if (!syncedUser) {
        setAccessBlocked(true);
        setForbidden(false);
        return null;
      }

      setAccessBlocked(false);
      applyRoleState(syncedUser);
      return syncedUser;
    } catch {
      setAccessBlocked(true);
      setForbidden(false);
      return null;
    }
  }, [applyRoleState, refreshUser, user]);

  return {
    user: (user as AuthUser | null) || null,
    checking: loading || refreshing || checking,
    accessBlocked,
    forbidden,
    requestSignIn,
    handleUnauthorized,
  };
}
