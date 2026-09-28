import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ShortLink.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export default function ShortLink() {
  const { code } = useParams();

  const [status, setStatus] =
    useState("loading");

  const [message, setMessage] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLink() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/links/${code}`
        );

        const result =
          await response.json();

        if (cancelled) {
          return;
        }

        if (
          response.status === 410 &&
          result.disabled
        ) {
          setStatus("disabled");
          setMessage(
            result.message ||
              "This short link has been disabled."
          );
          return;
        }

        if (
          response.status === 410 &&
          result.expired
        ) {
          setStatus("expired");
          setMessage(
            result.message ||
              "This short link has expired."
          );
          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          setStatus("missing");
          setMessage(
            result.message ||
              "This short link doesn't exist."
          );
          return;
        }

        setStatus("redirecting");

        window.location.replace(
          result.data.originalUrl
        );
      } catch (error) {
        console.error(
          "Short link error:",
          error
        );

        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Unable to connect to the Linkly server."
          );
        }
      }
    }

    loadLink();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const handlePasswordSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!password.trim()) {
      setMessage(
        "Please enter the password."
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/links/${code}/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (
        response.status === 410 &&
        result.expired
      ) {
        setStatus("expired");
        setMessage(
          result.message ||
            "This short link has expired."
        );
        setSubmitting(false);
        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        setMessage(
          result.message ||
            "Incorrect password."
        );
        setSubmitting(false);
        return;
      }

      setStatus("redirecting");

      window.location.replace(
        result.data.originalUrl
      );
    } catch (error) {
      console.error(
        "Password verification error:",
        error
      );

      setMessage(
        "Unable to connect to the Linkly server."
      );

      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="short-link-page">
        <div className="short-link-card">
          <div className="short-link-card__eyebrow">
            LINKLY
          </div>

          <h1>
            Opening your link...
          </h1>

          <p>
            We're retrieving the
            destination securely.
          </p>
        </div>
      </main>
    );
  }

  if (status === "redirecting") {
    return (
      <main className="short-link-page">
        <div className="short-link-card">
          <div className="short-link-card__eyebrow">
            LINKLY
          </div>

          <h1>
            Redirecting...
          </h1>

          <p>
            Taking you to your destination.
          </p>
        </div>
      </main>
    );
  }

  if (status === "password") {
    return (
      <main className="short-link-page">
        <div className="short-link-card">
          <div className="short-link-card__eyebrow">
            LINKLY · PROTECTED
          </div>

          <h1>
            This link is protected.
          </h1>

          <p>
            Enter the password to continue
            to the destination.
          </p>

          <form
            className="short-link-password-form"
            onSubmit={
              handlePasswordSubmit
            }
          >
            <label htmlFor="short-link-password">
              Password
            </label>

            <input
              id="short-link-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value
                );
                setMessage("");
              }}
              placeholder="Enter link password"
              autoFocus
              autoComplete="off"
            />

            {message && (
              <div
                className="short-link-error"
                role="alert"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Verifying..."
                : "Unlock link"}
            </button>
          </form>

          <Link
            className="short-link-card__back"
            to="/"
          >
            ← Back to Linkly
          </Link>
        </div>
      </main>
    );
  }
  if (status === "disabled") {
  return (
    <main className="short-link-page">
      <div className="short-link-card">
        <div className="short-link-card__eyebrow">
          LINKLY · DISABLED
        </div>

        <h1>
          This link is disabled.
        </h1>

        <p>
          The owner has temporarily
          stopped this short link
          from redirecting.
        </p>

        <Link
          className="short-link-card__back"
          to="/"
        >
          ← Back to Linkly
        </Link>
      </div>
    </main>
  );
}

  if (status === "expired") {
    return (
      <main className="short-link-page">
        <div className="short-link-card">
          <div className="short-link-card__eyebrow">
            LINKLY · EXPIRED
          </div>

          <h1>
            This link has expired.
          </h1>

          <p>
            The owner configured an
            expiration time for this link.
          </p>

          <Link
            className="short-link-card__back"
            to="/"
          >
            ← Back to Linkly
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="short-link-page">
      <div className="short-link-card">
        <div className="short-link-card__eyebrow">
          LINKLY
        </div>

        <h1>
          Short link unavailable.
        </h1>

        <p>
          {message ||
            "This short link doesn't exist or is no longer available."}
        </p>

        <Link
          className="short-link-card__back"
          to="/"
        >
          ← Back to Linkly
        </Link>
      </div>
    </main>
  );
}