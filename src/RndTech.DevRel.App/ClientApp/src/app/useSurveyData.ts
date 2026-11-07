import { useEffect, useState } from 'react'
import { getCompanyResults, getFilterOptions, getSurveyMeta } from '../api/client'
import { RespondentFilter } from '../features/filters/model'
import { RequestState } from '../shared/AsyncState'

type Settled<T> = { readonly key: string } & ({ readonly data: T } | { readonly error: unknown })

function useRequest<A, T>(request: (arg: A, signal: AbortSignal) => Promise<T>, arg: A): RequestState<T> {
    const [attempt, setAttempt] = useState(0)
    const [settled, setSettled] = useState<Settled<T>>()
    // Ключ — значение аргумента: тот же фильтр в другом объекте не вызывает запрос.
    const argKey = JSON.stringify(arg)
    const key = `${argKey}#${attempt}`

    useEffect(() => {
        const controller = new AbortController()
        request(JSON.parse(argKey), controller.signal).then(
            data => {
                if (!controller.signal.aborted) {
                    setSettled({ key, data })
                }
            },
            error => {
                if (!controller.signal.aborted) {
                    setSettled({ key, error })
                }
            })
        return () => controller.abort()
    }, [request, argKey, key])

    const retry = () => setAttempt(current => current + 1)
    if (settled?.key !== key) {
        return { status: 'loading', data: settled && 'data' in settled ? settled.data : undefined, retry }
    }
    return 'data' in settled ? { status: 'ready', data: settled.data, retry } : { status: 'error', retry }
}

export function useSurveyData(filter: RespondentFilter) {
    return {
        companies: useRequest(getCompanyResults, filter),
        meta: useRequest(getSurveyMeta, filter)
    }
}

const loadFilterOptions = (_: null, signal: AbortSignal) => getFilterOptions(signal)

export function useFilterOptions() {
    return useRequest(loadFilterOptions, null)
}
