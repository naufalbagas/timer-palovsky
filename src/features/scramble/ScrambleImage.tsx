import { useEffect, useState } from "react";
import { applyScramble } from "./scramble";
import type { Color } from "./scramble";
import "./ScrambleImage.css";

// ponytail: map colors to modern premium palette
const colorToHex: Record<Color, string> = {
    White: "#FFFFFF",
    Yellow: "#FFD500",
    Green: "#00D26A",
    Blue: "#1263efff",
    Orange: "#FF7B00",
    Red: "#f52727ff",
};

interface ScrambleImageProps {
    scramble: string;
}

export default function ScrambleImage({ scramble }: ScrambleImageProps) {
    const [state, setState] = useState<Color[]>([]);

    useEffect(() => {
        setState(applyScramble(scramble));
    }, [scramble]);

    if (state.length !== 54) return null;

    // Face offsets in flat array: U(0), L(9), F(18), R(27), B(36), D(45)
    const layout = [
        { offset: 0, row: 1, col: 2 },  // U
        { offset: 9, row: 2, col: 1 },  // L
        { offset: 18, row: 2, col: 2 }, // F
        { offset: 27, row: 2, col: 3 }, // R
        { offset: 36, row: 2, col: 4 }, // B
        { offset: 45, row: 3, col: 2 }, // D
    ];

    return (
        <div className="scramble-image-container">
            <div className="scramble-grid">
                {layout.map(({ offset, row, col }) => (
                    <div
                        key={offset}
                        className="scramble-face"
                        style={{
                            gridRow: row,
                            gridColumn: col,
                        }}
                    >
                        {state.slice(offset, offset + 9).map((color, idx) => (
                            <div
                                key={idx}
                                className="scramble-sticker"
                                style={{
                                    backgroundColor: colorToHex[color],
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
