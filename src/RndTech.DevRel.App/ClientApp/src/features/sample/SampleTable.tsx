import { useState } from 'react';
import { Table } from 'rsuite';
import { countOf, MetaRow, SURVEY_YEARS } from '../../api/types';
import { SortDirection } from '../../app/surveyState';
import { toPercentWithTenths } from '../../shared/format';

type Props = {
    data: readonly MetaRow[];
    header: string;
    filteredTotal: MetaRow
}

function cellValue(row: MetaRow, column: string): string | number {
    const year = SURVEY_YEARS.find(y => `count${y}` === column)
    return year ? countOf(row, year) : row.name
}

export default function SampleTable(props: Props) {
    const [sortColumn, setSortColumn] = useState<string>();
    const [sortType, setSortType] = useState<SortDirection>('desc');

    const prepareTableData = (row: MetaRow) => {
        const total = props.filteredTotal;
        const cells: { [column: string]: string } = { name: row.name }
        SURVEY_YEARS.forEach(year => {
            cells[`count${year}`] = countOf(row, year) + ' ('
                + toPercentWithTenths(countOf(row, year) / countOf(total, year)) + '%)'
        })
        return cells
    }

    const getData = () => {
        if (sortColumn && sortType) {
            return (props.data as MetaRow[]).sort((a, b) => {
                const x = cellValue(a, sortColumn);
                const y = cellValue(b, sortColumn);
                if (typeof x === 'string' && typeof y === 'string') {
                    return x < y ? (sortType === 'asc' ? -1 : 1) : (sortType === 'asc' ? 1 : -1);
                }
                if (sortType === 'asc') {
                    return Number(x) - Number(y);
                } else {
                    return Number(y) - Number(x);
                }
            }).map(prepareTableData);
        }
        return props.data.map(prepareTableData);
    }

    const handleSortColumn = (sortColumn: string, sortType: SortDirection | undefined) => {
        setSortColumn(sortColumn);
        setSortType(sortType!);
    };

    return (
        <Table
            autoHeight={true}
            data={getData()}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={handleSortColumn}
            defaultSortType={'desc'}
            width={1100}
        >
            <Table.Column flexGrow={1} sortable>
                <Table.HeaderCell>{props.header}</Table.HeaderCell>
                <Table.Cell dataKey='name'/>
            </Table.Column>

            {SURVEY_YEARS.map(year => (
                <Table.Column key={year} sortable>
                    <Table.HeaderCell>{year}</Table.HeaderCell>
                    <Table.Cell dataKey={`count${year}`}/>
                </Table.Column>
            ))}
        </Table>);
}
