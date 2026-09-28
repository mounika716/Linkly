import { useState } from "react";
import SquishSwitch from "../components/react-bits/SquishSwitch";

export default function SwitchTest() {
  const [customAlias, setCustomAlias] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [password, setPassword] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(600px, 100%)",
          padding: "32px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>Squish Switch Test</h1>

        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            marginBottom: "32px",
          }}
        >
          These switches will later control URL-shortener options.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <SquishSwitch
            checked={customAlias}
            onChange={setCustomAlias}
            label="Custom alias"
            ariaLabel="Enable custom alias"
          />

          <SquishSwitch
            checked={analytics}
            onChange={setAnalytics}
            label="Analytics tracking"
            ariaLabel="Enable analytics tracking"
          />

          <SquishSwitch
            checked={password}
            onChange={setPassword}
            label="Password protection"
            ariaLabel="Enable password protection"
          />
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            fontSize: "14px",
            lineHeight: 1.8,
          }}
        >
          <div>Custom alias: {customAlias ? "ON" : "OFF"}</div>
          <div>Analytics: {analytics ? "ON" : "OFF"}</div>
          <div>Password: {password ? "ON" : "OFF"}</div>
        </div>
      </div>
    </div>
  );
}