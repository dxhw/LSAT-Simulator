import React, { useState } from "react";
import { TestType } from "./data/QuestionLoadUtil";

export type TimingMode = "STRICT" | "FLEXIBLE";

interface StartScreenProps {
  onStart: (type: TestType, mode: TimingMode) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [timingMode, setTimingMode] = useState<TimingMode>("FLEXIBLE");

  return (
    <div
      className="start-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        marginTop: "auto",
      }}
    >
      {/* 1. Timing Mode Selection */}
      <div className="timing-selector">
        <h3>1. Select Timing Mode</h3>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => setTimingMode("FLEXIBLE")}
            className={timingMode === "FLEXIBLE" ? "selected-mode" : ""}
            style={{
              backgroundColor: timingMode === "FLEXIBLE" ? "#007bff" : "",
              borderColor: timingMode === "FLEXIBLE" ? "#4da3ff" : "",
            }}
          >
            Flexible (Allow Overtime)
          </button>
          <button
            onClick={() => setTimingMode("STRICT")}
            className={timingMode === "STRICT" ? "selected-mode" : ""}
            style={{
              backgroundColor: timingMode === "STRICT" ? "#d32f2f" : "",
              borderColor: timingMode === "STRICT" ? "#ff6659" : "",
            }}
          >
            Strict (Forced Move)
          </button>
        </div>
        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {timingMode === "STRICT"
            ? "When time is up, you will be forced to the next section."
            : "When time is up, you can choose to keep working (timer goes negative)."}
        </p>
      </div>

      <hr style={{ width: "50%", borderColor: "#444" }} />

      {/* 2. Test Type Selection */}
      <div className="mode-buttons">
        <h3>2. Start Practice Test</h3>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => onStart("FULL", timingMode)}>Full Test<br/>
          (4 Sections — Mix of LR + RC)</button>
          <button onClick={() => onStart("LR", timingMode)}>
            Logical Reasoning
          </button>
          <button onClick={() => onStart("RC", timingMode)}>
            Reading Comprehension
          </button>
          <button onClick={() => onStart("AR", timingMode)}>
            (FOR FUN ONLY) <br/>
            Analytical Reasoning
          </button>
        </div>
      </div>
    </div>
  );
};
