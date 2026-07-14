import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Plus, X, Pencil, RefreshCw, Trash2, AlertTriangle, Eye } from "lucide-react";
import "./styles/Timer.css";
import "./styles/ClockCard.css";
import "./styles/OverviewCard.css";
import "./styles/SessionsCard.css";
import Modal from "../../components/Modal/Modal";
import Dropdown from "../../components/Dropdown/Dropdown";
import ScrambleImage from "../../features/scramble/ScrambleImage";
import { generateScramble } from "../../features/scramble/scramble";
import {
    loadSolves,
    saveSolve,
    saveSolves,
    updateSolve,
    loadSessions,
    saveSessions,
    loadActiveSession,
    saveActiveSession,
    computeStats,
    loadCubeType,
    saveCubeType,
    loadInspectionEnabled,
    saveInspectionEnabled,
    loadInputMethod,
    saveInputMethod,
    type Solve,
    type Session,
} from "../../features/storage/storage";

// Format manual input string (e.g. "13522" -> "01:35.22")
const formatManualInput = (inputStr: string) => {
    if (!inputStr) return { main: "00", ms: "00" };
    const padded = inputStr.padStart(2, "0");
    const msStr = padded.slice(-2);
    let sStr = "00";
    let mStr = "";
    let hStr = "";

    if (padded.length > 2) sStr = padded.slice(-4, -2).padStart(2, "0");
    if (padded.length > 4) mStr = padded.slice(-6, -4).padStart(2, "0");
    if (padded.length > 6) hStr = padded.slice(0, -6).padStart(2, "0");

    if (hStr) return { main: `${hStr}:${mStr}:${sStr}`, ms: msStr };
    if (mStr) return { main: `${mStr}:${sStr}`, ms: msStr };
    return { main: sStr, ms: msStr };
};

// Format timer milliseconds to display
const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    const msStr = milliseconds.toString().padStart(2, "0");
    const secStr = seconds.toString().padStart(2, "0");
    const minStr = minutes.toString().padStart(2, "0");
    const hrStr = hours.toString().padStart(2, "0");

    if (hours > 0) return { main: `${hrStr}:${minStr}:${secStr}`, ms: msStr };
    if (minutes > 0) return { main: `${minStr}:${secStr}`, ms: msStr };
    return { main: secStr, ms: msStr };
};

export default function Timer() {
    const [cubeType, setCubeType] = useState(() => loadCubeType());
    const [scramble, setScramble] = useState(() => generateScramble(loadCubeType()));

    useEffect(() => {
        saveCubeType(cubeType);
    }, [cubeType]);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSettingsClosing, setIsSettingsClosing] = useState(false);
    const [isCubeDropdownOpen, setIsCubeDropdownOpen] = useState(false);
    const [isDropdownClosing, setIsDropdownClosing] = useState(false);
    const [isInputMethodDropdownOpen, setIsInputMethodDropdownOpen] = useState(false);
    const [isInputMethodClosing, setIsInputMethodClosing] = useState(false);
    const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
    const [isVoiceDropdownClosing, setIsVoiceDropdownClosing] = useState(false);

    // ponytail: Multiple sessions state — initialized from localStorage
    const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
    const [activeSession, setActiveSession] = useState(() => loadActiveSession());
    const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
    const [isSessionDropdownClosing, setIsSessionDropdownClosing] = useState(false);
    const [renamingSession, setRenamingSession] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    // Persist sessions list and active session whenever they change
    useEffect(() => { saveSessions(sessions); }, [sessions]);
    useEffect(() => { saveActiveSession(activeSession); }, [activeSession]);

    const closeDropdownWithAnimation = useCallback(() => {
        setIsDropdownClosing(true);
        setTimeout(() => {
            setIsCubeDropdownOpen(false);
            setIsDropdownClosing(false);
        }, 150);
    }, []);

    const closeSettingsWithAnimation = useCallback(() => {
        setIsSettingsClosing(true);
        setTimeout(() => {
            setIsSettingsOpen(false);
            setIsSettingsClosing(false);
        }, 150);
    }, []);

    const closeInputMethodDropdownWithAnimation = useCallback(() => {
        setIsInputMethodClosing(true);
        setTimeout(() => {
            setIsInputMethodDropdownOpen(false);
            setIsInputMethodClosing(false);
        }, 150);
    }, []);

    const closeVoiceDropdownWithAnimation = useCallback(() => {
        setIsVoiceDropdownClosing(true);
        setTimeout(() => {
            setIsVoiceDropdownOpen(false);
            setIsVoiceDropdownClosing(false);
        }, 150);
    }, []);

    const closeSessionDropdownWithAnimation = useCallback(() => {
        setIsSessionDropdownClosing(true);
        setTimeout(() => {
            setIsSessionDropdownOpen(false);
            setIsSessionDropdownClosing(false);
        }, 150);
    }, []);

    const handleRenameConfirm = (oldId: string) => {
        const newName = renameValue.trim();
        if (!newName) {
            setRenamingSession(null);
            return;
        }

        // ponytail: unique name check (case-insensitive) excluding the current session
        const isDuplicate = sessions.some((s) => s.name.toLowerCase() === newName.toLowerCase() && s.id !== oldId);
        if (isDuplicate) {
            setConfirmDialog({
                title: "Duplicate Session Name",
                message: `Session name "${newName}" already exists! Please use a unique name.`,
                confirmText: "OK",
                cancelText: "", // ponytail: empty string hides the cancel button
                showIcon: true,
                onConfirm: () => {},
            });
            setRenamingSession(null);
            return;
        }

        // Update sessions list (keeps IDs unchanged)
        setSessions((prev) => prev.map((s) => (s.id === oldId ? { ...s, name: newName } : s)));
        setRenamingSession(null);
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent selecting the session

        const sessionObj = sessions.find((s) => s.id === sessionId);
        const sessionName = sessionObj?.name || "this session";

        setConfirmDialog({
            title: "Delete Session?",
            message: `Are you sure you want to delete "${sessionName}" and all its solves? This action is permanent and cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: () => {
                // ponytail: filter out deleted session
                const nextSessions = sessions.filter((s) => s.id !== sessionId);
                const finalSessions = nextSessions.length > 0 ? nextSessions : [{ id: "session-1", name: "Session 1" }];
                setSessions(finalSessions);
                saveSessions(finalSessions);

                // ponytail: remove all solves belonging to this session
                const nextSolves = solves.filter((s) => (s.session || "session-1") !== sessionId);
                setSolves(nextSolves);
                saveSolves(nextSolves);

                // ponytail: fallback active session if the deleted one was selected
                if (activeSession === sessionId) {
                    const fallbackSession = finalSessions[0];
                    setActiveSession(fallbackSession.id);
                    saveActiveSession(fallbackSession.id);
                }
            }
        });
    };

    // ponytail: delete a specific solve with a custom gamified confirmation pop up
    const handleDeleteSolve = (solveId: number) => {
        setConfirmDialog({
            title: "Delete Solve?",
            message: "Are you sure you want to permanently delete this solve?",
            confirmText: "Delete",
            cancelText: "Cancel",
            showIcon: true,
            confirmBtnClass: "btn-confirm",
            cancelBtnClass: "btn-cancel",
            onConfirm: () => {
                const nextSolves = solves.filter((s) => s.id !== solveId);
                setSolves(nextSolves);
                saveSolves(nextSolves);
                setSelectedSolve(null);
            },
        });
    };

    const handleCubeChangeCustom = (type: string) => {
        if (type === cubeType) return;

        // Check if there is at least one solve in the active session, but of a different cubeType
        const activeSolves = solves.filter((solve) => (solve.session || "session-1") === activeSession);
        const hasDifferentCube = activeSolves.some((solve) => solve.cubeType !== type);

        if (activeSolves.length > 0 && hasDifferentCube) {
            setConfirmDialog({
                title: "Different cube in one session!",
                message: "Different cube may affect your statistic performance. Add new session instead?",
                confirmText: "Add new session",
                cancelText: "Keep this session",
                showIcon: true,
                confirmBtnClass: "btn-add-session",
                cancelBtnClass: "btn-keep-session",
                onConfirm: () => {
                    const nextIdNumber = sessions.length + 1;
                    let newSessionName = `Session ${nextIdNumber}`;
                    let counter = nextIdNumber;
                    while (sessions.some((s) => s.name.toLowerCase() === newSessionName.toLowerCase())) {
                        counter++;
                        newSessionName = `Session ${counter}`;
                    }

                    const newSession = {
                        id: `session-${Date.now()}`,
                        name: newSessionName,
                    };

                    setSessions((prev) => [...prev, newSession]);
                    setActiveSession(newSession.id);
                    setCubeType(type);
                    setScramble(generateScramble(type));
                },
                onCancel: () => {
                    setCubeType(type);
                    setScramble(generateScramble(type));
                }
            });
        } else {
            setCubeType(type);
            setScramble(generateScramble(type));
        }
    };

    const handleNewSession = () => {
        const nextIdNumber = sessions.length + 1;
        let newSessionName = `Session ${nextIdNumber}`;
        let counter = nextIdNumber;
        while (sessions.some((s) => s.name.toLowerCase() === newSessionName.toLowerCase())) {
            counter++;
            newSessionName = `Session ${counter}`;
        }

        const newSession = {
            id: `session-${Date.now()}`,
            name: newSessionName,
        };

        setSessions([...sessions, newSession]);
        setActiveSession(newSession.id);
    };

    const activeSessionRef = useRef(activeSession);
    useEffect(() => {
        activeSessionRef.current = activeSession;
    }, [activeSession]);

    const [inspectionEnabled, setInspectionEnabled] = useState(() => loadInspectionEnabled());
    useEffect(() => {
        saveInspectionEnabled(inspectionEnabled);
    }, [inspectionEnabled]);

    const [inspectionVoice, setInspectionVoice] = useState<"male" | "female">(() => {
        const saved = localStorage.getItem("inspectionVoice");
        return saved === "female" ? "female" : "male";
    });
    useEffect(() => {
        localStorage.setItem("inspectionVoice", inspectionVoice);
    }, [inspectionVoice]);

    const [isInspecting, setIsInspecting] = useState(false);
    const [inspectionSeconds, setInspectionSeconds] = useState(15);
    const [inspectionPenalty, setInspectionPenalty] = useState<"none" | "+2" | "dnf">("none");

    const [inputMethod, setInputMethod] = useState<"timer" | "manual">(() => loadInputMethod());
    useEffect(() => {
        saveInputMethod(inputMethod);
    }, [inputMethod]);

    // ponytail: Custom confirmation dialog state
    interface ConfirmConfig {
        message: string;
        onConfirm: () => void;
        title?: string;
        confirmText?: string;
        cancelText?: string;
        showIcon?: boolean;
        confirmBtnClass?: string;
        cancelBtnClass?: string;
        onCancel?: () => void;
    }
    const [confirmDialog, setConfirmDialog] = useState<ConfirmConfig | null>(null);
    const [isConfirmClosing, setIsConfirmClosing] = useState(false);

    const closeConfirmWithAnimation = useCallback((callback?: () => void) => {
        setIsConfirmClosing(true);
        setTimeout(() => {
            setConfirmDialog(null);
            setIsConfirmClosing(false);
            if (callback) callback();
        }, 150);
    }, []);


    // Timer State
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [pendingSave, setPendingSave] = useState(false);

    const holdTimeoutRef = useRef<any>(null);
    const timerIntervalRef = useRef<any>(null);
    const startTimeRef = useRef<number>(0);

    // Manual State
    const [manualStr, setManualStr] = useState("");

    // Solves Data — initialized from localStorage
    const [solves, setSolves] = useState<Solve[]>(() => loadSolves());
    const [selectedSolve, setSelectedSolve] = useState<Solve | null>(null);
    const [showSolveActions, setShowSolveActions] = useState(false);
    const [descText, setDescText] = useState("");
    const [showScrambleOverlay, setShowScrambleOverlay] = useState(false);

    // Focus management for spacebar interaction
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const settingsContainerRef = useRef<HTMLDivElement>(null);
    const inputMethodDropdownRef = useRef<HTMLDivElement>(null);
    const sessionDropdownRef = useRef<HTMLDivElement>(null);
    const voiceDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                settingsContainerRef.current &&
                !settingsContainerRef.current.contains(e.target as Node)
            ) {
                setIsSettingsOpen(false);
                setIsSettingsClosing(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setShowSolveActions(false);
    }, [activeSession, cubeType]);

    useEffect(() => {
        if (selectedSolve) {
            setDescText(selectedSolve.description || "");
        } else {
            setDescText("");
        }
    }, [selectedSolve]);

    const handleSaveDescription = useCallback(() => {
        if (!selectedSolve) return;
        updateSolve(selectedSolve.id, { description: descText });
        setSolves((prev) =>
            prev.map((s) => (s.id === selectedSolve.id ? { ...s, description: descText } : s))
        );
        setSelectedSolve((prev) => (prev ? { ...prev, description: descText } : null));
    }, [selectedSolve, descText]);

    // Refs to avoid stale closures in event listeners
    const isRunningRef = useRef(false);
    const isHoldingRef = useRef(false);
    const isReadyRef = useRef(false);
    const timeRef = useRef(0);
    const cubeTypeRef = useRef(cubeType);
    const scrambleRef = useRef(scramble);
    const inputMethodRef = useRef(inputMethod);
    const spacePressedRef = useRef(false);
    const ignoreKeyUpRef = useRef(false);

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);
    useEffect(() => {
        isHoldingRef.current = isHolding;
    }, [isHolding]);
    useEffect(() => {
        isReadyRef.current = isReady;
    }, [isReady]);
    useEffect(() => {
        timeRef.current = time;
    }, [time]);
    useEffect(() => {
        cubeTypeRef.current = cubeType;
    }, [cubeType]);
    useEffect(() => {
        scrambleRef.current = scramble;
    }, [scramble]);
    useEffect(() => {
        inputMethodRef.current = inputMethod;
    }, [inputMethod]);

    // ponytail: refs to keep keyboard handlers updated with inspection states
    const inspectionEnabledRef = useRef(inspectionEnabled);
    const isInspectingRef = useRef(isInspecting);
    const inspectionSecondsRef = useRef(inspectionSeconds);
    const inspectionPenaltyRef = useRef(inspectionPenalty);
    const inspectionVoiceRef = useRef(inspectionVoice);

    useEffect(() => { inspectionEnabledRef.current = inspectionEnabled; }, [inspectionEnabled]);
    useEffect(() => { isInspectingRef.current = isInspecting; }, [isInspecting]);
    useEffect(() => { inspectionSecondsRef.current = inspectionSeconds; }, [inspectionSeconds]);
    useEffect(() => { inspectionPenaltyRef.current = inspectionPenalty; }, [inspectionPenalty]);
    useEffect(() => { inspectionVoiceRef.current = inspectionVoice; }, [inspectionVoice]);

    const inspectionIntervalRef = useRef<any>(null);

    // ponytail: Inspector audio player helper
    const playInspectorSound = (type: "eight" | "twelve" | "dnf", gender: "male" | "female") => {
        let filename = "";
        if (type === "eight") {
            filename = `eight-seconds-${gender}.mp3`;
        } else if (type === "twelve") {
            filename = `twelve-seconds-${gender}.mp3`;
        } else {
            filename = gender === "male" ? "Disqualified-male.mp3" : "disqualified-female.mp3";
        }
        const audio = new Audio(`/src/assets/audio/${filename}`);
        audio.play().catch((err) => console.warn("Audio play failed:", err));
    };

    // ponytail: starts 15-second inspection countdown, with audio reminders and penalty/DNF rules
    const startInspection = useCallback(() => {
        setIsInspecting(true);
        setInspectionSeconds(15);
        setInspectionPenalty("none");
        setTime(0);

        if (inspectionIntervalRef.current) {
            clearInterval(inspectionIntervalRef.current);
        }

        let secondsLeft = 15;
        inspectionIntervalRef.current = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft > 0) {
                setInspectionSeconds(secondsLeft);
                if (secondsLeft === 7) {
                    playInspectorSound("eight", inspectionVoiceRef.current);
                } else if (secondsLeft === 3) {
                    playInspectorSound("twelve", inspectionVoiceRef.current);
                }
            } else if (secondsLeft === 0) {
                setInspectionSeconds(0);
                setInspectionPenalty("+2");
            } else if (secondsLeft === -1) {
                setInspectionSeconds(-1);
            } else if (secondsLeft <= -2) {
                clearInterval(inspectionIntervalRef.current);
                inspectionIntervalRef.current = null;
                setIsInspecting(false);
                setInspectionPenalty("dnf");

                // ponytail: cancel any spacebar holding states since we hit DNF
                setIsHolding(false);
                setIsReady(false);
                if (holdTimeoutRef.current) {
                    clearTimeout(holdTimeoutRef.current);
                    holdTimeoutRef.current = null;
                }

                playInspectorSound("dnf", inspectionVoiceRef.current);

                const newSolve: Solve = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    session: activeSessionRef.current,
                    cubeType: cubeTypeRef.current,
                    timeMs: 0,
                    scramble: scrambleRef.current,
                    scrambleState: null,
                    penalty: "dnf",
                };
                saveSolve(newSolve);
                setSolves((prev) => [newSolve, ...prev]);
                setShowSolveActions(false); // ponytail: do not show actions, display initial label
                setScramble(generateScramble(cubeTypeRef.current));
            }
        }, 1000);
    }, []);

    // --- Timer Logic Core ---
    const handleTimerPressDown = useCallback(() => {
        if (inputMethodRef.current !== "timer") return;
        spacePressedRef.current = true;

        if (isRunningRef.current) {
            // Stop timer
            setIsRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

            // Set time to final elapsed time and trigger deferred save
            const finalElapsedTime = Date.now() - startTimeRef.current;
            setTime(finalElapsedTime);
            setPendingSave(true);
            ignoreKeyUpRef.current = true;
        } else if (inspectionEnabledRef.current && !isInspectingRef.current) {
            // Start inspection immediately on press
            startInspection();
            ignoreKeyUpRef.current = true;
        } else {
            // If during inspection, DO NOT pause the countdown
            if (isInspectingRef.current && inspectionPenaltyRef.current === "dnf") {
                return;
            }
            // Start holding (turn red)
            setIsHolding(true);
            setIsReady(false);
            setShowSolveActions(false);
            setTime(0);

            holdTimeoutRef.current = setTimeout(() => {
                if (spacePressedRef.current) {
                    setIsHolding(false);
                    setIsReady(true); // turn green after 1s of holding
                }
            }, 1000);
        }
    }, [startInspection]);

    const handleTimerPressUp = useCallback(() => {
        if (inputMethodRef.current !== "timer") return;
        spacePressedRef.current = false;

        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }

        if (ignoreKeyUpRef.current) {
            ignoreKeyUpRef.current = false;
            return;
        }

        if (isHoldingRef.current) {
            setIsHolding(false); // Released too early
        } else if (isReadyRef.current) {
            // Release spacebar when green
            setIsReady(false);
            if (inspectionEnabledRef.current && !isInspectingRef.current) {
                startInspection();
            } else {
                if (isInspectingRef.current && inspectionPenaltyRef.current === "dnf") {
                    return;
                }
                if (inspectionIntervalRef.current) {
                    clearInterval(inspectionIntervalRef.current);
                    inspectionIntervalRef.current = null;
                }
                setIsInspecting(false);
                setIsRunning(true);
                startTimeRef.current = Date.now();
                timerIntervalRef.current = setInterval(() => {
                    setTime(Date.now() - startTimeRef.current);
                }, 10);
            }
        }
    }, [startInspection]);

    // --- Keyboard Event Handlers ---
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        if (e.code === "Space") {
            e.preventDefault();
            if (e.repeat) return; // Prevent repeated keydown firing when holding down
            handleTimerPressDown();
        }
    }, [handleTimerPressDown]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        if (e.code === "Space") {
            e.preventDefault();
            handleTimerPressUp();
        }
    }, [handleTimerPressUp]);

    // --- Pointer Event Handlers (Tap/Click) ---
    const handlePointerDown = (e: React.PointerEvent) => {
        // Prevent default to avoid simulating click, selecting text, or double-firing
        // Do not trigger if clicking on actions (like +2, DNF chips)
        if ((e.target as HTMLElement).closest('.action-chip')) return;
        if (e.button && e.button !== 0) return; // Ignore right-clicks
        if ((e.target as HTMLElement).closest('.timer-controls')) return; // Ignore inputs if any
        handleTimerPressDown();
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('.action-chip')) return;
        if (e.button && e.button !== 0) return;
        handleTimerPressUp();
    };

    // --- Manual Logic (Typing Numbers) ---
    const handleManualTyping = useCallback(
        (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA"
            )
                return;
            if (inputMethod !== "manual") return;

            if (e.key >= "0" && e.key <= "9") {
                setManualStr((prev) => (prev + e.key).slice(-8)); // limit to 8 chars
            } else if (e.key === "Backspace") {
                setManualStr((prev) => prev.slice(0, -1));
            } else if (e.key === "Enter" && manualStr.length > 0) {
                // Parse and Save
                const padded = manualStr.padStart(2, "0");
                const msPart = parseInt(padded.slice(-2)) * 10;
                let sPart = 0;
                let mPart = 0;
                let hPart = 0;
                if (padded.length > 2)
                    sPart = parseInt(padded.slice(-4, -2)) * 1000;
                if (padded.length > 4)
                    mPart = parseInt(padded.slice(-6, -4)) * 60000;
                if (padded.length > 6)
                    hPart = parseInt(padded.slice(0, -6)) * 3600000;

                const totalMs = msPart + sPart + mPart + hPart;
                const newSolve: Solve = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    session: activeSession,
                    cubeType,
                    timeMs: totalMs,
                    scramble,
                    scrambleState: null,
                    penalty: "none",
                };
                saveSolve(newSolve);
                setSolves((prev) => [newSolve, ...prev]);
                setScramble(generateScramble(cubeType));
                setManualStr("");
            }
        },
        [inputMethod, manualStr, cubeType, scramble, activeSession],
    );


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleManualTyping);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("keydown", handleManualTyping);
            if (timerIntervalRef.current)
                clearInterval(timerIntervalRef.current);
            if (inspectionIntervalRef.current)
                clearInterval(inspectionIntervalRef.current);
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        };
    }, [handleKeyDown, handleKeyUp, handleManualTyping]);

    // ponytail: deferred save to read the exact timer text from screen after DOM update settles
    useEffect(() => {
        if (pendingSave && !isRunning) {
            const timer = setTimeout(() => {
                const mainEl = document.querySelector(".timer-main-text");
                const msEl = document.querySelector(".timer-ms-text");

                const mainText = mainEl?.textContent || "00";
                const msText = msEl?.textContent || ".00";

                // Parse display text back to milliseconds
                const cleanMsStr = msText.replace(/[^0-9]/g, "");
                const msPart = (parseInt(cleanMsStr) || 0) * 10;

                const parts = mainText.split(":");
                let seconds = 0;
                if (parts.length === 3) {
                    seconds = (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
                } else if (parts.length === 2) {
                    seconds = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                } else {
                    seconds = parseInt(parts[0]) || 0;
                }

                const parsedTimeMs = seconds * 1000 + msPart;

                const newSolve: Solve = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    session: activeSessionRef.current,
                    cubeType: cubeTypeRef.current,
                    timeMs: parsedTimeMs,
                    scramble: scrambleRef.current,
                    scrambleState: null,
                    penalty: inspectionEnabledRef.current ? inspectionPenaltyRef.current : "none",
                };

                saveSolve(newSolve);
                setSolves((prev) => [newSolve, ...prev]);
                setShowSolveActions(true);
                setScramble(generateScramble(cubeTypeRef.current));

                setPendingSave(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [pendingSave, isRunning]);

    const filteredSolves = solves.filter(
        (solve) => (solve.session || "session-1") === activeSession,
    );


    const handleTogglePlusTwo = useCallback(() => {
        if (filteredSolves.length === 0) return;
        const lastSolve = filteredSolves[0];
        const newPenalty = lastSolve.penalty === "+2" ? "none" : "+2";
        updateSolve(lastSolve.id, { penalty: newPenalty });
        setSolves((prev) =>
            prev.map((s) => (s.id === lastSolve.id ? { ...s, penalty: newPenalty } : s))
        );
    }, [filteredSolves]);

    const handleToggleDNF = useCallback(() => {
        if (filteredSolves.length === 0) return;
        const lastSolve = filteredSolves[0];
        const newPenalty = lastSolve.penalty === "dnf" ? "none" : "dnf";
        updateSolve(lastSolve.id, { penalty: newPenalty });
        setSolves((prev) =>
            prev.map((s) => (s.id === lastSolve.id ? { ...s, penalty: newPenalty } : s))
        );
    }, [filteredSolves]);

    const getDisplayTime = () => {
        if (inputMethod === "manual") {
            return formatManualInput(manualStr);
        }
        if (isInspecting) {
            if (inspectionSeconds <= 0) {
                return { main: "+2", ms: "" };
            }
            return { main: inspectionSeconds.toString(), ms: "" };
        }
        if (showSolveActions && filteredSolves.length > 0) {
            const lastSolve = filteredSolves[0];
            if (lastSolve.penalty === "dnf") {
                return { main: "DNF", ms: "" };
            }
            if (lastSolve.penalty === "+2") {
                const ft = formatTime(lastSolve.timeMs + 2000);
                return { main: ft.main, ms: ft.ms + "+" };
            }
        }
        return formatTime(time);
    };

    const { main: displayMain, ms: displayMs } = getDisplayTime();

    const timerColorClass = isReady ? "green" : isHolding ? "red" : "";

    const isInitialPrompt =
        !isRunning &&
        !isInspecting &&
        !isHolding &&
        !isReady &&
        !showSolveActions &&
        inputMethod === "timer";

    const promptText =
        inputMethod === "manual"
            ? manualStr.length === 0
                ? "Type numbers, press Enter to save"
                : ""
            : isHolding
                ? "Keep holding..."
                : isReady
                    ? "Release to start!"
                    : isInspecting
                        ? "Hold Spacebar to start solve"
                        : isInitialPrompt
                            ? inspectionEnabled
                                ? "Press spacebar to start inspection"
                                : "Press and hold spacebar to start"
                            : "";

    // Calculate stats from filteredSolves
    const stats = computeStats(filteredSolves as Solve[]);
    const { avgAll: avg, ao5, ao12, best, worst } = stats;

    return (
        <div
            className="timer-page container"
            ref={containerRef}
            tabIndex={-1}
            style={{ outline: "none" }}
        >
            <section className="timer-section-1">
                {/* Column 1: Clock */}
                <div className="timer-col-1">
                    <div 
                        className={`timer-card clock-card ${inputMethod === "timer" ? "tap-enabled" : ""}`}
                        onPointerDown={inputMethod === "timer" ? handlePointerDown : undefined}
                        onPointerUp={inputMethod === "timer" ? handlePointerUp : undefined}
                        onPointerLeave={inputMethod === "timer" ? handlePointerUp : undefined}
                        onPointerCancel={inputMethod === "timer" ? handlePointerUp : undefined}
                    >
                        {/* Z-stack base: timer display fills the full card, perfectly centered */}
                        <div className="clock-display-base">
                            <div className={`clock-decorators ${isInspecting || isRunning ? "active-floating" : ""} ${isRunning && !isInspecting ? "timer-active" : ""}`}>
                                <div className="decorator dec-circle-1"></div>
                                <div className="decorator dec-square-1"></div>
                                <div className="decorator dec-triangle-1"></div>
                                <div className="decorator dec-cross-1"></div>
                                <div className="decorator dec-ring-1"></div>
                                <div className="decorator dec-star-1"></div>
                                <div className="decorator dec-diamond-1"></div>
                                <div className="decorator dec-circle-2"></div>
                                <div className="decorator dec-spark-1"></div>
                            </div>
                            <div className={`timer-display ${timerColorClass}`}>
                                <span className="timer-main-text">
                                    {displayMain}
                                </span>
                                {displayMs && (
                                    <span className="timer-ms-text">
                                        .
                                        {isRunning
                                            ? displayMs.slice(0, 1)
                                            : displayMs}
                                    </span>
                                )}
                            </div>

                            <div className="timer-prompts">
                                {promptText && (
                                    <span className={`timer-prompt-text ${isInitialPrompt ? "initial-prompt" : ""}`}>
                                        {promptText}
                                    </span>
                                )}
                                {showSolveActions &&
                                    filteredSolves.length > 0 &&
                                    !isRunning &&
                                    inputMethod === "timer" && (
                                        <>
                                            <button
                                                className={`action-chip ${filteredSolves[0].penalty === "+2" ? "active" : ""}`}
                                                onClick={handleTogglePlusTwo}
                                            >
                                                +2
                                            </button>
                                            <button
                                                className={`action-chip ${filteredSolves[0].penalty === "dnf" ? "active dnf-chip" : ""}`}
                                                onClick={handleToggleDNF}
                                            >
                                                DNF
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>

                        {/* Z-stack overlay top: cube dropdown + scramble notation + scramble preview */}
                        <div className="clock-top-bar">
                            <Dropdown<string>
                                isOpen={isCubeDropdownOpen}
                                onToggle={() => {
                                    if (isCubeDropdownOpen) {
                                        closeDropdownWithAnimation();
                                    } else {
                                        setIsCubeDropdownOpen(true);
                                    }
                                }}
                                onClose={closeDropdownWithAnimation}
                                label={cubeType}
                                selectedValue={cubeType}
                                items={["2x2", "3x3", "4x4", "5x5"].map((type) => ({ value: type, label: type }))}
                                onSelect={(type) => {
                                    handleCubeChangeCustom(type);
                                    closeDropdownWithAnimation();
                                }}
                                containerRef={dropdownRef}
                                isClosing={isDropdownClosing}
                            />
                            <div className="clock-scramble-wrapper">
                                <div className="clock-scramble">{scramble}</div>
                                <button
                                    className="scramble-refresh-btn"
                                    onClick={() => setScramble(generateScramble(cubeType))}
                                    title="Regenerate scramble"
                                >
                                    <RefreshCw size={12} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                            <button
                                className="scramble-preview-trigger-btn"
                                onClick={() => setShowScrambleOverlay(true)}
                                title="Show scramble preview"
                            >
                                <Eye size={20} />
                            </button>
                            <ScrambleImage scramble={scramble} />
                        </div>

                        {/* Z-stack overlay bottom: stats overview + settings */}
                        <div className="clock-bottom-bar">
                            <div className="overview-card">
                                <div className="overview-row">
                                    <span className="overview-label">Average</span>
                                    <span className="overview-value">
                                        {avg > 0
                                            ? `${formatTime(avg).main}.${formatTime(avg).ms}`
                                            : "--.--"}
                                    </span>
                                </div>
                                <div className="overview-row">
                                    <span className="overview-label">AO5</span>
                                    <span className="overview-value">
                                        {ao5 < 0
                                            ? "DNF"
                                            : ao5 > 0
                                                ? `${formatTime(ao5).main}.${formatTime(ao5).ms}`
                                                : "--.--"}
                                    </span>
                                </div>
                                <div className="overview-row">
                                    <span className="overview-label">AO12</span>
                                    <span className="overview-value">
                                        {ao12 < 0
                                            ? "DNF"
                                            : ao12 > 0
                                                ? `${formatTime(ao12).main}.${formatTime(ao12).ms}`
                                                : "--.--"}
                                    </span>
                                </div>
                                <div className="overview-row">
                                    <span className="overview-label">Best</span>
                                    <span className="overview-value">
                                        {best > 0
                                            ? `${formatTime(best).main}.${formatTime(best).ms}`
                                            : "--.--"}
                                    </span>
                                </div>
                                <div className="overview-row">
                                    <span className="overview-label">Worst</span>
                                    <span className="overview-value">
                                        {worst > 0
                                            ? `${formatTime(worst).main}.${formatTime(worst).ms}`
                                            : "--.--"}
                                    </span>
                                </div>
                            </div>
                            <div
                                style={{ position: "relative" }}
                                ref={settingsContainerRef}
                            >
                                <button
                                    className="settings-btn"
                                    onClick={() => {
                                        if (isSettingsOpen) {
                                            closeSettingsWithAnimation();
                                        } else {
                                            setIsSettingsOpen(true);
                                        }
                                    }}
                                >
                                    <Settings size={20} />
                                </button>

                                {isSettingsOpen && (
                                    <div className={`settings-popup ${isSettingsClosing ? "closing" : ""}`}>
                                        <label
                                            className="settings-row"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span className="settings-label">
                                                Inspection
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={inspectionEnabled}
                                                onChange={(e) =>
                                                    setInspectionEnabled(
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                        </label>
                                        {inspectionEnabled && (
                                            <div className="settings-row">
                                                <span className="settings-label">
                                                    Voice Gender
                                                </span>
                                                <Dropdown
                                                    isOpen={isVoiceDropdownOpen}
                                                    onToggle={() => {
                                                        if (isVoiceDropdownOpen) {
                                                            closeVoiceDropdownWithAnimation();
                                                        } else {
                                                            setIsVoiceDropdownOpen(true);
                                                        }
                                                    }}
                                                    onClose={closeVoiceDropdownWithAnimation}
                                                    label={inspectionVoice === "male" ? "Male" : "Female"}
                                                    selectedValue={inspectionVoice}
                                                    items={[
                                                        { value: "male", label: "Male" },
                                                        { value: "female", label: "Female" }
                                                    ]}
                                                    onSelect={(gender) => {
                                                        setInspectionVoice(gender as "male" | "female");
                                                        closeVoiceDropdownWithAnimation();
                                                    }}
                                                    className="small"
                                                    containerRef={voiceDropdownRef}
                                                    isClosing={isVoiceDropdownClosing}
                                                />
                                            </div>
                                        )}
                                        <div className="settings-row">
                                            <span className="settings-label">
                                                Input Method
                                            </span>
                                            <Dropdown
                                                isOpen={isInputMethodDropdownOpen}
                                                onToggle={() => {
                                                    if (isInputMethodDropdownOpen) {
                                                        closeInputMethodDropdownWithAnimation();
                                                    } else {
                                                        setIsInputMethodDropdownOpen(true);
                                                    }
                                                }}
                                                onClose={closeInputMethodDropdownWithAnimation}
                                                label={inputMethod === "timer" ? "Timer" : "Manual"}
                                                selectedValue={inputMethod}
                                                items={[
                                                    { value: "timer", label: "Timer" },
                                                    { value: "manual", label: "Manual" }
                                                ]}
                                                onSelect={(method) => {
                                                    setInputMethod(method as "timer" | "manual");
                                                    setTime(0);
                                                    setManualStr("");
                                                    closeInputMethodDropdownWithAnimation();
                                                    closeSettingsWithAnimation();
                                                }}
                                                className="small"
                                                containerRef={inputMethodDropdownRef}
                                                isClosing={isInputMethodClosing}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scramble Preview Overlay for Mobile */}
                        {showScrambleOverlay && (
                            <div className="scramble-overlay active" onClick={() => setShowScrambleOverlay(false)}>
                                <div className="scramble-overlay-card" onClick={(e) => e.stopPropagation()}>
                                    <div className="scramble-overlay-header">
                                        <span className="scramble-overlay-title">Scramble Preview</span>
                                        <button className="scramble-overlay-close" onClick={() => setShowScrambleOverlay(false)}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="scramble-overlay-body">
                                        <ScrambleImage scramble={scramble} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Stats */}
                <div className="timer-col-2">
                    <div className="timer-card time-card">
                        <div className="sessions-header">
                            <Dropdown<string>
                                isOpen={isSessionDropdownOpen}
                                onToggle={() => {
                                    if (isSessionDropdownOpen) {
                                        closeSessionDropdownWithAnimation();
                                    } else {
                                        setIsSessionDropdownOpen(true);
                                    }
                                }}
                                onClose={() => {
                                    closeSessionDropdownWithAnimation();
                                    setRenamingSession(null);
                                }}
                                label={sessions.find((s) => s.id === activeSession)?.name || "Session 1"}
                                selectedValue={activeSession}
                                items={sessions.map((session) => ({
                                    value: session.id,
                                    label: session.name,
                                    actionIcon: <Trash2 size={13} />,
                                    actionTitle: "Delete session",
                                    onActionClick: (_, e) => handleDeleteSession(session.id, e)
                                }))}
                                onSelect={(id) => {
                                    setActiveSession(id);
                                    closeSessionDropdownWithAnimation();
                                }}
                                containerRef={sessionDropdownRef}
                                isClosing={isSessionDropdownClosing}
                                renameInput={renamingSession ? (
                                    <input
                                        className="session-rename-input"
                                        autoFocus
                                        maxLength={20}
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleRenameConfirm(renamingSession!);
                                            }
                                            if (e.key === "Escape") setRenamingSession(null);
                                        }}
                                        onBlur={(e) => {
                                            if (!e.currentTarget.dataset.submitting) {
                                                handleRenameConfirm(renamingSession!);
                                            }
                                        }}
                                    />
                                ) : undefined}
                                triggerPrefix={
                                    <button
                                        className="session-rename-btn"
                                        title="Rename session"
                                        onClick={() => {
                                            setRenamingSession(activeSession);
                                            const activeObj = sessions.find((s) => s.id === activeSession);
                                            setRenameValue(activeObj?.name || "");
                                            if (isSessionDropdownOpen) closeSessionDropdownWithAnimation();
                                        }}
                                    >
                                        <Pencil size={13} />
                                    </button>
                                }
                            />
                            <button className="btn-new" onClick={handleNewSession}>
                                <Plus size={16} /> New
                            </button>
                        </div>

                        <div className="sessions-list">
                            {filteredSolves.length === 0 && (
                                <div
                                    style={{
                                        color: "var(--foreground-muted)",
                                        textAlign: "center",
                                        marginTop: "var(--space-4)",
                                    }}
                                >
                                    No solves yet.
                                </div>
                            )}
                            {filteredSolves.map((solve) => (
                                <div
                                    key={solve.id}
                                    className="session-item"
                                    onClick={() => setSelectedSolve(solve)}
                                >
                                    <span>
                                        {solve.cubeType}
                                    </span>
                                    <span style={{ fontWeight: "bold" }}>
                                        {solve.penalty === "dnf" ? (
                                            "DNF"
                                        ) : (
                                            <>
                                                {formatTime(solve.penalty === "+2" ? solve.timeMs + 2000 : solve.timeMs).main}.
                                                {formatTime(solve.penalty === "+2" ? solve.timeMs + 2000 : solve.timeMs).ms}
                                                {solve.penalty === "+2" && " (+2)"}
                                            </>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="session-footer">
                            Total Solves: {filteredSolves.length}
                        </div>

                        {/* Overlay Detail */}
                        <div
                            className={`detail-overlay ${selectedSolve ? "active" : ""}`}
                            onClick={() => setSelectedSolve(null)}
                        >
                            {selectedSolve && (
                                <div
                                    className="detail-card"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="detail-header">
                                        <div className="detail-time-container">
                                            <span className="detail-time">
                                                {selectedSolve.penalty === "dnf" ? (
                                                    "DNF"
                                                ) : (
                                                    <>
                                                        {formatTime(selectedSolve.penalty === "+2" ? selectedSolve.timeMs + 2000 : selectedSolve.timeMs).main}
                                                        .
                                                        {formatTime(selectedSolve.penalty === "+2" ? selectedSolve.timeMs + 2000 : selectedSolve.timeMs).ms}
                                                        {selectedSolve.penalty === "+2" && " (+2)"}
                                                    </>
                                                )}
                                            </span>
                                            <span className="detail-date">
                                                {selectedSolve.date}
                                            </span>
                                        </div>
                                        <button
                                            className="detail-close"
                                            onClick={() =>
                                                setSelectedSolve(null)
                                            }
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div
                                        style={{
                                            textAlign: "center",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {selectedSolve.scramble}
                                    </div>
                                    <ScrambleImage scramble={selectedSolve.scramble} />
                                    <textarea
                                        className="detail-desc-input"
                                        rows={3}
                                        placeholder="Solve Description..."
                                        value={descText}
                                        onChange={(e) => setDescText(e.target.value)}
                                    ></textarea>
                                    <div className="detail-actions">
                                        <button
                                            className="detail-delete-btn"
                                            onClick={() => handleDeleteSolve(selectedSolve.id)}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                        {descText !== (selectedSolve.description || "") && (
                                            <button
                                                className="detail-save-btn"
                                                onClick={handleSaveDescription}
                                            >
                                                Save Description
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Modal
                isOpen={!!confirmDialog}
                onClose={() => closeConfirmWithAnimation()}
                title={confirmDialog?.title || "Confirmation"}
                icon={confirmDialog?.showIcon ? <AlertTriangle className="modal-alert-icon" size={20} /> : undefined}
                isClosing={isConfirmClosing}
                footer={
                    <>
                        {confirmDialog?.cancelText !== "" && (
                            <button
                                className={confirmDialog?.cancelBtnClass || "btn-cancel"}
                                onClick={() => {
                                    closeConfirmWithAnimation(() => {
                                        if (confirmDialog?.onCancel) confirmDialog.onCancel();
                                    });
                                }}
                            >
                                {confirmDialog?.cancelText || "Cancel"}
                            </button>
                        )}
                        <button
                            className={confirmDialog?.confirmBtnClass || "btn-confirm"}
                            onClick={() => {
                                closeConfirmWithAnimation(() => {
                                    confirmDialog?.onConfirm();
                                });
                            }}
                        >
                            {confirmDialog?.confirmText || "Confirm"}
                        </button>
                    </>
                }
            >
                <p className="modal-message">{confirmDialog?.message}</p>
            </Modal>
        </div>
    );
}
