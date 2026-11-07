import { useEffect, useState } from 'react'
import { SurveyState } from './surveyState'
import { decodeSurveyUrl, encodeSurveyUrl, MAX_URL_SEARCH_LENGTH } from './surveyUrl'

// Переход между страницами и годами — новая запись истории, остальные правки заменяют текущую.
type HistoryMode = 'push' | 'replace'

export type UpdateSurveyState = (patch: Partial<SurveyState>, mode?: HistoryMode) => void

const URL_TOO_LONG = 'Ссылка слишком длинная и не сохранена в адресной строке.'

export function useSurveyState() {
    const [initial] = useState(() => decodeSurveyUrl(window.location.search))
    const [state, setState] = useState(initial.state)
    const [warnings, setWarnings] = useState<readonly string[]>(initial.warnings)

    useEffect(() => {
        const restore = () => {
            const decoded = decodeSurveyUrl(window.location.search)
            setState(decoded.state)
            setWarnings(decoded.warnings)
        }
        window.addEventListener('popstate', restore)
        return () => window.removeEventListener('popstate', restore)
    }, [])

    const showUrlTooLong = () => setWarnings(current =>
        current.includes(URL_TOO_LONG) ? current : [...current, URL_TOO_LONG])

    const update: UpdateSurveyState = (patch, mode = 'replace') => {
        const next = { ...state, ...patch }
        const search = encodeSurveyUrl(next)
        if (search.length > MAX_URL_SEARCH_LENGTH) {
            showUrlTooLong()
        } else if (search !== encodeSurveyUrl(state)) {
            if (mode === 'push') {
                window.history.pushState(null, '', search)
            } else {
                window.history.replaceState(null, '', search)
            }
            setWarnings(current => current.filter(warning => warning !== URL_TOO_LONG))
        }
        setState(next)
    }

    const duplicate = () => {
        const search = encodeSurveyUrl(state)
        if (search.length > MAX_URL_SEARCH_LENGTH) {
            showUrlTooLong()
        } else {
            window.open(search, '_blank')
        }
    }

    const dismissWarning = (warning: string) =>
        setWarnings(current => current.filter(w => w !== warning))

    return { state, warnings, update, duplicate, dismissWarning }
}
