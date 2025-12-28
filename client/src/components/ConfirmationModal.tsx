import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Quit Test?",
  message = "Are you sure you want to quit? Your progress will be lost.",
}) => {
  if (!isOpen) return null;

  var cancelButton = (
    <button className="btn-cancel" onClick={onCancel}>
      Cancel
    </button>
  );
  if (message.includes("Strict Mode")) {
    // there is no cancel button if it is a message about strict mode moving you on
    cancelButton = (
      <button className="btn-confirm" onClick={onConfirm}>
        Confirm
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          {cancelButton}
          <button className="btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
