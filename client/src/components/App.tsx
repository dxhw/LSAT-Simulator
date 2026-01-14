import "../styles/App.css";
import { useState } from "react";
import { loadQuestions, AppQuestion, TestType } from "./data/QuestionLoadUtil";
import { StartScreen, TimingMode } from "./StartScreen";
import { TestInterface } from "./TestInterface";
import { ConfirmationModal } from "./ConfirmationModal";
import { Timer } from "./Timer";

export type TestMode = "MENU" | "RUNNING" | "PAUSED" | "REVIEW" | "FULL_REVIEW";

function App() {
  const [testMode, setTestMode] = useState<TestMode>("MENU");
  const [questions, setQuestions] = useState<AppQuestion[][]>([]);
  const [sectionNumber, setSectionNumber] = useState<number>(0);

  // NEW: Store the selected timing mode
  const [timingMode, setTimingMode] = useState<TimingMode>("STRICT");
  const [hideTimer, setHideTimer] = useState<boolean>(false);
  const [hideTimerButtonAvailable, setHideTimerButtonAvailable] =
    useState<boolean>(true);

  // Modal State
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmationTitle, setConfirmationTitle] = useState<string>("");
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [cancelAction, setCancelAction] = useState<() => void>(() => {});

  // --- HELPER: Move to Next Section ---
  const moveToNextSection = () => {
    if (sectionNumber < questions.length - 1) {
      setSectionNumber((s) => s + 1);
      setShowConfirm(false);
    } else {
      // If it's the last section, go to review
      setTestMode("REVIEW");
      setSectionNumber(0);
      setShowConfirm(false);
    }
  };

  // --- HANDLER: Start Test ---
  const handleStartTest = (type: TestType, mode: TimingMode) => {
    const loadedData = loadQuestions(type);
    setQuestions(loadedData);
    setTimingMode(mode); // Save the mode
    setSectionNumber(0);
    setTestMode("RUNNING");
  };

  // --- HANDLER: Time Up ---
  const handleTimeUp = () => {
    // 1. STRICT MODE LOGIC
    if (timingMode === "STRICT") {
      setConfirmationTitle("Time is Up!");
      setConfirmationMessage(
        "Strict Mode: You must move to the next section now."
      );

      // Both Confirm (OK) and Cancel (attempt to close) force the move
      setConfirmAction(() => () => moveToNextSection());
      setCancelAction(() => () => moveToNextSection());

      setShowConfirm(true);
    }
    // 2. FLEXIBLE MODE LOGIC
    else {
      setConfirmationTitle("Time is Up!");
      setConfirmationMessage(
        "35 Minutes have passed. Confirm to move on or Cancel to keep working (overtime)"
      );

      // Confirm: Move On
      setConfirmAction(() => () => moveToNextSection());

      // Cancel: Keep Working (Just close modal, timer continues negatively)
      setCancelAction(() => () => setShowConfirm(false));

      setShowConfirm(true);
    }
  };

  const togglePause = () => {
    if (testMode === "RUNNING") setTestMode("PAUSED");
    else if (testMode === "PAUSED") setTestMode("RUNNING");
  };

  const toggleTimerHide = () => {
    setHideTimer((prev) => !prev);
  };

  const handleEndSectionRequest = () => {
    setConfirmationTitle("End Section Early?");
    setConfirmationMessage(
      "Are you sure you want to finish this section? You will not be able to return to it."
    );

    setConfirmAction(() => () => moveToNextSection());
    setCancelAction(() => () => setShowConfirm(false));
    setShowConfirm(true);
  };

  const handleStopRequest = () => {
    setConfirmationTitle("Finish Test?");
    setConfirmationMessage(
      "Are you sure you want to stop the timer and review your answers?"
    );
    setConfirmAction(() => () => {
      setSectionNumber(0);
      setTestMode("REVIEW");
      setShowConfirm(false);
    });
    setCancelAction(() => () => setShowConfirm(false));
    setShowConfirm(true);
  };

  const handleFullReviewRequest = () => {
    setTestMode("FULL_REVIEW");
  };

  const requestReset = () => {
    if (testMode !== "MENU") {
      setConfirmationTitle("Quit Test?");
      setConfirmationMessage(
        "Are you sure you want to quit? Your progress will be lost."
      );
      setConfirmAction(() => () => {
        setTestMode("MENU");
        setQuestions([]);
        setSectionNumber(0);
        setShowConfirm(false);
      });
      setCancelAction(() => () => setShowConfirm(false));
      setShowConfirm(true);
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1
          className="header"
          onClick={requestReset}
          style={{ cursor: testMode !== "MENU" ? "pointer" : "default" }}
        >
          LSAT Practice Test
        </h1>

        {testMode !== "MENU" && (
          <div className="header-controls">
            {!testMode.includes("REVIEW") && hideTimerButtonAvailable && (
              <button onClick={toggleTimerHide} style={{ minWidth: "4rem" }}>
                {hideTimer ? "UNHIDE TIMER" : "HIDE TIMER"}
              </button>
            )}
            {!testMode.includes("REVIEW") && (
              <Timer
                sectionNumber={sectionNumber}
                isPaused={testMode === "PAUSED"}
                onTimeUp={handleTimeUp} // Pass the handler
                hidden={hideTimer}
                limitedTimeRemaining={() => setHideTimerButtonAvailable(false)}
              />
            )}
            {!testMode.includes("REVIEW") && (
              <button onClick={togglePause} style={{ minWidth: "4rem" }}>
                {testMode === "PAUSED" ? "RESUME" : "PAUSE"}
              </button>
            )}
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              {!testMode.includes("REVIEW") && (
                <button onClick={handleStopRequest} className="btn-stop">
                  END TEST & REVIEW
                </button>
              )}
              {!testMode.includes("REVIEW") &&
                sectionNumber < questions.length - 1 && (
                  <button
                    onClick={handleEndSectionRequest}
                    style={{ minWidth: "100px" }}
                  >
                    END SECTION
                  </button>
                )}
            </div>
            {testMode === "REVIEW" && (
              <div
                style={{
                  display: "flex",
                  color: "#4caf50",
                  fontWeight: "bold",
                }}
              >
                <button
                  onClick={() => setTestMode("FULL_REVIEW")}
                  className="btn-stop"
                >
                  GO TO FULL REVIEW
                </button>
                REVIEW MODE
              </div>
            )}
            {testMode === "FULL_REVIEW" && (
              <button
                onClick={() => setTestMode("REVIEW")}
                className="btn-stop"
              >
                RETURN TO QUESTION-BY-QUESTION REVIEW
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onConfirm={confirmAction}
        onCancel={cancelAction}
        title={confirmationTitle}
        message={confirmationMessage}
      />

      {testMode === "MENU" ? (
        <StartScreen onStart={handleStartTest} />
      ) : (
        <TestInterface
          questions={questions}
          sectionNumber={sectionNumber}
          setSectionNumber={setSectionNumber}
          testMode={testMode}
          // Pass Modal setters down for the manual "Next" button inside TestInterface
          setShowConfirm={setShowConfirm}
          setConfirmationMessage={setConfirmationMessage}
          setConfirmationTitle={setConfirmationTitle}
          setConfirmAction={setConfirmAction}
          setCancelAction={setCancelAction}
        />
      )}
    </div>
  );
}

export default App;
