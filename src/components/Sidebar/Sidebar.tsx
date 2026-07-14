import { useState, useEffect } from "react";
import { Heart, Sun, Moon, Clock, Menu } from "lucide-react";
import logo from "../../assets/logo.svg";
import "./Sidebar.css";
import Toggle from "../Toggle/Toggle"
import SolidButton from "../Button/Solid/SolidButton";
import OutlineButton from "../Button/Outline/OutlineButton";

/**
 * @param theme - di-passing ke @function ThemeToggle
 * @param setThemeState - di-passing ke @function ThemeToggle
 * @param activePage - di-passing ke @function NavLinks
 * @param setPageState - di-passing ke @function NavLinks
 */
interface SidebarProps {
    theme: "light" | "dark";
    setThemeState: (t: "light" | "dark") => void;
    activePage?: string;
    setPageState?: (link: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}
export default function Sidebar({ theme, setThemeState, activePage, setPageState, isCollapsed, setIsCollapsed }: SidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        handleResize(); // run on initial mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
                <div className="sidebar-container">
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open Menu">
                        <Menu size={24} />
                    </button>
                    
                    <div className={`sidebar-drawer ${isMobileMenuOpen ? "open" : ""}`}>
                        <div className="sidebar-brand">
                            <Brand clickFunc={() => {
                                if (window.innerWidth >= 768) {
                                    setIsCollapsed(!isCollapsed);
                                } else {
                                    setIsMobileMenuOpen(false);
                                }
                            }} />
                        </div>
                        <div className="sidebar-nav">
                            <NavLinks activePage={activePage} setPageState={(page) => {
                                setPageState?.(page);
                                setIsMobileMenuOpen(false);
                            }} />
                        </div>
                    </div>
                    
                    <div className="sidebar-footer">
                        <Toggle clickFunc={() => setThemeState(theme === "light" ? "dark" : "light")}
                            leftIcon={Sun}
                            rightIcon={Moon}
                            isLeftCondition={theme === "light"}>
                        </Toggle>
                        <div className="sidebar-cta">
                            <SolidButton
                                className="btn-support"
                                icon={Heart}
                                label="Support Us!"
                                clickFunc={() => { }}
                                hoverIconColor="#f43f5e"
                            />
                        </div>
                    </div>
                </div>
            </aside>
            {isMobileMenuOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
            )}
        </>
    );
}


/**
 * =================================
 * Brand Section
 * =================================
 */
interface BrandProps {
    clickFunc?: () => void;
}
function Brand({ clickFunc }: BrandProps) {
    return (
        <a href="/"
            className="brand-section"
            onClick={(e) => {
                if (clickFunc) {
                    e.preventDefault();
                    clickFunc();
                }
            }}
        >
            <img src={logo} alt="Palovsky Logo" className="logo" />
            <span className="brand-name">Palovsky</span>
        </a>
    );
}

/**
 * =================================
 * Navigation Links Section
 * =================================
 */
const NAV_ITEMS = [
    { id: "Timer", label: "Timer", icon: Clock },
];
interface NavLinksProps {
    activePage?: string;
    setPageState?: (page: string) => void;
}
function NavLinks({ activePage = "Home", setPageState }: NavLinksProps) {
    return (
        /** nav -> ul -> li -> navigation button */
        <nav aria-label="Sidebar Navigation">
            <ul className="nav-section">
                {NAV_ITEMS.map((item) => {
                    return (
                        <li key={item.id}>
                            <OutlineButton
                                isActive={activePage === item.id}
                                clickFunc={() => setPageState?.(item.id)}
                                label={item.label}
                                icon={item.icon} />
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}