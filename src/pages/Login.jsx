import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
import { GoogleLogin } from "@react-oauth/google";
export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

    const handleGoogleLogin = async (
      credentialResponse
    ) => {
      setError("");
      setSubmitting(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/google`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              credential:
                credentialResponse.credential,
            }),
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Google login failed."
          );
        }

        localStorage.setItem(
          "linklyToken",
          result.data.token
        );

        localStorage.setItem(
          "linklyUser",
          JSON.stringify(result.data.user)
        );

        window.location.href =
          "/dashboard";
      } catch (error) {
        setError(
          error.message ||
            "Google login failed."
        );
      } finally {
        setSubmitting(false);
      }
    };
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.message ||
          "Unable to login."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link
          to="/"
          className="auth-brand"
        >
          <span>↗</span>
          LINKLY
        </Link>

        <div className="auth-heading">
          <span>
            YOUR LINK WORKSPACE
          </span>

          <h1>
            Welcome back.
          </h1>

          <p>
            Sign in to manage your
            links across devices.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Sign in"}
          </button>
          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() =>
                setError(
                  "Google sign-in was cancelled or failed."
                )
              }
              theme="outline"
              size="large"
              text="continue_with"
              width="100%"
            />
          </div>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>

        <Link
          to="/"
          className="auth-back"
        >
          ← Back to Linkly
        </Link>
      </div>
    </main>
  );
}