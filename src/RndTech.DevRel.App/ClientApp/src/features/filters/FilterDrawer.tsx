import { useEffect, useRef, useState } from 'react'
import { Button, Drawer } from 'rsuite'
import { FilterOptions } from '../../api/types'
import { RequestState } from '../../shared/AsyncState'
import FilterPanel from './FilterPanel'
import { describeFilter, RespondentFilter, sameFilter } from './model'
import styles from './FilterDrawer.module.css'

type Props = {
    filter: RespondentFilter,
    options: RequestState<FilterOptions>,
    onChange: (filter: RespondentFilter) => void
}

function Draft({ filter, options, onChange, onClose }: Props & { onClose: () => void }) {
    const [draft, setDraft] = useState(filter)
    const closeRef = useRef<HTMLButtonElement>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)
    return (
        <>
            <Drawer.Header closeButton={false}>
                <Button ref={closeRef} appearance='subtle' aria-label='Закрыть' onClick={onClose} onKeyDown={event => {
                    if (event.key === 'Tab' && event.shiftKey) {
                        event.preventDefault()
                        cancelRef.current?.focus()
                    }
                }}><span aria-hidden>×</span></Button>
                <Drawer.Title>Фильтры</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body className={styles.body}>
                <FilterPanel filter={draft} options={options} onChange={setDraft} />
            </Drawer.Body>
            <div className={styles.footer}>
                <Button appearance='primary' onClick={() => {
                    if (!sameFilter(filter, draft)) onChange(draft)
                    onClose()
                }}>Показать результаты</Button>
                <Button ref={cancelRef} onClick={onClose} onKeyDown={event => {
                    if (event.key === 'Tab' && !event.shiftKey) {
                        event.preventDefault()
                        closeRef.current?.focus()
                    }
                }}>Отмена</Button>
            </div>
        </>
    )
}

export default function FilterDrawer({ filter, options, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const drawerRef = useRef<HTMLDivElement>(null)
    const [session, setSession] = useState(0)
    useEffect(() => {
        const resetDraft = () => {
            drawerRef.current?.focus()
            setSession(value => value + 1)
        }
        window.addEventListener('popstate', resetDraft)
        return () => window.removeEventListener('popstate', resetDraft)
    }, [])
    const close = () => setOpen(false)
    return (
        <>
            <Button ref={triggerRef} onClick={() => {
                setSession(value => value + 1)
                setOpen(true)
            }}>Фильтры · {describeFilter(filter).length}</Button>
            <Drawer ref={drawerRef} open={open} onClose={close} size='sm' className={styles.drawer} dialogClassName={styles.dialog}
                onExited={() => requestAnimationFrame(() => {
                    if (!drawerRef.current) triggerRef.current?.focus()
                })}>
                <Draft key={`${session}:${JSON.stringify(filter)}`} filter={filter} options={options} onChange={onChange} onClose={close} />
            </Drawer>
        </>
    )
}
