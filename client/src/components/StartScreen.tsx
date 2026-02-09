import React, { useState } from "react";
import { TestType } from "./data/QuestionLoadUtil";

export type TimingMode = "STRICT" | "FLEXIBLE";

interface StartScreenProps {
  onStart: (type: TestType, mode: TimingMode, seed: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [timingMode, setTimingMode] = useState<TimingMode>("FLEXIBLE");
  const [testSeed, setTestSeed] = useState<string>("");

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

      {/* 2. Add test seed */}
      <div className="mode-buttons">
        <h3>
          2. Add A Test Seed (Optional — For Taking The Same Test As Others)
        </h3>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Enter a test seed (e.g. 'my-test-123')"
            value={testSeed}
            onChange={(e) => setTestSeed(e.target.value)}
            style={{ padding: "0.5rem", width: "300px" }}
          />
        </div>
      </div>

      {/* 3. Test Type Selection */}
      <div className="mode-buttons">
        <h3>3. Start Practice Test</h3>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => onStart("FULL", timingMode, testSeed)}>
            Full Test
            <br />
            (4 Sections — Mix of LR + RC)
          </button>
          <button onClick={() => onStart("LR", timingMode, testSeed)}>
            Logical Reasoning
          </button>
          <button onClick={() => onStart("RC", timingMode, testSeed)}>
            Reading Comprehension
          </button>
          <button onClick={() => onStart("AR", timingMode, testSeed)}>
            (FOR FUN ONLY) <br />
            Analytical Reasoning
          </button>
        </div>
      </div>
    </div>
  );
};
