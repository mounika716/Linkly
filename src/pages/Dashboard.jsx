import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    token,
    logout,
  } = useAuth();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editing, setEditing] =
    useState(null);

  const [editUrl, setEditUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [qrLink, setQrLink] =
    useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(false);

  async function loadAnalytics(link) {
    setAnalyticsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/links/${link.code}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            "Unable to load analytics."
        );
      }

      setAnalytics({
        ...result.data,
        shortUrl: link.shortUrl,
      });
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to load analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadLinks() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/links/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            "Unable to load your links."
        );
      }

      setData(result.data);
      setError("");
    } catch (error) {
      setError(
        error.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadLinks();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const startEdit = (link) => {
    setEditing(link);
    setEditUrl(link.originalUrl);
  };

  const saveEdit = async () => {
    if (!editing) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/links/${editing.code}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalUrl: editUrl,
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
            "Unable to update link."
        );
      }

      setEditing(null);

      await loadLinks();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to update link."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleLink = async (link) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/links/${link.code}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !link.isActive,
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
            "Unable to update link."
        );
      }

      await loadLinks();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to update link."
      );
    }
  };

  const deleteLink = async (code) => {
    const confirmed =
      window.confirm(
        "Delete this short link permanently?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/links/${code}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            "Unable to delete link."
        );
      }

      await loadLinks();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to delete link."
      );
    }
  };

  const createQR = async (link) => {
    try {
      const dataUrl =
        await QRCode.toDataURL(
          link.shortUrl,
          {
            width: 420,
            margin: 2,
            errorCorrectionLevel: "M",
          }
        );

      setQrLink({
        ...link,
        dataUrl,
      });
    } catch (error) {
      console.error(
        "QR generation error:",
        error
      );

      window.alert(
        "Unable to generate QR code."
      );
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          Loading your workspace...
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-nav">
        <Link
          to="/"
          className="dashboard-brand"
        >
          <span>↗</span>
          LINKLY
        </Link>

        <div className="dashboard-nav__right">
          <span>
            {user?.name}
          </span>

          <button
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <span>
              YOUR WORKSPACE
            </span>

            <h1>
              Welcome back,{" "}
              {user?.name}.
            </h1>

            <p>
              Manage your links,
              activity, and sharing
              history from one place.
            </p>
          </div>

          <Link
            to="/"
            className="dashboard-create"
          >
            Create short link
            <span>↗</span>
          </Link>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="dashboard-stats">
          <article>
            <span>
              TOTAL LINKS
            </span>

            <strong>
              {data?.totalLinks || 0}
            </strong>
          </article>

          <article>
            <span>
              TOTAL CLICKS
            </span>

            <strong>
              {data?.totalClicks || 0}
            </strong>
          </article>

          <article>
            <span>
              ACTIVE LINKS
            </span>

            <strong>
              {data?.activeLinks || 0}
            </strong>
          </article>
        </div>

        <section className="dashboard-links">
          <div className="dashboard-links__heading">
            <div>
              <span>
                LINK LIBRARY
              </span>

              <h2>
                My Links
              </h2>
            </div>

            <span>
              {data?.totalLinks || 0} saved
            </span>
          </div>

          {!data?.links?.length ? (
            <div className="dashboard-empty">
              <strong>
                No cloud-saved links yet.
              </strong>

              <p>
                Create your first link
                while signed in.
              </p>

              <Link to="/">
                Create a link →
              </Link>
            </div>
          ) : (
            <div className="dashboard-link-list">
              {data.links.map(
                (link) => {
                  const state =
                    link.expired
                      ? "Expired"
                      : !link.isActive
                        ? "Disabled"
                        : "Active";

                  return (
                    <article
                      className="dashboard-link"
                      key={link.code}
                    >
                      <div className="dashboard-link__main">
                        <div className="dashboard-link__topline">
                          <a
                            href={
                              link.isActive &&
                              !link.expired
                                ? link.shortUrl
                                : undefined
                            }
                            target="_blank"
                            rel="noreferrer"
                            className={
                              !link.isActive ||
                              link.expired
                                ? "is-disabled"
                                : ""
                            }
                          >
                            {link.shortUrl}
                          </a>

                          <span
                            className={`link-state link-state--${state.toLowerCase()}`}
                          >
                            {state}
                          </span>
                        </div>

                        <span>
                          {link.originalUrl}
                        </span>

                        <small>
                          {link.clicks} clicks
                          {" · "}
                          {link.passwordProtected
                            ? "Password protected"
                            : "Public"}
                        </small>
                      </div>

                      <div className="dashboard-link__actions">
                        <button
                          type="button"
                          onClick={() =>
                            loadAnalytics(link)
                          }
                          disabled={analyticsLoading}
                        >
                          {analyticsLoading
                            ? "Loading..."
                            : "Analytics"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              link.shortUrl
                            )
                          }
                        >
                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(link)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleLink(link)
                          }
                        >
                          {link.isActive
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            createQR(link)
                          }
                        >
                          QR
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteLink(
                              link.code
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </section>

      {editing && (
        <div
          className="dashboard-modal-backdrop"
          onMouseDown={() =>
            !saving && setEditing(null)
          }
        >
          <div
            className="dashboard-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <span>
              EDIT LINK
            </span>

            <h2>
              Update destination
            </h2>

            <label>
              Destination URL

              <input
                type="url"
                value={editUrl}
                onChange={(event) =>
                  setEditUrl(
                    event.target.value
                  )
                }
              />
            </label>

            <div className="dashboard-modal__actions">
              <button
                type="button"
                onClick={() =>
                  setEditing(null)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {qrLink && (
        <div
          className="dashboard-modal-backdrop"
          onMouseDown={() =>
            setQrLink(null)
          }
        >
          <div
            className="dashboard-modal dashboard-qr-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <span>
              QR CODE
            </span>

            <h2>
              {qrLink.shortUrl}
            </h2>

            <img
              src={qrLink.dataUrl}
              alt={`QR code for ${qrLink.shortUrl}`}
            />

            <a
              href={qrLink.dataUrl}
              download={`linkly-${qrLink.code}.png`}
              className="dashboard-qr-download"
            >
              Download QR
            </a>

            <button
              type="button"
              onClick={() =>
                setQrLink(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {analytics && (
        <div
          className="dashboard-modal-backdrop"
          onMouseDown={() =>
            setAnalytics(null)
          }
        >
          <div
            className="dashboard-modal analytics-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <span>
              LINK ANALYTICS
            </span>

            <h2>
              {analytics.shortUrl}
            </h2>

            <div className="analytics-total">
              <strong>
                {analytics.totalClicks}
              </strong>

              <span>
                total clicks
              </span>
            </div>

            <div className="analytics-chart">
              {analytics.last30Days.map(
                (day) => {
                  const max =
                    Math.max(
                      ...analytics.last30Days.map(
                        (item) =>
                          item.clicks
                      ),
                      1
                    );

                  const height =
                    (day.clicks / max) *
                    100;

                  return (
                    <div
                      className="analytics-bar"
                      key={day.date}
                      title={`${day.date}: ${day.clicks} clicks`}
                    >
                      <div
                        style={{
                          height: `${Math.max(
                            height,
                            day.clicks
                              ? 6
                              : 2
                          )}%`,
                        }}
                      />

                      <small>
                        {day.date.slice(8)}
                      </small>
                    </div>
                  );
                }
              )}
            </div>

            <div className="analytics-columns">
              <div>
                <h3>
                  Top sources
                </h3>

                {analytics.referrers.map(
                  (item) => (
                    <div
                      className="analytics-row"
                      key={item.source}
                    >
                      <span>
                        {item.source}
                      </span>

                      <strong>
                        {item.clicks}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div>
                <h3>
                  Devices
                </h3>

                {analytics.devices.map(
                  (item) => (
                    <div
                      className="analytics-row"
                      key={item.device}
                    >
                      <span>
                        {item.device}
                      </span>

                      <strong>
                        {item.clicks}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setAnalytics(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}