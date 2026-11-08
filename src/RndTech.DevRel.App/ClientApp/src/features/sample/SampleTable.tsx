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
    compareYear: SurveyYear | null;
    filteredTotal: MetaRow;
    total: MetaRow
}

export default function SampleTable({ data, header, year, compareYear, filteredTotal, total }: Props) {
    const [sortColumn, setSortColumn] = useState<string>();
    const [sortType, setSortType] = useState<SortDirection>('desc');
    const activeColumn = sortColumn === 'compare' && compareYear === null ? 'count' : sortColumn
    const years = compareYear === null ? [year] : [year, compareYear]

    const rows = activeColumn
        ? sortRows(data, row => activeColumn === 'name' ? row.name : countOf(row, activeColumn === 'compare' ? compareYear ?? year : year), sortType)
        : data

    const sort = (column: string) => {
        setSortType(activeColumn === column && sortType === 'desc' ? 'asc' : 'desc')
        setSortColumn(column)
    }

    const heading = (column: string, label: string) => (
        <th key={column} scope='col' aria-sort={activeColumn === column ? (sortType === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <button type='button' onClick={() => sort(column)}>
                {label} <span aria-hidden>{activeColumn === column ? (sortType === 'asc' ? '↑' : '↓') : '↕'}</span>
            </button>
        </th>
    )

    const renderShare = (row: MetaRow, shownYear: SurveyYear) => {
        const yearTotal = countOf(filteredTotal, shownYear)
        const count = countOf(row, shownYear)
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
        <table className={`${tableStyles.table} ${styles.table}`} data-comparison={compareYear !== null}>
            <thead><tr>
                {heading('name', header)}
                {years.map((shownYear, index) => heading(index === 0 ? 'count' : 'compare',
                    `${shownYear} · ${countOf(filteredTotal, shownYear)} из ${countOf(total, shownYear)}`))}
            </tr></thead>
            <tbody>{rows.map(row => (
                <tr key={row.name}>
                    <td>{row.name}</td>
                    {years.map(shownYear => <td key={shownYear}>{renderShare(row, shownYear)}</td>)}
                </tr>
            ))}</tbody>
        </table>
    )
}
