import { useEffect, useState } from "react";
import "./ResultCard.css";

const SAVED_LINKS_KEY = "linklySavedLinks";

function readSavedLinks() {
  try {
    return JSON.parse(
      localStorage.getItem(
        SAVED_LINKS_KEY
      ) || "[]"
    );
  } catch {
    return [];
  }
}

export default function ResultCard({ result }) {
  const [copied, setCopied] =
    useState(false);

  const [savedLinks, setSavedLinks] =
    useState(readSavedLinks);

  useEffect(() => {
    if (!result?.code) {
      setSavedLinks(readSavedLinks());
      return;
    }

    const existing = readSavedLinks();

    const updated = [
      result,
      ...existing.filter(
        (item) =>
          item.code !== result.code
      ),
    ].slice(0, 50);

    localStorage.setItem(
      SAVED_LINKS_KEY,
      JSON.stringify(updated)
    );

    setSavedLinks(updated);
  }, [result]);

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopied(url);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const removeSavedLink = (code) => {
    const updated =
      savedLinks.filter(
        (item) => item.code !== code
      );

    localStorage.setItem(
      SAVED_LINKS_KEY,
      JSON.stringify(updated)
    );

    setSavedLinks(updated);
  };

  return (
    <section className="result-card">
      {result && (
        <>
          <div className="result-card__top">
            <span>
              YOUR SHORT URL
            </span>

            <span className="result-card__success">
              ACTIVE
            </span>
          </div>

          <div className="result-card__original">
            <strong>
              Original URL
            </strong>

            <div>
              {result.originalUrl}
            </div>
          </div>

          <div className="result-card__original">
            <strong>
              Generated Short URL
            </strong>

            <a
              className="result-card__url"
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
            >
              {result.shortUrl}
            </a>
          </div>

          {result.expiresAt && (
            <div className="result-card__original">
              <strong>
                Expires
              </strong>

              <div>
                {new Date(
                  result.expiresAt
                ).toLocaleString()}
              </div>
            </div>
          )}

          <div className="result-card__actions">
            <button
              type="button"
              onClick={() =>
                copyUrl(result.shortUrl)
              }
            >
              {copied === result.shortUrl
                ? "Copied"
                : "Copy URL"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title:
                      "Linkly Short URL",
                    url: result.shortUrl,
                  });
                } else {
                  copyUrl(result.shortUrl);
                }
              }}
            >
              Share
            </button>

            <a
              href={result.shortUrl}
              className="result-card__open"
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          </div>
        </>
      )}

      {savedLinks.length > 0 && (
        <div className="saved-links">
          <div className="saved-links__header">
            <div>
              <strong>
                Saved Links
              </strong>

              <span>
                Reuse previously created links
                without creating them again.
              </span>
            </div>
          </div>

          <div className="saved-links__list">
            {savedLinks.map((link) => {
              const expired =
                link.expiresAt &&
                new Date(
                  link.expiresAt
                ).getTime() <= Date.now();

              return (
                <article
                  className="saved-link-item"
                  key={link.code}
                >
                  <div className="saved-link-item__info">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.shortUrl}
                    </a>

                    <span>
                      {link.originalUrl}
                    </span>

                    {expired && (
                      <small>
                        Expired
                      </small>
                    )}
                  </div>

                  <div className="saved-link-item__actions">
                    <button
                      type="button"
                      disabled={expired}
                      onClick={() =>
                        copyUrl(
                          link.shortUrl
                        )
                      }
                    >
                      Copy
                    </button>

                    <a
                      href={
                        expired
                          ? undefined
                          : link.shortUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={expired}
                    >
                      Open
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        removeSavedLink(
                          link.code
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}