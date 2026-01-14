import React, { useState, useEffect, useRef } from "react";
import { AppQuestion } from "./data/QuestionLoadUtil";
import { TestMode } from "./App"; // Import the type

interface TestInterfaceProps {
  questions: AppQuestion[][];

  // New Props from Lifted State
  sectionNumber: number;
  setSectionNumber: React.Dispatch<React.SetStateAction<number>>;
  testMode: TestMode;

  // Modal Props
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmationTitle: React.Dispatch<React.SetStateAction<string>>;
  setConfirmationMessage: React.Dispatch<React.SetStateAction<string>>;
  setConfirmAction: React.Dispatch<React.SetStateAction<() => void>>;
  setCancelAction: React.Dispatch<React.SetStateAction<() => void>>;
}

export const TestInterface: React.FC<TestInterfaceProps> = (props) => {
  const { questions, sectionNumber, setSectionNumber, testMode } = props;

  // --- LOCAL STATE ---
  const [questionNumber, setQuestionNumber] = useState<number>(0);

  const [questionContext, setQuestionContext] = useState<string[]>([]);
  const [questionProblem, setQuestionProblem] = useState<string>("");
  const [questionAnswers, setQuestionAnswers] = useState<string[]>([]);
  const [rightPaneHidden, setRightPaneHidden] = useState<boolean>(false);

  // State initialization only runs once on mount.
  // We keep this local so answers persist until App unmounts TestInterface.
  const [eliminated, setEliminated] = useState<boolean[][][]>(() =>
    questions.map((section) =>
      section.map((q) => Array(q.answers.length).fill(false))
    )
  );
  const [selectedAnswers, setSelectedAnswers] = useState<number[][]>(
    () => questions.map((section) => Array<number>(section.length).fill(-1)) // Fill -1 for no answer
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[][]>(() =>
    questions.map((section) => Array<boolean>(section.length).fill(false))
  );

  // derived variables for current question
  const currentQuestion = questions[sectionNumber][questionNumber];
  const userSelectedIndex = selectedAnswers[sectionNumber][questionNumber];
  const correctIndex = currentQuestion.label;
  const isCorrect = userSelectedIndex === correctIndex;

  const navScrollRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---

  // Sync data when indices change
  useEffect(() => {
    if (questions[sectionNumber] && questions[sectionNumber][questionNumber]) {
      const currentQ = questions[sectionNumber][questionNumber];
      setQuestionContext(currentQ.context.split("\n\n"));
      setQuestionProblem(currentQ.question);
      setQuestionAnswers(currentQ.answers);
    }
  }, [sectionNumber, questionNumber, questions]);

  // Auto-scroll navigation
  useEffect(() => {
    if (navScrollRef.current) {
      const activeBtn = navScrollRef.current.children[
        questionNumber
      ] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [questionNumber, sectionNumber]);

  // Reset question number when section changes (e.g. forced by Timer in App)
  useEffect(() => {
    if (testMode !== "REVIEW") {
      setQuestionNumber(0);
    }
  }, [sectionNumber]);

  useEffect(() => {
    if (testMode === "REVIEW") {
      setQuestionNumber(0);
    }
  }, [testMode]);

  // --- HANDLERS ---

  const toggleEliminated = (index: number) => {
    if (testMode !== "RUNNING") return; // Disable interaction if paused/review
    setEliminated((prev) => {
      const newEliminated = [...prev];
      newEliminated[sectionNumber] = [...newEliminated[sectionNumber]];
      newEliminated[sectionNumber][questionNumber] = [
        ...newEliminated[sectionNumber][questionNumber],
      ];
      newEliminated[sectionNumber][questionNumber][index] =
        !newEliminated[sectionNumber][questionNumber][index];
      return newEliminated;
    });
  };

  const selectAnswer = (answerIndex: number) => {
    if (testMode !== "RUNNING") return; // Disable interaction if paused/review
    setSelectedAnswers((prev) => {
      const newSelectedAnswers = [...prev];
      newSelectedAnswers[sectionNumber] = [
        ...newSelectedAnswers[sectionNumber],
      ];
      if (newSelectedAnswers[sectionNumber][questionNumber] == answerIndex) {
        newSelectedAnswers[sectionNumber][questionNumber] = -1; // null out if click twice
      } else {
        newSelectedAnswers[sectionNumber][questionNumber] = answerIndex;
      }
      return newSelectedAnswers;
    });
  };

  const toggleFlagQuestion = () => {
    if (testMode !== "RUNNING") return;
    setFlaggedQuestions((prev) => {
      const newFlaggedQuestions = [...prev];
      newFlaggedQuestions[sectionNumber] = [
        ...newFlaggedQuestions[sectionNumber],
      ];
      newFlaggedQuestions[sectionNumber][questionNumber] =
        !newFlaggedQuestions[sectionNumber][questionNumber];
      return newFlaggedQuestions;
    });
  };

  const handleNext = () => {
    const currentSectionLength = questions[sectionNumber].length;
    if (questionNumber < currentSectionLength - 1) {
      setQuestionNumber((n) => n + 1);
    } else if (sectionNumber < questions.length - 1) {
      // Logic for moving to next section
      const confirmNextAction = () => {
        props.setShowConfirm(false);
        setSectionNumber((s) => s + 1); // Uses Prop
        setQuestionNumber(0);
      };
      const cancelNextAction = () => {
        props.setShowConfirm(false);
      };

      props.setConfirmAction(() => confirmNextAction);
      props.setCancelAction(() => cancelNextAction);
      props.setConfirmationTitle("Move On To Next Section?");
      props.setConfirmationMessage(
        "Once you move on to the next section you will not be able to return and the timer will reset!"
      );
      props.setShowConfirm(true);
    }
  };

  const handlePrev = () => {
    if (questionNumber > 0) {
      setQuestionNumber((n) => n - 1);
    }
    if (testMode === "REVIEW" && questionNumber === 0 && sectionNumber > 0) {
      setSectionNumber((s) => s - 1);
      setQuestionNumber(questions[sectionNumber - 1].length - 1);
    }
  };

  const getNumberCorrect = (section: number) => {
    const sectionScore = questions[section].reduce((count, q, index) => {
      const userAns = selectedAnswers[section][index];
      const correctAns = q.label;
      return count + (userAns === correctAns ? 1 : 0);
    }, 0);
    return sectionScore;
  };

  // --- RENDER HELPERS ---

  // If Paused, show overlay
  if (testMode === "PAUSED") {
    return (
      <div
        className="App-body"
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h2>Test Paused</h2>
        <p>Press "Resume" in the header to continue.</p>
      </div>
    );
  }

  // Helper to determine answer styling
  const getAnswerClassName = (
    answerIndex: number,
    correctIndex: number,
    userSelectedIndex: number
  ) => {
    const baseClass =
      "answer-decoy-btn" + (testMode === "REVIEW" ? " disabled" : "");

    // REVIEW MODE LOGIC
    if (testMode === "REVIEW") {
      if (answerIndex === correctIndex) {
        return `${baseClass} correct`; // Always highlight correct answer in Green
      }
      if (answerIndex === userSelectedIndex && answerIndex !== correctIndex) {
        return `${baseClass} incorrect`; // Highlight user's wrong choice in Red
      }
      if (eliminated[sectionNumber][questionNumber][answerIndex]) {
        return `${baseClass} eliminated`;
      }
      return baseClass; // Neutral for other unselected options
    }

    // RUNNING MODE LOGIC (Standard selection)
    if (userSelectedIndex === answerIndex) {
      return `${baseClass} selected`;
    }

    // ELIMINATION LOGIC (Only strictly necessary in Running, but fine to keep visible)
    if (eliminated[sectionNumber][questionNumber][answerIndex]) {
      return `${baseClass} eliminated`;
    }

    return baseClass;
  };

  // If Full Review, show the summary dashboard
  if (testMode === "FULL_REVIEW") {
    // Helper to calculate score for a specific section index
    const getNumberCorrect = (sIdx: number) => {
      return questions[sIdx].reduce((count, q, qIdx) => {
        const userAns = selectedAnswers[sIdx][qIdx];
        return count + (userAns === q.label ? 1 : 0);
      }, 0);
    };

    return (
      <div
        className="App-body"
        style={{ overflowY: "auto", flexDirection: "column", padding: "2rem" }}
      >
        <h2>Test Results</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {questions.map((section, sIdx) => {
            const score = getNumberCorrect(sIdx);
            const total = section.length;
            const pct = Math.round((score / total) * 100);

            return (
              <div key={sIdx} className="summary-card">
                <div className="summary-score">
                  <strong>Section {sIdx + 1}</strong>
                  <div style={{ float: "right" }}>
                    {score}/{total} ({pct}%)
                  </div>
                </div>

                {section.map((q, qIdx) => {
                  const userAnsIdx = selectedAnswers[sIdx][qIdx];
                  const correctIdx = q.label;
                  const isCorrect = userAnsIdx === correctIdx;
                  const isSkipped = userAnsIdx === -1;

                  // Determine Color
                  let color = "#ff5252"; // Default Red (Wrong)
                  if (isCorrect) color = "#69f0ae"; // Green (Correct)
                  if (isSkipped) color = "#ffb74d"; // Orange (Skipped)

                  return (
                    <div key={qIdx} className="summary-item" style={{ color }}>
                      <span>Q{qIdx + 1}:</span>
                      <span>
                        {/* Show User Selection */}
                        {isSkipped
                          ? "Skipped"
                          : String.fromCharCode(65 + userAnsIdx)}

                        {/* If wrong, show correct answer */}
                        {!isCorrect && !isSkipped && (
                          <span style={{ color: "#aaa", marginLeft: "8px" }}>
                            (Correct: {String.fromCharCode(65 + correctIdx)})
                          </span>
                        )}
                        {/* If skipped, show correct answer */}
                        {isSkipped && (
                          <span style={{ color: "#aaa", marginLeft: "8px" }}>
                            (Ans: {String.fromCharCode(65 + correctIdx)})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "2rem",
            padding: "1rem 2rem",
            fontSize: "1.2rem",
          }}
        >
          Return to Menu
        </button>
      </div>
    );
  }

  // STANDARD TEST VIEW
  return (
    <div className="App-body">
      <aside className={"pane left" + (rightPaneHidden ? " expanded" : "")}>
        <button
          className="mode-buttons"
          onClick={() => setRightPaneHidden((prev) => !prev)}
        >
          {rightPaneHidden ? "UNHIDE QUESTIONS" : "HIDE QUESTIONS"}
        </button>
        {questionContext.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </aside>

      {!rightPaneHidden && (
        <main className="pane right">
          <div className="question-toolbar">
            <span className="question-label">
              Section {sectionNumber + 1} • Question {questionNumber + 1}
            </span>
            {testMode === "REVIEW" ? (
              <span className="question-label">
                {getNumberCorrect(sectionNumber)} /{" "}
                {questions[sectionNumber].length} Correct
              </span>
            ) : (
              <></>
            )}

            <button
              className={`flag-btn ${
                flaggedQuestions[sectionNumber][questionNumber] ? "active" : ""
              }`}
              onClick={toggleFlagQuestion}
              title="Mark this question for review"
              disabled={testMode === "REVIEW"}
            >
              {/* Simple SVG Flag Icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: "8px" }}
              >
                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
              </svg>
              {flaggedQuestions[sectionNumber][questionNumber]
                ? "Flagged"
                : "Flag for Review"}
            </button>
          </div>

          {testMode === "REVIEW" && (
            <div
              className={`review-status ${isCorrect ? "correct" : "incorrect"}`}
            >
              {userSelectedIndex === -1
                ? "UNANSWERED"
                : isCorrect
                ? "CORRECT"
                : "INCORRECT"}
            </div>
          )}

          <div className="question-area">
            <p className="question-text">{questionProblem}</p>
            <div className="answers-container">
              {questionAnswers.map((a, i) => {
                const isSelected =
                  selectedAnswers[sectionNumber][questionNumber] === i;
                const isEliminated =
                  eliminated[sectionNumber][questionNumber][i];

                return (
                  <div className="answer-buttons" key={i}>
                    <button
                      className={
                        "answer-decoy-btn eliminate" +
                        (isEliminated ? " eliminated" : "") +
                        (testMode === "REVIEW" || isSelected ? " disabled" : "")
                      }
                      onClick={() => toggleEliminated(i)}
                      disabled={testMode === "REVIEW" || isSelected}
                    >
                      {isEliminated ? "Restore" : "X"}
                    </button>

                    <button
                      className={getAnswerClassName(
                        i,
                        correctIndex,
                        userSelectedIndex
                      )}
                      disabled={isEliminated || testMode === "REVIEW"}
                      onClick={() => selectAnswer(i)}
                    >
                      <span className="answer-letter">
                        {String.fromCharCode(65 + i)}.{" "}
                      </span>
                      {a}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="navigation-bar">
            <button
              className="nav-arrow"
              onClick={handlePrev}
              disabled={sectionNumber === 0 && questionNumber === 0}
            >
              &larr; Prev
            </button>

            <div className="question-scroller" ref={navScrollRef}>
              {questions[sectionNumber].map((q, index) => {
                // 1. Determine if this specific question (index) is correct
                const userAns = selectedAnswers[sectionNumber][index];
                const correctAns = q.label;
                const isCorrect = userAns === correctAns;

                // 2. Build the class string
                let navClass = "nav-number";

                // Always show active state
                if (index === questionNumber) navClass += " active";

                if (testMode === "REVIEW") {
                  // Review Mode: Green if correct, Red if wrong (or unanswered)
                  navClass += isCorrect ? " correct" : " incorrect";
                } else {
                  // Normal Mode: Show if answered or flagged
                  if (userAns !== -1) navClass += " answered";
                }
                if (flaggedQuestions[sectionNumber][index])
                  navClass += " flagged";

                return (
                  <button
                    key={index}
                    className={navClass}
                    onClick={() => setQuestionNumber(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <button
              className="nav-arrow"
              onClick={handleNext}
              disabled={
                sectionNumber === questions.length - 1 &&
                questionNumber === questions[sectionNumber].length - 1
              }
            >
              Next &rarr;
            </button>
          </div>
        </main>
      )}
    </div>
  );
};
