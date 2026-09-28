import { useState } from "react";
import FuseButton from "../components/react-bits/FuseButton";

export default function FuseTest() {
  const [message, setMessage] = useState("Nothing committed yet.");

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
          width: "min(650px, 100%)",
          padding: "36px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <h1>Fuse Button Test</h1>

        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            marginBottom: "35px",
          }}
        >
          This will become the main “Shorten URL” action.
        </p>

        <FuseButton
          label="Shorten URL"
          undoLabel="Undo"
          doneLabel="Created"
          size="lg"
          commitOn="fuseEnd"
          onCommit={() => setMessage("URL shortening committed!")}
          onUndo={() => setMessage("Action undone.")}
          onPhaseChange={(phase) => {
            console.log("Fuse phase:", phase);
          }}
        />

        <div
          style={{
            marginTop: "35px",
            padding: "18px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}