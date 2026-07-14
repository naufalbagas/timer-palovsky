import type { LucideProps } from "lucide-react";
import "./OutlineButton.css"

interface OBProps {
    
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    label: string;
    clickFunc: () => void;
    isActive?: boolean;
}
export default function OutlineButton({isActive, clickFunc, label, icon}: OBProps) {
    const Icon = icon;
    return (
        <button
            className={`nav-btn ${isActive ? "active" : ""}`}
            onClick={clickFunc}
            type="button"
        >
            <div className="nav-btn-content">
                <Icon size={18} className="nav-icon" />
                <span>{label}</span>
            </div>
        </button>
    );
}