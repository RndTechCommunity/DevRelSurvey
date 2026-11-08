import { useState } from 'react';
import { countOf, MetaRow, SurveyYear } from '../../api/types';
import { formatShare, shareOf } from '../../shared/format';
import { sortRows, SortDirection } from '../../shared/sort';
import tableStyles from '../../shared/Table.module.css'
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

    const sort = (column: string) => {
        setSortType(sortColumn === column && sortType === 'desc' ? 'asc' : 'desc')
        setSortColumn(column)
    }

    const heading = (column: string, label: string) => (
        <th scope='col' aria-sort={sortColumn === column ? (sortType === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <button type='button' onClick={() => sort(column)}>
                {label} <span aria-hidden>{sortColumn === column ? (sortType === 'asc' ? '↑' : '↓') : '↕'}</span>
            </button>
        </th>
    )

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
        <table className={`${tableStyles.table} ${styles.table}`}>
            <thead><tr>
                {heading('name', header)}
                {heading('count', `${year} · ${yearTotal} из ${countOf(total, year)}`)}
            </tr></thead>
            <tbody>{rows.map(row => (
                <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{renderShare(row)}</td>
                </tr>
            ))}</tbody>
        </table>
    )
}
