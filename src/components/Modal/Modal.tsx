import React from "react";
import { X } from "lucide-react";
import "./Modal.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    isClosing?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    isClosing = false,
}: ModalProps) {
    if (!isOpen) return null;

    // ponytail: reusable minimalist modal layout
    return (
        <div className={`modal-backdrop ${isClosing ? "closing" : ""}`}>
            <div className={`modal-card ${isClosing ? "closing" : ""}`}>
                <div className="modal-header">
                    <div className="modal-header-title-container">
                        {icon}
                        <span className="modal-title">{title}</span>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
