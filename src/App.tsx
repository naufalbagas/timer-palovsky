import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css";

import Home from "./pages/Home/Home";
import Community from "./pages/Community";
import Timer from "./pages/Timer/Timer";

const PAGES: Record<string, React.ComponentType> = { Home, Community, Timer, };

export default function App() {
    const getInitialTheme = (): "light" | "dark" => {
        // dapetin tema terakhir dari localStorage
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
        //fallback ke preferensi sistem
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    };
    const [themeState, setThemeState] = useState(getInitialTheme);

    // update data-theme html dan save ke localStorage kalau state berubah
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", themeState);
        localStorage.setItem("theme", themeState);
    }, [themeState]);

    // active link default adalah home
    const [pageState, setpageState] = useState("Home");
    // kalau nanti active link udah berubah tapi null, fallback ke home, 
    const ActivePageComponent = PAGES[pageState] || Home;

    return (
        <div className="app-layout">
            <Sidebar
                theme={themeState}
                setThemeState={setThemeState}
                activePage={pageState}
                setPageState={setpageState}
            />
            <main className="app-main-content">
                <ActivePageComponent />
            </main>
        </div>
    );
}
