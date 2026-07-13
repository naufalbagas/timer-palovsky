import type { LucideProps } from "lucide-react";
import "./SolidButton.css";

interface SBProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    label: string;
    clickFunc: () => void;
}

export default function SolidButton({ icon: Icon, label, className = "", type = "button", clickFunc, ...props }: SBProps) {
    return (
        <button className={`solid-btn ${className}`} type={type} {...props}
            onClick={clickFunc}>
            {Icon && <Icon size={18} className="icon" />}
            <span className="label">{label}</span>
        </button>
    );
}