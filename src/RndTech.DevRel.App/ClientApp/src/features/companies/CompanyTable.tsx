import { ReactNode } from 'react'
import { Table } from 'rsuite'
import { CompanyResult } from '../../api/types'
import { COMPANY_SORT_KEYS, CompanySortKey, SurveyState } from '../../app/surveyState'
import { formatIndex, toPercentWithTenths } from '../../shared/format'
import { sortRows } from '../../shared/sort'
import { CompanyMetrics, toCompanyMetrics } from './companyMetrics'

type Props = {
    rows: readonly CompanyResult[],
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

export default function CompanyTable({ rows, sort, onSort }: Props) {
    const metrics = rows.map(toCompanyMetrics)
    const sorted = sort ? sortRows(metrics, row => row[sort.key], sort.direction) : metrics
    const data = sorted.map(row => Object.fromEntries(COLUMNS.map(column => [column.key, column.render(row)])))

    return (
        <Table
            autoHeight={false}
            height={500}
            data={data}
            sortColumn={sort?.key}
            sortType={sort?.direction}
            onSortColumn={(dataKey, direction) => {
                const key = COMPANY_SORT_KEYS.find(k => k === dataKey)
                if (key && direction) {
                    onSort({ key, direction })
                }
            }}
        >
            {COLUMNS.map(column => (
                <Table.Column key={column.key} width={column.width} sortable>
                    <Table.HeaderCell>{column.header}</Table.HeaderCell>
                    <Table.Cell dataKey={column.key} />
                </Table.Column>
            ))}
        </Table>
    )
}
