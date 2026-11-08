import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

type Theme = 'light' | 'dark'

export function useTheme() {
    const systemDark = useMediaQuery({ query: '(prefers-color-scheme: dark)' })
    const [choice, setChoice] = useState<Theme | null>(() => {
        try {
            const saved = localStorage.getItem('devrel-theme')
            return saved === 'light' || saved === 'dark' ? saved : null
        } catch {
            return null
        }
    })
    const theme = choice ?? (systemDark ? 'dark' : 'light')
    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        try {
            localStorage.setItem('devrel-theme', next)
            setChoice(next)
        } catch {
            setChoice(null)
        }
    }
    return [theme, toggle] as const
}
