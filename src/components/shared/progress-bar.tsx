import { useMemo } from "react";

const GRADIENTS = [
    "from-emerald-500 to-teal-400",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
    "from-rose-500 via-red-500 to-orange-500",
    "from-violet-600 to-indigo-600"
];

export default function ProgressBar({ isSolo }) {
    const randomGradient = useMemo(() => {
        return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    }, []);

    return (
        <div
            className={`h-1.5 w-full bg-gradient-to-r ${isSolo ? "from-emerald-500 to-teal-400" : randomGradient
                }`}
        />
    );
}
