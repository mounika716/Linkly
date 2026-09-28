import { useState } from "react";
import StatusMark from "../components/react-bits/StatusMark";

export default function StatusTest() {
  const [status, setStatus] = useState("pending");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: "40px",
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
        <h1>Status Mark Test</h1>

        <div style={{ margin: "32px 0" }}>
          <StatusMark
            status={status}
            label={
              status === "pending"
                ? "Ready to shorten"
                : status === "running"
                  ? "Creating short URL"
                  : status === "done"
                    ? "URL created successfully"
                    : "Unable to create URL"
            }
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => setStatus("pending")}>
            Pending
          </button>

          <button onClick={() => setStatus("running")}>
            Running
          </button>

          <button onClick={() => setStatus("done")}>
            Done
          </button>

          <button onClick={() => setStatus("failed")}>
            Failed
          </button>
        </div>
      </div>
    </div>
  );
}