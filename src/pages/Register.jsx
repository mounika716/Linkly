import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
import { GoogleLogin } from "@react-oauth/google";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";
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
          "Google sign-in failed."
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
        "Google sign-in failed."
    );
  } finally {
    setSubmitting(false);
  }
};
export default function Register() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await register(
        name,
        email,
        password
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.message ||
          "Unable to create account."
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
            CREATE YOUR WORKSPACE
          </span>

          <h1>
            Start with Linkly.
          </h1>

          <p>
            Keep your links,
            analytics, and history
            together.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
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
              ? "Creating account..."
              : "Create account"}
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
          Already have an account?{" "}
          <Link to="/login">
            Sign in
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