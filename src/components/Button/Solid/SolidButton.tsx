import type { LucideProps } from "lucide-react";
import "./SolidButton.css";

interface SBProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    label: string;
    clickFunc: () => void;
    hoverIconColor?: string;
}

export default function SolidButton({ 
    icon: Icon, 
    label, 
    className = "", 
    type = "button", 
    clickFunc, 
    hoverIconColor,
    style,
    ...props 
}: SBProps) {
    const customStyle = {
        ...style,
        ...(hoverIconColor && { "--solid-btn-hover-icon-color": hoverIconColor }),
    } as React.CSSProperties;

    return (
        <button 
            className={`solid-btn ${className}`} 
            type={type} 
            style={customStyle}
            onClick={clickFunc}
            {...props}
        >
            {Icon && <Icon size={18} className="icon"/>}
            <span className="label">{label}</span>
        </button>
    );
}