import { ReactNode, useLayoutEffect, useRef } from 'react'
import { CompanyResult } from '../../api/types'
import { CompanySortKey, SurveyState } from '../../app/surveyState'
import { formatIndex, toPercentWithTenths } from '../../shared/format'
import { sortRows } from '../../shared/sort'
import tableStyles from '../../shared/Table.module.css'
import styles from './CompanyTable.module.css'
import { CompanyMetrics, toCompanyMetrics } from './companyMetrics'

type Props = {
    rows: readonly CompanyResult[],
    focused: string | null,
    onFocus: (name: string) => void,
    sort: SurveyState['sort'],
    onSort: (sort: NonNullable<SurveyState['sort']>) => void
}

const UNDEFINED_INDEX = 'Не определено: «Знают» не больше, чем «Рекомендуют + хотят»'

const share = (value: number) => toPercentWithTenths(value) + '%'

const index = (value: number | null) => (
    <span title={value === null ? UNDEFINED_INDEX : undefined}>{formatIndex(value)}</span>
)

const COLUMNS: readonly { key: CompanySortKey, header: string, width: number, render: (row: CompanyMetrics) => ReactNode }[] = [
    { key: 'name', header: 'Компания', width: 290, render: row => row.name },
    { key: 'known', header: 'Знают', width: 100, render: row => share(row.known) },
    { key: 'good', header: 'Рекомендуют', width: 120, render: row => share(row.good) },
    { key: 'wanted', header: 'Хотят', width: 100, render: row => share(row.wanted) },
    { key: 'goodAndWanted', header: 'Рекомендуют + хотят', width: 160, render: row => share(row.goodAndWanted) },
    { key: 'brandPower', header: 'Сила бренда', width: 140, render: row => index(row.brandPower) },
    { key: 'brandRating', header: 'Рейтинг бренда', width: 140, render: row => index(row.brandRating) }
]

export default function CompanyTable({ rows, sort, onSort, focused, onFocus }: Props) {
    const tableRef = useRef<HTMLTableElement>(null)
    useLayoutEffect(() => {
        const table = tableRef.current!
        const header = table.tHead!
        const affix = () => {
            const rect = table.getBoundingClientRect()
            const offset = Math.max(0, Math.min(-rect.top, rect.height - header.offsetHeight))
            header.style.transform = `translateY(${offset}px)`
        }
        const observer = new ResizeObserver(affix)
        observer.observe(table)
        window.addEventListener('scroll', affix, { passive: true })
        window.addEventListener('resize', affix)
        affix()
        return () => {
            observer.disconnect()
            window.removeEventListener('scroll', affix)
            window.removeEventListener('resize', affix)
        }
    }, [rows])
    const metrics = rows.map(toCompanyMetrics)
    const sorted = sort ? sortRows(metrics, row => row[sort.key], sort.direction) : metrics

    return (
        <div className={styles.scroll} role='region' aria-label='Таблица компаний' tabIndex={0}>
            <table ref={tableRef} className={`${tableStyles.table} ${styles.table}`}>
                <colgroup>{COLUMNS.map(column => <col key={column.key} style={{ width: column.width }} />)}</colgroup>
                <thead><tr>{COLUMNS.map(column => (
                    <th key={column.key} scope='col'
                        aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                        <button type='button' onClick={() => onSort({
                            key: column.key,
                            direction: sort?.key === column.key && sort.direction === 'desc' ? 'asc' : 'desc'
                        })}>
                            {column.header} <span aria-hidden>{sort?.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                        </button>
                    </th>
                ))}</tr></thead>
                <tbody>{sorted.map(row => (
                    <tr key={row.name} className={row.name === focused ? styles.focused : undefined}
                        aria-current={row.name === focused ? true : undefined}
                        onClick={event => { if (!(event.target as Element).closest('button')) onFocus(row.name) }}>
                        {COLUMNS.map(column => <td key={column.key}>{column.key === 'name'
                            ? <button type='button' className={styles.name} onClick={() => onFocus(row.name)}>{row.name}</button>
                            : column.render(row)}</td>)}
                    </tr>
                ))}</tbody>
            </table>
        </div>
    )
}
