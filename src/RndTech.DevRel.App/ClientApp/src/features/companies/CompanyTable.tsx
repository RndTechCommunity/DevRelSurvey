import { Table } from 'rsuite'
import { CompanyResult } from '../../api/types'
import { COMPANY_SORT_KEYS, SurveyState } from '../../app/surveyState'
import { toPercentWithTenths } from '../../shared/format'
import { toCompanyMetrics } from './companyMetrics'

type Props = {
    rows: readonly CompanyResult[],
    sort: SurveyState['sort'],
    onSort: (sort: NonNullable<SurveyState['sort']>) => void
}

function toTableRow(row: CompanyResult) {
    const metrics = toCompanyMetrics(row)
    return {
        name: metrics.name,
        known: toPercentWithTenths(metrics.known) + '%',
        good: toPercentWithTenths(metrics.good) + '%',
        wanted: toPercentWithTenths(metrics.wanted) + '%',
        goodAndWanted: toPercentWithTenths(metrics.goodAndWanted) + '%',
        brandRating: toPercentWithTenths(metrics.brandRating),
        brandPower: toPercentWithTenths(metrics.brandPower),
    };
}

export default function CompanyTable({ rows, sort, onSort }: Props) {
    const getTableData = () => {
        const tableRows = rows.map(toTableRow)
        if (!sort) {
            return tableRows
        }
        const { key, direction } = sort
        return tableRows.sort((a, b) => {
            if (key === 'name') {
                return a.name < b.name ? (direction === 'asc' ? -1 : 1) : (direction === 'asc' ? 1 : -1);
            }

            const x = parseFloat(String(a[key]))
            const y = parseFloat(String(b[key]))
            if (direction === 'asc') {
                return x - y;
            } else {
                return y - x;
            }
        });
    }

    return (
        <Table
            autoHeight={false}
            height={500}
            data={getTableData()}
            sortColumn={sort?.key}
            sortType={sort?.direction}
            style={{marginRight: '50px', marginTop: '30px'}}
            onSortColumn={(dataKey, direction) => {
                const key = COMPANY_SORT_KEYS.find(k => k === dataKey)
                if (key && direction) {
                    onSort({ key, direction })
                }
            }}
        >
            <Table.Column width={290} sortable>
                <Table.HeaderCell>Компания</Table.HeaderCell>
                <Table.Cell dataKey='name' />
            </Table.Column>

            <Table.Column width={100} sortable>
                <Table.HeaderCell>Знают</Table.HeaderCell>
                <Table.Cell dataKey='known' />
            </Table.Column>

            <Table.Column width={120} sortable>
                <Table.HeaderCell>Рекомендуют</Table.HeaderCell>
                <Table.Cell dataKey='good' />
            </Table.Column>

            <Table.Column width={100} sortable>
                <Table.HeaderCell>Хотят</Table.HeaderCell>
                <Table.Cell dataKey='wanted' />
            </Table.Column>

            <Table.Column width={160} sortable>
                <Table.HeaderCell>Рекомендуют + хотят</Table.HeaderCell>
                <Table.Cell dataKey='goodAndWanted' />
            </Table.Column>

            <Table.Column width={140} sortable>
                <Table.HeaderCell>Сила бренда</Table.HeaderCell>
                <Table.Cell dataKey='brandPower' />
            </Table.Column>

            <Table.Column width={140} sortable>
                <Table.HeaderCell>Рейтинг бренда</Table.HeaderCell>
                <Table.Cell dataKey='brandRating' />
            </Table.Column>
        </Table>
    )
}
