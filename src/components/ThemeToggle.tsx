"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();

    // To avoid hydration mismatch, optionally we wait for mount.
    // But for simple toggle, standard implementation is fine.
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-9 h-9"></div>;
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 transition-all dark:-rotate-90 dark:scale-0 text-gray-700 dark:text-gray-300" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-700 dark:text-gray-300" />
        </button>
    );
}
