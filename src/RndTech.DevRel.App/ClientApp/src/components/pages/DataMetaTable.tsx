import { Table } from 'rsuite';
import React from 'react';
import { MetaRow } from '../../api/types';
import { toPercentWithTenths } from '../../shared/format';

type DataMetaTableProps = {
    data: readonly MetaRow[];
    header: string;
    filteredTotal: MetaRow
}

export function DataMetaTable(props: DataMetaTableProps) {
    const [sortColumn, setSortColumn] = React.useState<string>();
    const [sortType, setSortType] = React.useState<SortType>('desc');

    const prepareTableData = (row: MetaRow) => {
        const total = props.filteredTotal;
        return {
            name: row.name,
            count2019: row.count2019 + ' (' + toPercentWithTenths(row.count2019 / total.count2019) + '%)',
            count2020: row.count2020 + ' (' + toPercentWithTenths(row.count2020 / total.count2020) + '%)',
            count2021: row.count2021 + ' (' + toPercentWithTenths(row.count2021 / total.count2021) + '%)',
            count2022: row.count2022 + ' (' + toPercentWithTenths(row.count2022 / total.count2022) + '%)'
        };
    }

    const getData = () => {
        if (sortColumn && sortType) {
            return (props.data as MetaRow[]).sort((a, b) => {
                // @ts-ignore
                let x = a[sortColumn];
                // @ts-ignore
                let y = b[sortColumn];
                if (typeof x === 'string' && typeof y === 'string') {
                    return x < y ? (sortType === 'asc' ? -1 : 1) : (sortType === 'asc' ? 1 : -1);
                }
                if (sortType === 'asc') {
                    return x - y;
                } else {
                    return y - x;
                }
            }).map(prepareTableData);
        }
        return props.data.map(prepareTableData);
    }
    type SortType = 'desc' | 'asc';
    const handleSortColumn = (sortColumn: string, sortType: SortType | undefined) => {
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

            <Table.Column sortable>
                <Table.HeaderCell>2019</Table.HeaderCell>
                <Table.Cell dataKey='count2019'/>
            </Table.Column>

            <Table.Column sortable>
                <Table.HeaderCell>2020</Table.HeaderCell>
                <Table.Cell dataKey='count2020'/>
            </Table.Column>

            <Table.Column sortable>
                <Table.HeaderCell>2021</Table.HeaderCell>
                <Table.Cell dataKey='count2021'/>
            </Table.Column>

            <Table.Column sortable>
                <Table.HeaderCell>2022</Table.HeaderCell>
                <Table.Cell dataKey='count2022'/>
            </Table.Column>
        </Table>);
}