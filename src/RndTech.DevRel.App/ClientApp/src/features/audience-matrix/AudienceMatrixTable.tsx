import { useLayoutEffect, useRef, useState } from 'react'
import { AudienceMatrixResponse, MatrixValue } from '../../api/types'
import { MatrixMetric, MatrixSort } from '../../app/surveyState'
import { MATRIX_METRICS, MatrixRow, matrixColor, matrixMaximum, matrixPercent, matrixRows } from './audienceMatrix'
import styles from './AudienceMatrix.module.css'

type Props = {
    data: AudienceMatrixResponse,
    companies: readonly string[],
    metric: MatrixMetric,
    sort: MatrixSort,
    theme: 'light' | 'dark'
}

export default function AudienceMatrixTable({ data, companies, metric, sort, theme }: Props) {
    const [selection, setSelection] = useState<{ company: string, value: MatrixValue } | null>(null)
    const headerRef = useRef<HTMLTableSectionElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    useLayoutEffect(() => {
        const header = headerRef.current
        const scroll = scrollRef.current
        if (!header || !scroll) return
        const update = () => {
            const active = document.activeElement
            const cell = active instanceof HTMLButtonElement && scroll.contains(active) ? active : null
            const cellHeight = (cell ?? scroll.querySelector('tbody button'))?.getBoundingClientRect().height ?? 0
            const headerHeight = header.getBoundingClientRect().height
            const sticky = headerHeight + cellHeight <= scroll.clientHeight
            scroll.style.setProperty('--matrix-header-position', sticky ? 'sticky' : 'static')
            scroll.style.scrollPaddingTop = `${sticky ? headerHeight : 0}px`
            cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        }
        const observer = new ResizeObserver(update)
        observer.observe(header)
        observer.observe(scroll)
        scroll.addEventListener('focusin', update)
        update()
        return () => {
            observer.disconnect()
            scroll.removeEventListener('focusin', update)
        }
    }, [data.columns.length])
    const rows = matrixRows(data, companies, metric, sort)
    const max = matrixMaximum(rows)
    const selectedRow = rows.find(row => row.name === selection?.company)
    const columnIndex = data.columns.findIndex(column => selection !== null && column.value === selection.value)
    const selectedColumn = data.columns[columnIndex]
    const selectedCell = selectedRow?.cells[columnIndex]
    const detailText = (row: MatrixRow, index: number) => {
        const cell = row.cells[index]
        return `${row.name}; ${data.columns[index].label}; ${data.year}; ${MATRIX_METRICS[metric]}; `
            + (cell ? `${cell.votes} / ${cell.companyN} ответа; ${matrixPercent(cell.share)}` : 'Нет данных')
    }
    const close = () => setSelection(null)
    return (
        <section className={styles.result} onKeyDown={event => { if (event.key === 'Escape') close() }}>
            <p className={styles.base} role='status'>Общая группа: {data.baseRespondentCount} участников · {rows.length} компаний</p>
            {data.columns.length === 0
                ? <p>Выберите значения в поле «Колонки». Начальные группы могут отсутствовать, если общая группа пуста.</p>
                : <>
                    <div className={styles.legend} aria-label='Цветовая шкала'>
                        {max === null ? 'Нет данных для цветовой шкалы'
                            : <><span className={styles.gradient} style={{ background: `linear-gradient(to right, ${matrixColor(0, max, theme).backgroundColor}, ${matrixColor(max, max, theme).backgroundColor})` }} />
                                {max === 0 ? '0% — все значения равны нулю' : `0% — ${matrixPercent(max)}`}</>}
                        <span>Одна шкала для всех показанных ячеек. Насыщенность не означает статистическую значимость.</span>
                    </div>
                    <p>В ячейке: доля и число отметок / ответов о компании. N в заголовке — число людей колонки.</p>
                    <div ref={scrollRef} className={styles.scroll} role='region' aria-label='Матрица аудиторий, прокручиваемая таблица' tabIndex={0}>
                        <table className={styles.table} style={{ width: `calc(var(--matrix-name-width) + ${150 * data.columns.length}px)` }}>
                            <caption>{data.year} · {MATRIX_METRICS[metric]}</caption>
                            <thead ref={headerRef}><tr><th scope='col'>Компания</th>{data.columns.map(column => (
                                <th scope='col' key={JSON.stringify(column.value)}>{column.label}<span>N = {column.respondentCount}</span></th>
                            ))}</tr></thead>
                            <tbody>{rows.map(row => <tr key={row.name}>
                                <th scope='row'>{row.name}</th>
                                {row.cells.map((cell, index) => <td key={JSON.stringify(data.columns[index].value)}>
                                    <button type='button' className={styles.cell}
                                        style={cell ? matrixColor(cell.share, max ?? 0, theme) : undefined}
                                        aria-label={detailText(row, index)}
                                        onMouseEnter={() => setSelection({ company: row.name, value: data.columns[index].value })}
                                        onFocus={() => setSelection({ company: row.name, value: data.columns[index].value })}
                                        onClick={() => setSelection({ company: row.name, value: data.columns[index].value })}>
                                        <strong>{cell ? matrixPercent(cell.share) : '—'}</strong>
                                        <span>{cell ? `${cell.votes} / ${cell.companyN} ответа` : 'Нет данных'}</span>
                                    </button>
                                </td>)}
                            </tr>)}</tbody>
                        </table>
                    </div>
                </>}
            {selectedRow && selectedColumn && <aside className={styles.details} aria-label='Значение ячейки' aria-live='polite'>
                <button type='button' className={styles.close} onClick={close} aria-label='Закрыть значение ячейки'>×</button>
                <strong>{selectedRow.name}</strong>
                <p>{selectedColumn.label} · {data.year} · {MATRIX_METRICS[metric]}</p>
                <p>{selectedCell ? `${matrixPercent(selectedCell.share)} · Отметок: ${selectedCell.votes} · Ответов о компании: ${selectedCell.companyN}` : 'Нет данных'}</p>
                <p>Участников колонки: {selectedColumn.respondentCount}</p>
            </aside>}
        </section>
    )
}
