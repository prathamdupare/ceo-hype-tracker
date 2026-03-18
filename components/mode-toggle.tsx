"use client"

import * as React from "react"
import { Moon, Sun, Github } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="https://github.com/prathamdupare/ceo-hype-tracker"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center"
      >
        <Github className="h-5 w-5" />
        <span className="sr-only">GitHub Repository</span>
      </a>
      <Button variant="outline" size="icon" onClick={toggleTheme}>
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
