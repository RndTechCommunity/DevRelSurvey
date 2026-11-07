import { useState } from 'react';
import { Table } from 'rsuite';
import { countOf, MetaRow, SurveyYear } from '../../api/types';
import { formatShare, shareOf } from '../../shared/format';
import { sortRows, SortDirection } from '../../shared/sort';
import styles from './SampleTable.module.css';

type Props = {
    data: readonly MetaRow[];
    header: string;
    year: SurveyYear;
    filteredTotal: MetaRow;
    total: MetaRow
}

export default function SampleTable({ data, header, year, filteredTotal, total }: Props) {
    const [sortColumn, setSortColumn] = useState<string>();
    const [sortType, setSortType] = useState<SortDirection>('desc');
    const yearTotal = countOf(filteredTotal, year)

    const rows = sortColumn
        ? sortRows(data, row => sortColumn === 'count' ? countOf(row, year) : row.name, sortType)
        : data

    const handleSortColumn = (sortColumn: string, sortType: SortDirection | undefined) => {
        setSortColumn(sortColumn);
        setSortType(sortType ?? 'desc');
    };

    const renderShare = (row: MetaRow) => {
        const count = countOf(row, year)
        const share = shareOf(count, yearTotal)
        return (
            <span className={styles.share}>
                <span className={styles.value}>{formatShare(count, yearTotal)}</span>
                {share !== null && (
                    <span className={styles.track} aria-hidden>
                        <span className={styles.bar} style={{ width: `${share * 100}%` }} />
                    </span>
                )}
            </span>
        )
    }

    return (
        <Table
            autoHeight={true}
            data={rows}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={handleSortColumn}
            defaultSortType={'desc'}
        >
            {/* Названиям — две трети ширины: самые длинные помещаются в строку от 1224 px.
                Перенос (wordWrap) не подходит: rsuite-table не пересчитывает высоту строк при изменении ширины. */}
            <Table.Column flexGrow={2} sortable>
                <Table.HeaderCell>{header}</Table.HeaderCell>
                <Table.Cell dataKey='name'/>
            </Table.Column>

            <Table.Column flexGrow={1} sortable>
                <Table.HeaderCell>{`${year} · ${yearTotal} из ${countOf(total, year)}`}</Table.HeaderCell>
                <Table.Cell dataKey='count'>{renderShare}</Table.Cell>
            </Table.Column>
        </Table>);
}
