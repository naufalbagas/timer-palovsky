import type { LucideProps } from "lucide-react";
import "./Toggle.css"

interface PTProps {
    clickFunc: (...args: any[]) => void;
    leftIcon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    rightIcon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    isLeftCondition: boolean;
    ariaLabel?: string;
}
export default function PalovskyToggle({clickFunc, leftIcon, rightIcon, isLeftCondition, ariaLabel = "Toggle"}: PTProps) {
    const LeftIcon = leftIcon
    const RightIcon = rightIcon
    return (
        <button
            className={`switch ${isLeftCondition ? "is-left" : "is-right"}`}
            onClick={clickFunc}
            aria-label={ariaLabel}
            type="button"
        >
            <div className="switch-track">
                <span className="switch-icon-bg left-icon">
                    <LeftIcon size={12} fill="currentColor" />
                </span>
                <span className="switch-icon-bg right-icon">
                    <RightIcon size={12} fill="currentColor" />
                </span>
            </div>
            <span className="switch-thumb">
                {isLeftCondition ? (
                    <LeftIcon className="switch-icon" size={12} fill="currentColor" />
                ) : (
                    <RightIcon className="switch-icon" size={12} fill="currentColor" />
                )}
            </span>
        </button>
    );
}