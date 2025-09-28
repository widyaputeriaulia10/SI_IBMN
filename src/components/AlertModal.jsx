import React, { useEffect } from "react";
import "../styles/AlertModal.css";

const iconMap = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const AlertModal = ({
  isOpen,
  onClose,
  type = "success",
  message = "Berhasil!",
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="alert-modal-overlay">
      <div className={`alert-modal alert-${type}`}>
        <span className="alert-icon">{iconMap[type]}</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AlertModal;
