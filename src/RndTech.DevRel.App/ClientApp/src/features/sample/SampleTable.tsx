import { useState } from 'react';
import { Table } from 'rsuite';
import { countOf, MetaRow, SURVEY_YEARS } from '../../api/types';
import { formatShare } from '../../shared/format';
import { sortRows, SortDirection } from '../../shared/sort';

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
        const cells: { [column: string]: string } = { name: row.name }
        SURVEY_YEARS.forEach(year => {
            cells[`count${year}`] = formatShare(countOf(row, year), countOf(props.filteredTotal, year))
        })
        return cells
    }

    const rows = sortColumn
        ? sortRows(props.data, row => cellValue(row, sortColumn), sortType)
        : props.data

    const handleSortColumn = (sortColumn: string, sortType: SortDirection | undefined) => {
        setSortColumn(sortColumn);
        setSortType(sortType ?? 'desc');
    };

    return (
        <Table
            autoHeight={true}
            data={rows.map(prepareTableData)}
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
