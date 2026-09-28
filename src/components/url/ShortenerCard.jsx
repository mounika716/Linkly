import { useState } from "react";
import SquishSwitch from "../react-bits/SquishSwitch";
import FuseButton from "../react-bits/FuseButton";
import StatusMark from "../react-bits/StatusMark";
import "./ShortenerCard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const SAVED_LINKS_KEY = "linklySavedLinks";

function saveLinkForReuse(link) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(SAVED_LINKS_KEY) || "[]"
    );

    const filtered = existing.filter(
      (item) => item.code !== link.code
    );

    const updated = [
      link,
      ...filtered,
    ].slice(0, 50);

    localStorage.setItem(
      SAVED_LINKS_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error(
      "Unable to save link history:",
      error
    );
  }
}

export default function ShortenerCard({ onResult }) {
  const [url, setUrl] = useState("");

  const [customAlias, setCustomAlias] =
    useState(false);

  const [alias, setAlias] = useState("");

  const [analytics, setAnalytics] =
    useState(true);

  const [password, setPassword] =
    useState(false);

  const [passwordValue, setPasswordValue] =
    useState("");

  const [expiration, setExpiration] =
    useState("never");

  const [status, setStatus] =
    useState("pending");

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleCommit = async () => {
    const trimmedUrl = url.trim();

    setErrorMessage("");

    if (!trimmedUrl) {
      setStatus("failed");
      setErrorMessage("Please enter a URL.");
      return;
    }

    if (customAlias && !alias.trim()) {
      setStatus("failed");
      setErrorMessage(
        "Please enter your custom alias."
      );
      return;
    }

    if (
      password &&
      passwordValue.length < 4
    ) {
      setStatus("failed");
      setErrorMessage(
        "Password must contain at least 4 characters."
      );
      return;
    }

    setStatus("running");

    try {
      const token =
       localStorage.getItem("linklyToken");
      const response = await fetch(
        `${API_BASE_URL}/api/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            originalUrl: trimmedUrl,
            analyticsEnabled: analytics,
            customAliasEnabled: customAlias,
            customAlias: alias.trim(),
            passwordProtected: password,
            password: passwordValue,
            expiration,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to create short link."
        );
      }

      const { data } = result;

      const reusableResult = {
        originalUrl: data.originalUrl,
        shortUrl:
          data.shortUrl ||
          `${window.location.origin}/s/${data.code}`,
        code: data.code,
        analyticsEnabled:
          data.analyticsEnabled,
        passwordProtected:
          data.passwordProtected,
        expiresAt: data.expiresAt,
        clicks: data.clicks || 0,
        createdAt: data.createdAt,
      };

      saveLinkForReuse(reusableResult);

      setStatus("done");

      onResult?.(reusableResult);
    } catch (error) {
      console.error(
        "Shorten URL error:",
        error
      );

      setStatus("failed");

      setErrorMessage(
        error.message ||
          "Unable to create short link."
      );
    }
  };

  const handleUndo = () => {
    setStatus("pending");
    setErrorMessage("");
  };

  return (
    <section className="shortener-card">
      <div className="shortener-card__header">
        <div>
          <span className="shortener-card__eyebrow">
            QUICK SHORTENER
          </span>

          <h2>
            Turn long links into clean URLs.
          </h2>

          <p>
            Paste a URL below and create a
            short, shareable link in seconds.
          </p>
        </div>

        <StatusMark
          status={status}
          label={
            status === "pending"
              ? "Ready"
              : status === "running"
                ? "Creating"
                : status === "done"
                  ? "Created"
                  : "Unable to create"
          }
        />
      </div>

      <div className="url-input-wrapper">
        <label htmlFor="long-url">
          Long URL
        </label>

        <input
          id="long-url"
          type="url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);

            if (status === "failed") {
              setStatus("pending");
              setErrorMessage("");
            }
          }}
          placeholder="https://example.com/your/very/long/url"
          autoComplete="off"
        />
      </div>

      <div className="shortener-options">
        <div className="option-row">
          <div>
            <strong>
              Custom alias
            </strong>

            <span>
              Create a memorable short URL.
            </span>
          </div>

          <SquishSwitch
            checked={customAlias}
            onChange={(checked) => {
              setCustomAlias(checked);

              if (!checked) {
                setAlias("");
              }
            }}
            ariaLabel="Enable custom alias"
          />
        </div>

        {customAlias && (
          <div className="option-input">
            <label htmlFor="custom-alias">
              Custom alias
            </label>

            <input
              id="custom-alias"
              type="text"
              value={alias}
              onChange={(event) =>
                setAlias(
                  event.target.value
                )
              }
              placeholder="my-link"
              minLength={3}
              maxLength={30}
              autoComplete="off"
            />

            <span>
              3-30 characters · letters,
              numbers, - and _
            </span>
          </div>
        )}

        <div className="option-row">
          <div>
            <strong>
              Analytics tracking
            </strong>

            <span>
              Track clicks and link performance.
            </span>
          </div>

          <SquishSwitch
            checked={analytics}
            onChange={setAnalytics}
            ariaLabel="Enable analytics tracking"
          />
        </div>

        <div className="option-row">
          <div>
            <strong>
              Password protection
            </strong>

            <span>
              Require a password before
              redirecting.
            </span>
          </div>

          <SquishSwitch
            checked={password}
            onChange={(checked) => {
              setPassword(checked);

              if (!checked) {
                setPasswordValue("");
              }
            }}
            ariaLabel="Enable password protection"
          />
        </div>

        {password && (
          <div className="option-input">
            <label htmlFor="link-password">
              Link password
            </label>

            <input
              id="link-password"
              type="password"
              value={passwordValue}
              onChange={(event) =>
                setPasswordValue(
                  event.target.value
                )
              }
              placeholder="Enter a password"
              minLength={4}
              autoComplete="new-password"
            />

            <span>
              Minimum 4 characters.
              Your password is stored securely.
            </span>
          </div>
        )}

        <div className="option-input">
          <label htmlFor="link-expiration">
            Link expiration
          </label>

          <select
            id="link-expiration"
            value={expiration}
            onChange={(event) =>
              setExpiration(
                event.target.value
              )
            }
          >
            <option value="never">
              Never expires
            </option>

            <option value="1h">
              Expires in 1 hour
            </option>

            <option value="1d">
              Expires in 1 day
            </option>

            <option value="7d">
              Expires in 7 days
            </option>

            <option value="30d">
              Expires in 30 days
            </option>
          </select>

          <span>
            Expired links stop working automatically.
          </span>
        </div>
      </div>

      {errorMessage && (
        <div
          className="shortener-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="shortener-action">
        <FuseButton
        label="Shorten URL"
        undoLabel="Undo"
        doneLabel="Created"
        size="lg"
        commitOn="fuseEnd"
        onCommit={handleCommit}
        onUndo={handleUndo}
        fuseColor="#8fffe4"
        background="rgba(143, 255, 228, 0.055)"
        color="#f5fffc"
      />
      </div>
    </section>
  );
}