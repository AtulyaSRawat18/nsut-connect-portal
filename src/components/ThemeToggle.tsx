"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();

    const mounted = React.useSyncExternalStore(subscribe, () => true, () => false);

    if (!mounted) {
        return <div className="w-9 h-9"></div>;
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="icon-control relative"
            aria-label="Toggle theme"
            title={resolvedTheme === "dark" ? "Use light theme" : "Use dark theme"}
        >
            <Sun className="h-5 w-5 transition-all dark:-rotate-90 dark:scale-0 text-gray-700 dark:text-gray-300" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-700 dark:text-gray-300" />
        </button>
    );
}

const subscribe = () => () => {};
