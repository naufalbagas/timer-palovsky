/**
 * storage.ts — Palovsky internal localStorage persistence.
 * Ponytail ultra: flat, typed, no abstraction overhead.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Solve {
    id: number;
    date: string;           // human-readable date string
    session: string;        // session name
    cubeType: string;       // e.g. "3x3", "2x2"
    timeMs: number;         // raw time in milliseconds
    scramble: string;       // notation string
    scrambleState: number[] | null; // flat 54-cell color array for image render
    penalty: "none" | "+2" | "dnf"; // future-proof
    description?: string;   // optional solve notes
}

export interface SessionStats {
    session: string;
    avgAll: number;   // average of all valid solves (excludes DNF)
    ao5: number;      // average of last 5 (0 if < 5 solves)
    ao12: number;     // average of last 12 (0 if < 12 solves)
    best: number;     // best single (0 if no solves)
    worst: number;    // worst single (0 if no solves)
    count: number;    // total number of solves in session
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const SOLVES_KEY = "palovsky_solves";
const SESSIONS_KEY = "palovsky_sessions";
const ACTIVE_SESSION_KEY = "palovsky_active_session";

// ─── Solves ───────────────────────────────────────────────────────────────────

export function loadSolves(): Solve[] {
    try {
        return JSON.parse(localStorage.getItem(SOLVES_KEY) ?? "[]");
    } catch {
        return [];
    }
}

export function saveSolve(solve: Solve): void {
    const current = loadSolves();
    // Prepend (newest first)
    localStorage.setItem(SOLVES_KEY, JSON.stringify([solve, ...current]));
}

export function deleteSolve(id: number): void {
    const updated = loadSolves().filter((s) => s.id !== id);
    localStorage.setItem(SOLVES_KEY, JSON.stringify(updated));
}

export function saveSolves(solves: Solve[]): void {
    localStorage.setItem(SOLVES_KEY, JSON.stringify(solves));
}

export function updateSolve(id: number, patch: Partial<Solve>): void {
    const updated = loadSolves().map((s) => (s.id === id ? { ...s, ...patch } : s));
    localStorage.setItem(SOLVES_KEY, JSON.stringify(updated));
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function loadSessions(): string[] {
    try {
        return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '["Session 1"]');
    } catch {
        return ["Session 1"];
    }
}

export function saveSessions(sessions: string[]): void {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadActiveSession(): string {
    return localStorage.getItem(ACTIVE_SESSION_KEY) ?? "Session 1";
}

export function saveActiveSession(session: string): void {
    localStorage.setItem(ACTIVE_SESSION_KEY, session);
}

// ─── Stats computation ────────────────────────────────────────────────────────

/**
 * Compute stats for a given set of solves (already filtered to one session).
 *
 * Algorithm:
 * - avgAll  : arithmetic mean of all timeMs values where penalty !== "dnf"
 * - ao5     : Ao5 of the LAST 5 solves (chronological order, newest last).
 *             Standard WCA Ao5: remove single best and single worst, average the remaining 3.
 *             If any of the 5 is DNF, the DNF counts as worst (if 2+ DNF → result is DNF, represented as -1).
 * - ao12    : Same algorithm applied to last 12 solves (remove best+worst, average 10).
 * - best    : minimum timeMs (DNF excluded)
 * - worst   : maximum timeMs (DNF excluded)
 */
export function computeStats(solves: Solve[]): Omit<SessionStats, "session"> {
    const valid = solves.filter((s) => s.penalty !== "dnf");
    const times = valid.map((s) => s.penalty === "+2" ? s.timeMs + 2000 : s.timeMs);

    const avgAll = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const best = times.length > 0 ? Math.min(...times) : 0;
    const worst = times.length > 0 ? Math.max(...times) : 0;

    // ponytail: AoN helper — last N solves, WCA trim (remove min + max, avg rest)
    const aoN = (n: number): number => {
        if (solves.length < n) return 0;
        const slice = solves.slice(0, n); // solves is newest-first, so first N = last N recorded
        const dnfCount = slice.filter((s) => s.penalty === "dnf").length;
        if (dnfCount > 1) return -1; // DNF result
        const sliceTimes = slice.map((s) =>
            s.penalty === "dnf" ? Infinity : (s.penalty === "+2" ? s.timeMs + 2000 : s.timeMs)
        );
        const sorted = [...sliceTimes].sort((a, b) => a - b);
        const trimmed = sorted.slice(1, n - 1); // remove best and worst
        return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    };

    return {
        avgAll,
        ao5: aoN(5),
        ao12: aoN(12),
        best,
        worst,
        count: solves.length,
    };
}

// ─── Settings & Cube Type ──────────────────────────────────────────────────────

export function loadCubeType(): string {
    return localStorage.getItem("palovsky_cube_type") ?? "3x3";
}

export function saveCubeType(cubeType: string): void {
    localStorage.setItem("palovsky_cube_type", cubeType);
}

export function loadInspectionEnabled(): boolean {
    return localStorage.getItem("palovsky_inspection_enabled") === "true";
}

export function saveInspectionEnabled(enabled: boolean): void {
    localStorage.setItem("palovsky_inspection_enabled", String(enabled));
}

export function loadInputMethod(): "timer" | "manual" {
    const saved = localStorage.getItem("palovsky_input_method");
    return saved === "manual" ? "manual" : "timer";
}

export function saveInputMethod(method: "timer" | "manual"): void {
    localStorage.setItem("palovsky_input_method", method);
}
