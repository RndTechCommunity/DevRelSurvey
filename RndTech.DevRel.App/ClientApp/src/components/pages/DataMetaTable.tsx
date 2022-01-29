import { Table } from 'rsuite';
import React from 'react';
import { MetaModelTableRow } from '../../api';
import { toPercentWithTenths } from '../../format';

type DataMetaTableProps = {
    data: MetaModelTableRow[];
    header: string;
    filteredTotal: MetaModelTableRow
}

export function DataMetaTable(props: DataMetaTableProps) {
    const [sortColumn, setSortColumn] = React.useState<string>();
    const [sortType, setSortType] = React.useState();
    const [loading, setLoading] = React.useState<boolean>(false);
    
    const prepareTableData = (row: MetaModelTableRow) => {
        const total = props.filteredTotal;
        return {
            name: row.name,
            count2019: row.count2019 + ' (' + toPercentWithTenths(row.count2019 / total.count2019) + '%)',
            count2020: row.count2020 + ' (' + toPercentWithTenths(row.count2020 / total.count2020) + '%)',
            count2021: row.count2021 + ' (' + toPercentWithTenths(row.count2021 / total.count2021) + '%)'
        };
    }
    
    const getData = () => {
        if (sortColumn && sortType) {
            return props.data.sort((a, b) => {
                let x = a[sortColumn];
                let y = b[sortColumn];
                if (typeof x === 'string' && typeof y === 'string') {
                    return x < y ? (sortType === 'asc' ? 1 : -1) : (sortType === 'asc' ? -1 : 1);
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

    const handleSortColumn = (sortColumn: string, sortType: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSortColumn(sortColumn);
            // @ts-ignore
            setSortType(sortType);
        }, 500);
    };

    return (
        <Table
            autoHeight={true}
            data={getData()}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={handleSortColumn}
            loading={loading}
        >
            <Table.Column flexGrow={1} sortable>
                <Table.HeaderCell>{props.header}</Table.HeaderCell>
                <Table.Cell dataKey='name' />
            </Table.Column>

    <Table.Column sortable>
        <Table.HeaderCell>2019</Table.HeaderCell>
        <Table.Cell dataKey='count2019' />
    </Table.Column>

    <Table.Column sortable>
        <Table.HeaderCell>2020</Table.HeaderCell>
        <Table.Cell dataKey='count2020' />
    </Table.Column>

    <Table.Column sortable>
        <Table.HeaderCell>2021</Table.HeaderCell>
        <Table.Cell dataKey='count2021' />
    </Table.Column>
        </Table>);
}