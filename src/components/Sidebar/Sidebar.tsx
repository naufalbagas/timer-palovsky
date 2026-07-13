import { Heart, Sun, Moon, Clock} from "lucide-react";
import logo from "../../assets/logo.svg";
import NavigationButton from "../Button/Navigation/NavigationButton"
import "./Sidebar.css";
import Toggle from "../Toggle/Toggle"
import SolidButton from "../Button/Solid/SolidButton";

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
}
export default function Sidebar({theme, setThemeState, activePage, setPageState}: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-container">
                {/** Brand Section */}
                <div className="sidebar-brand">
                    <Brand clickFunc={() => setPageState?.("Timer")} />
                </div>
                {/** Navigation Section */}
                <div className="sidebar-nav">
                    <NavLinks activePage={activePage} setPageState={setPageState} />
                </div>
                {/** Footer Section */}
                <div className="sidebar-footer">
                    {/* <ThemeToggle theme={theme} setThemeState={setThemeState} /> */}
                    <Toggle clickFunc={() => setThemeState(theme === "light" ? "dark" : "light")} 
                        leftIcon={Sun} 
                        rightIcon={Moon} 
                        isLeftCondition={theme === "light"}></Toggle>
                    <div className="sidebar-cta">
                       <SolidButton icon={Heart} label="Support Us!" clickFunc={()=>{}} />
                    </div>
                </div>
            </div>
        </aside>
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
function Brand({clickFunc}: BrandProps) {
    return (
        <a  href="/"
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
    {id: "Timer", label: "Timer", icon: Clock},
];
interface NavLinksProps {
    activePage?: string;
    setPageState?: (page: string) => void;
}
function NavLinks({activePage = "Home", setPageState}: NavLinksProps) {
    return (
        /** nav -> ul -> li -> navigation button */
        <nav aria-label="Sidebar Navigation">
            <ul className="nav-section">
                {NAV_ITEMS.map((item) => {
                    return (
                        <li key={item.id}>
                            <NavigationButton 
                                activePage={activePage} 
                                clickFunc={() => setPageState?.(item.id)} 
                                itemID={item.id} 
                                label={item.label} 
                                icon={item.icon}/>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}