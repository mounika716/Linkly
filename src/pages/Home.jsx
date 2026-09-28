import { useState } from "react";
import ShortenerCard from "../components/url/ShortenerCard";
import ResultCard from "../components/url/ResultCard";
import Galaxy from "../components/react-bits/Galaxy";
import BlurText from "../components/react-bits/BlurText";
import ShinyText from "../components/react-bits/ShinyText";
import "./Home.css";

export default function Home() {
  const [result, setResult] = useState(null);

  const scrollToShortener = () => {
    document
      .getElementById("shortener")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <main className="home">
      <div
        className="home__galaxy"
        aria-hidden="true"
      >
        <Galaxy
          density={1.1}
          glowIntensity={0.35}
          saturation={0}
          hueShift={155}
          twinkleIntensity={0.35}
          rotationSpeed={0.08}
          starSpeed={0.35}
          speed={0.8}
          mouseInteraction
          transparent
        />
      </div>

      <div
        className="home__aurora home__aurora--one"
        aria-hidden="true"
      />

      <div
        className="home__aurora home__aurora--two"
        aria-hidden="true"
      />

      <nav className="home-nav">
        <a
          className="brand"
          href="/"
          aria-label="Linkly home"
        >
          <span className="brand-mark">
            ↗
          </span>

          <span className="brand-name">
            LINKLY
          </span>
        </a>

        <div className="home-nav__links">
          <a href="#features">
            Features
          </a>

          <a href="#analytics">
            Analytics
          </a>

          <a
            href="/login"
            className="nav-signin"
          >
            Sign in
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__badge">
          <span className="hero__badge-dot" />

          <ShinyText
            text="SIMPLE LINK MANAGEMENT"
            speed={3}
            className="hero__shiny"
          />
        </div>

        <div className="hero__title">
          <BlurText
            text="Shorten."
            delay={80}
            animateBy="letters"
            direction="top"
            className="hero__line"
          />

          <BlurText
            text="Share. Track."
            delay={45}
            animateBy="letters"
            direction="top"
            className="hero__line hero__line--accent"
          />
        </div>

        <p className="hero__description">
          Transform long, messy URLs into clean
          links built for sharing, tracking,
          and growth.
        </p>

        <div className="hero__signals">
          <span>
            <i />
            Fast creation
          </span>

          <span>
            <i />
            Built-in analytics
          </span>

          <span>
            <i />
            Clean sharing
          </span>
        </div>

        <button
          type="button"
          className="hero__cta"
          onClick={scrollToShortener}
        >
          Create a short link
          <span aria-hidden="true">
            ↓
          </span>
        </button>
      </section>

      <section
        className="workspace"
        id="features"
      >
        <div
          id="shortener"
          className="workspace__anchor"
          aria-hidden="true"
        />

        <div
          className="workspace__glow"
          aria-hidden="true"
        />

        <ShortenerCard
          onResult={setResult}
        />

        <ResultCard result={result} />
      </section>

      <section
        className="stats"
        id="analytics"
      >
        <div className="stats__heading">
          <span>
            LINKLY IN NUMBERS
          </span>

          <ShinyText
            text="Built to keep sharing simple."
            speed={4}
            className="stats__shiny"
          />
        </div>

        <div className="stats__grid">
          <div className="stat">
            <strong>12.4K</strong>
            <span>
              Links shortened
            </span>
          </div>

          <div className="stat">
            <strong>8.9K</strong>
            <span>
              Active users
            </span>
          </div>

          <div className="stat">
            <strong>99.9%</strong>
            <span>
              Platform uptime
            </span>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer__brand">
          <span className="footer-mark">
            ↗
          </span>

          <span>LINKLY</span>
        </div>

        <span className="home-footer__copy">
          Clean links. Better sharing.
        </span>

        <span className="home-footer__status">
          <i />
          All systems operational
        </span>
      </footer>
    </main>
  );
}