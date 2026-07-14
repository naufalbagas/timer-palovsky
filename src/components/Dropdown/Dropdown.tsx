import React, { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./Dropdown.css";

export interface DropdownItem<T> {
    value: T;
    label: string;
    actionIcon?: React.ReactNode;
    actionTitle?: string;
    onActionClick?: (value: T, e: React.MouseEvent) => void;
}

interface DropdownProps<T> {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    label: React.ReactNode;
    items: DropdownItem<T>[];
    onSelect: (value: T) => void;
    selectedValue?: T;
    className?: string; // e.g. "small"
    isClosing?: boolean;
    renameInput?: React.ReactNode; // Optional inline rename input field
    triggerPrefix?: React.ReactNode; // Optional prefix buttons
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Dropdown<T>({
    isOpen,
    onToggle,
    onClose,
    label,
    items,
    onSelect,
    selectedValue,
    className = "",
    isClosing = false,
    renameInput,
    triggerPrefix,
    containerRef,
}: DropdownProps<T>) {
    // ponytail: auto-close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose, containerRef]);

    return (
        <div className={`custom-dropdown-container ${className}`.trim()} ref={containerRef as any}>
            {renameInput ? (
                renameInput
            ) : (
                <div className="session-trigger-row" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}>
                    {triggerPrefix}
                    <button className={`custom-dropdown-btn ${className}`.trim()} onClick={onToggle}>
                        {label} <ChevronDown size={16} />
                    </button>
                </div>
            )}
            {isOpen && !renameInput && (
                <div className={`custom-dropdown-list ${className} ${isClosing ? "closing" : ""}`.trim()}>
                    {items.map((item, idx) => {
                        const isActive = selectedValue === item.value;
                        return (
                            <div
                                key={idx}
                                className={`custom-dropdown-item ${className} ${isActive ? "active" : ""}`.trim()}
                                onClick={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                            >
                                <span className="session-name-text">{item.label}</span>
                                {item.actionIcon && (
                                    <button
                                        className="session-delete-btn"
                                        title={item.actionTitle}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.onActionClick) {
                                                item.onActionClick(item.value, e);
                                            }
                                        }}
                                    >
                                        {item.actionIcon}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
