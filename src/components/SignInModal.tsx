// @ts-nocheck
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function SignInModal() {
  const { signInPromptOpen, closeSignInPrompt } = useAuth();

  if (!signInPromptOpen) {
    return null;
  }

  return (
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={closeSignInPrompt}
    >
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-prompt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-header">
          <p className="meta-line">Access required</p>
          <button
            type="button"
            className="auth-modal-close"
            onClick={closeSignInPrompt}
            aria-label="Close sign in prompt"
          >
            ×
          </button>
        </div>

        <h2 id="sign-in-prompt-title">Sign in to continue</h2>
        <p className="auth-modal-copy">
          This action needs an authenticated session. Sign in to continue with
          your account and role-based permissions.
        </p>

        <div className="inline-actions auth-modal-actions">
          <Link href="/auth" className="nav-cta" onClick={closeSignInPrompt}>
            Go to Sign In
          </Link>
          <button
            type="button"
            className="action-button ghost"
            onClick={closeSignInPrompt}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
