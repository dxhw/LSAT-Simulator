import React, { useState, useEffect, useRef } from "react";

interface TimerProps {
  sectionNumber: number;
  isPaused: boolean;
  onTimeUp: () => void;
  hidden: boolean;
  limitedTimeRemaining: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  sectionNumber,
  isPaused,
  onTimeUp,
  hidden,
  limitedTimeRemaining,
}) => {
  const SECTION_TIME = 35 * 60;
  const [timeLeft, setTimeLeft] = useState(SECTION_TIME);

  // Ref to track if we have already triggered the "Time Up" callback for this section
  // This prevents the modal from popping up repeatedly every second after 0.
  const hasTriggeredRef = useRef(false);

  // Reset when section changes
  useEffect(() => {
    setTimeLeft(SECTION_TIME);
    hasTriggeredRef.current = false;
  }, [sectionNumber]);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = prev - 1;

        // Check if we hit exactly 0 and haven't triggered the callback yet
        if (newValue === 0 && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onTimeUp();
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused, onTimeUp]);

  // Handle formatting for both positive and negative numbers
  const formatTime = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    const timeString = `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;

    return isNegative ? `-${timeString}` : timeString;
  };

  const lowTime = timeLeft < 300 // cannot hide timer after 5 minutes
  if (lowTime) {limitedTimeRemaining()}
  
  return ((!hidden || lowTime) &&
    <div
      className="timer-display"
      style={{
        fontFamily: "monospace",
        fontSize: "1.2rem",
        fontWeight: "bold",
        // Red if under 1 minute OR negative
        color: lowTime ? "#ff4444" : "#ffffff",
      }}
    >
      TIME: {formatTime(timeLeft)}
    </div>
  );
};
