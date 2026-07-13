import type { LucideProps } from "lucide-react";
import "./NavigationButton.css"

interface NBProps {
    activePage?: string;
    clickFunc: () => void;
    itemID?: string;
    label: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}
export default function NavigationButton({activePage, clickFunc, itemID, label, icon}: NBProps) {
    const Icon = icon;
    return (
        <button
            className={`nav-btn ${activePage === itemID ? "active" : ""}`}
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