import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, Whisper, WhisperInstance } from 'rsuite'
import { AudienceMatrixResponse } from '../../api/types'
import { MatrixMetric, MatrixSort } from '../../app/surveyState'
import { MATRIX_METRICS, MatrixRow, matrixColor, matrixMaximum, matrixPercent, matrixRows } from './audienceMatrix'
import styles from './AudienceMatrix.module.css'

type Props = {
    data: AudienceMatrixResponse,
    companies: readonly string[],
    metric: MatrixMetric,
    sort: MatrixSort,
    onSort: (sort: MatrixSort) => void
}

export default function AudienceMatrixTable({ data, companies, metric, sort, onSort }: Props) {
    const [selection, setSelection] = useState<string | null>(null)
    const headerRef = useRef<HTMLTableSectionElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const anchorRef = useRef<HTMLButtonElement | null>(null)
    const speakerRef = useRef<HTMLDivElement | null>(null)
    const whisperRef = useRef<WhisperInstance>(null)
    const closeTimer = useRef<ReturnType<typeof setTimeout>>()
    const tooltipId = useId()
    const rows = useMemo(() => matrixRows(data, companies, metric, sort), [data, companies, metric, sort])
    const max = matrixMaximum(rows)
    const cancelClose = () => clearTimeout(closeTimer.current)
    const open = (key: string, button: HTMLButtonElement) => {
        cancelClose()
        anchorRef.current = button
        setSelection(key)
    }
    const scheduleClose = (key: string) => {
        cancelClose()
        closeTimer.current = setTimeout(() => {
            if (anchorRef.current !== document.activeElement && !anchorRef.current?.matches(':hover') && !speakerRef.current?.matches(':hover')) {
                setSelection(current => current === key ? null : current)
            }
        }, 200)
    }
    useLayoutEffect(() => () => {
        clearTimeout(closeTimer.current)
        setSelection(null)
    }, [rows])
    useLayoutEffect(() => {
        const header = headerRef.current
        const scroll = scrollRef.current
        const table = header?.closest('table')
        if (!header || !scroll || !table) return
        let offset = 0
        header.style.transform = ''
        const affix = () => {
            const height = header.getBoundingClientRect().height
            const cellHeight = table.querySelector('tbody button')?.getBoundingClientRect().height ?? 0
            const naturalTop = header.getBoundingClientRect().top - offset
            offset = height + cellHeight + 8 <= innerHeight
                ? Math.max(0, Math.min(-naturalTop, table.getBoundingClientRect().bottom - height - naturalTop)) : 0
            header.style.transform = `translateY(${offset}px)`
        }
        const revealFocus = () => {
            affix()
            const active = document.activeElement
            if (!(active instanceof HTMLButtonElement) || !table.tBodies[0]?.contains(active)) return
            const height = header.getBoundingClientRect().height
            const affixed = height + active.offsetHeight + 8 <= innerHeight
            active.style.scrollMarginTop = `${affixed ? height + 4 : 4}px`
            active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
            affix()
            const rect = active.getBoundingClientRect()
            const top = affixed ? Math.max(0, header.getBoundingClientRect().bottom) + 4 : 4
            const correction = rect.top < top ? rect.top - top : Math.max(0, rect.bottom + 4 - innerHeight)
            if (correction) window.scrollBy(0, correction)
            affix()
        }
        const observer = new ResizeObserver(revealFocus)
        observer.observe(header)
        observer.observe(table)
        observer.observe(scroll)
        window.addEventListener('scroll', affix, { passive: true })
        window.addEventListener('resize', revealFocus)
        scroll.addEventListener('focusin', revealFocus)
        affix()
        return () => {
            observer.disconnect()
            window.removeEventListener('scroll', affix)
            window.removeEventListener('resize', revealFocus)
            scroll.removeEventListener('focusin', revealFocus)
            header.style.transform = ''
        }
    }, [rows])
    useEffect(() => {
        if (selection === null) return
        const scroll = scrollRef.current!
        const closeOutside = (event: PointerEvent) => {
            if (event.target instanceof Node && !anchorRef.current?.contains(event.target) && !speakerRef.current?.contains(event.target)) setSelection(null)
        }
        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelection(null) }
        let positionTimer: ReturnType<typeof setTimeout>
        const updatePosition = () => {
            const anchor = anchorRef.current
            if (!anchor) return
            const rect = anchor.getBoundingClientRect()
            const region = scroll.getBoundingClientRect()
            const name = anchor.closest('tr')!.querySelector('th')!.getBoundingClientRect()
            const header = headerRef.current!.getBoundingClientRect()
            if (rect.right <= Math.max(0, region.left, name.right) || rect.left >= Math.min(innerWidth, region.right)
                || rect.bottom <= Math.max(0, header.bottom) || rect.top >= Math.min(innerHeight, region.bottom)) setSelection(null)
            else whisperRef.current?.updatePosition()
        }
        const position = () => {
            updatePosition()
            clearTimeout(positionTimer)
            positionTimer = setTimeout(updatePosition, 100)
        }
        const observer = new ResizeObserver(position)
        observer.observe(scroll)
        observer.observe(headerRef.current!)
        document.addEventListener('pointerdown', closeOutside)
        document.addEventListener('keydown', escape)
        scroll.addEventListener('scroll', position, { passive: true })
        window.addEventListener('scroll', position, { passive: true })
        window.addEventListener('resize', position)
        return () => {
            observer.disconnect()
            clearTimeout(positionTimer)
            document.removeEventListener('pointerdown', closeOutside)
            document.removeEventListener('keydown', escape)
            scroll.removeEventListener('scroll', position)
            window.removeEventListener('scroll', position)
            window.removeEventListener('resize', position)
        }
    }, [selection])
    const detailText = (row: MatrixRow, index: number) => {
        const cell = row.cells[index]
        return `${row.name}; ${data.columns[index].label}; ${data.year}; ${MATRIX_METRICS[metric]}; `
            + (cell ? `${matrixPercent(cell.share)}; Отметок: ${cell.votes}; Ответов о компании: ${cell.companyN}` : 'Нет данных')
    }
    const header = (label: string, next: MatrixSort, n?: number) => {
        const active = sort.by === next.by && (next.by === 'name' || sort.by === 'column' && sort.value === next.value)
        return <th scope='col' key={next.by === 'name' ? 'name' : JSON.stringify(next.value)}
            aria-sort={active ? sort.direction === 'asc' ? 'ascending' : 'descending' : undefined}>
            <button type='button' onClick={() => onSort({ ...next, direction: active ? sort.direction === 'asc' ? 'desc' : 'asc' : next.direction })}>
                {label} <span aria-hidden>{active ? sort.direction === 'asc' ? '↑' : '↓' : '↕'}</span>
                {n !== undefined && <span className={styles.count}>N = {n}</span>}
            </button>
        </th>
    }
    return (
        <section className={styles.result}>
            {data.columns.length === 0
                ? <p>Выберите значения в поле «Колонки». Начальные группы могут отсутствовать, если общая группа пуста.</p>
                : <div ref={scrollRef} className={styles.scroll} role='region' aria-label='Матрица аудиторий, прокручиваемая таблица' tabIndex={0}>
                    <table className={styles.table} style={{ width: `calc(var(--matrix-name-width) + ${150 * data.columns.length}px)` }}>
                        <caption>{data.year} · {MATRIX_METRICS[metric]}</caption>
                        <thead ref={headerRef}><tr>
                            {header('Компания', { by: 'name', direction: 'asc' })}
                            {data.columns.map(column => header(column.label, { by: 'column', value: column.value, direction: 'desc' }, column.respondentCount))}
                        </tr></thead>
                        <tbody>{rows.map(row => <tr key={row.name}>
                            <th scope='row'>{row.name}</th>
                            {row.cells.map((cell, index) => {
                                const key = JSON.stringify([row.name, data.columns[index].value])
                                const active = selection === key
                                return <td key={JSON.stringify(data.columns[index].value)}>
                                    <Whisper ref={active ? whisperRef : undefined} placement='auto' preventOverflow containerPadding={8} trigger='none' open={active}
                                        controlId={active ? tooltipId : undefined}
                                        speaker={({ left, top, className, id, placement }, ref) => <Tooltip id={id}
                                            data-placement={placement.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}
                                            ref={(node: HTMLDivElement | null) => { ref(node); if (active) speakerRef.current = node }}
                                            className={`${styles.tooltip} ${className ?? ''}`}
                                            style={{ ...{ '--rs-position-x': `${left}px`, '--rs-position-y': `${top}px` }, display: active ? undefined : 'none' }} aria-hidden={!active}
                                            onPointerEnter={cancelClose} onPointerLeave={() => scheduleClose(key)}>
                                            <strong>{row.name}</strong>
                                            <div>{data.columns[index].label} · {data.year} · {MATRIX_METRICS[metric]}</div>
                                            <div>{cell ? `${matrixPercent(cell.share)} · Отметок: ${cell.votes} · Ответов о компании: ${cell.companyN}` : 'Нет данных'}</div>
                                        </Tooltip>}>
                                        <button type='button' className={styles.cell}
                                            style={cell ? matrixColor(cell.share, max ?? 0) : undefined}
                                            aria-label={detailText(row, index)}
                                            onPointerEnter={event => { if (event.pointerType === 'mouse') open(key, event.currentTarget) }}
                                            onPointerLeave={() => scheduleClose(key)} onBlur={() => scheduleClose(key)}
                                            onFocus={event => open(key, event.currentTarget)}
                                            onClick={event => open(key, event.currentTarget)}>
                                            {cell ? matrixPercent(cell.share) : '—'}
                                        </button>
                                    </Whisper>
                                </td>
                            })}
                        </tr>)}</tbody>
                    </table>
                </div>}
        </section>
    )
}
