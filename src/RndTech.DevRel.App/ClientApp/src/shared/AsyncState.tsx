import { ReactNode } from 'react'
import { Button, Loader, Message } from 'rsuite'

export type RequestState<T> = {
    readonly status: 'loading' | 'ready' | 'error',
    // При загрузке — данные предыдущего успешного запроса, если он был.
    readonly data?: T,
    readonly retry: () => void
}

type Props<T> = {
    state: RequestState<T>,
    isEmpty?: (data: T) => boolean,
    empty?: ReactNode,
    children: (data: T) => ReactNode
}

export function AsyncState<T>({ state, isEmpty, empty, children }: Props<T>) {
    if (state.status === 'error') {
        return (
            <Message type='error' showIcon>
                Не удалось загрузить данные.{' '}
                <Button appearance='link' onClick={state.retry}>Повторить</Button>
            </Message>
        )
    }
    if (state.data === undefined) {
        return <Loader content='Загрузка данных' />
    }
    return (
        <div style={{ position: 'relative' }}>
            {isEmpty?.(state.data) ? <Message type='info' showIcon>{empty}</Message> : children(state.data)}
            {state.status === 'loading' && <Loader backdrop content='Обновление…' vertical />}
        </div>
    )
}
