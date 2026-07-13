export type Color = "White" | "Red" | "Green" | "Yellow" | "Orange" | "Blue";
type Cycle = [number, number, number, number];

// ponytail: minimal flat-array Rubik's Cube Simulator & Generator
// Flat cycles for clockwise rotation of U, R, F, D, L, B.
// Each face turn involves 5 cycles of 4 stickers.
const CYCLES: Record<string, Cycle[]> = {
    U: [[0, 2, 8, 6], [1, 5, 7, 3], [18, 9, 36, 27], [19, 10, 37, 28], [20, 11, 38, 29]],
    R: [[27, 29, 35, 33], [28, 32, 34, 30], [20, 2, 42, 47], [23, 5, 39, 50], [26, 8, 36, 53]],
    F: [[18, 20, 26, 24], [19, 23, 25, 21], [6, 27, 47, 17], [7, 30, 46, 14], [8, 33, 45, 11]],
    D: [[45, 47, 53, 51], [46, 50, 52, 48], [24, 33, 42, 15], [25, 34, 43, 16], [26, 35, 44, 17]],
    L: [[9, 11, 17, 15], [10, 14, 16, 12], [0, 18, 45, 44], [3, 21, 48, 41], [6, 24, 51, 38]],
    B: [[36, 38, 44, 42], [37, 41, 43, 39], [2, 9, 51, 35], [1, 12, 52, 32], [0, 15, 53, 29]],
};

export const applyScramble = (scramble: string): Color[] => {
    // Initial state: 9 stickers per face -> U(White), L(Orange), F(Green), R(Red), B(Blue), D(Yellow)
    const state: Color[] = [
        ...Array(9).fill("White"), ...Array(9).fill("Orange"), ...Array(9).fill("Green"),
        ...Array(9).fill("Red"), ...Array(9).fill("Blue"), ...Array(9).fill("Yellow")
    ] as Color[];

    const moves = scramble.trim().split(" ");
    for (const m of moves) {
        if (!m) continue;
        const face = m[0];
        const times = m[1] === "2" ? 2 : m[1] === "'" ? 3 : 1;

        for (let i = 0; i < times; i++) {
            for (const [a, b, c, d] of CYCLES[face] || []) {
                const temp = state[d];
                state[d] = state[c];
                state[c] = state[b];
                state[b] = state[a];
                state[a] = temp;
            }
        }
    }
    return state;
};

export const generateScramble = (type?: string): string => {
    const faces = ["U", "D", "F", "B", "L", "R"];
    const opposite: Record<string, string> = { U: "D", D: "U", F: "B", B: "F", L: "R", R: "L" };
    const mods = ["", "'", "2"];

    const seq: string[] = [];
    let len = Math.floor(Math.random() * 3) + 19; // 19 to 21
    if (type === "2x2") len = 10;
    if (type === "4x4") len = 40;
    if (type === "5x5") len = 60;

    for (let i = 0; i < len; i++) {
        let f = "";
        while (true) {
            f = faces[Math.floor(Math.random() * faces.length)];
            if (i > 0 && seq[i - 1] === f) continue; // No consecutive same face
            if (i > 1 && opposite[f] === seq[i - 1] && seq[i - 2] === f) continue; // No useless axis sweep
            break;
        }
        seq.push(f);
    }

    return seq.map(f => f + mods[Math.floor(Math.random() * mods.length)]).join(" ");
};
