import { RefObject } from 'react'
import { Button } from 'rsuite'
import { CompanyResult } from '../../api/types'
import { toPercentWithTenths } from '../../shared/format'
import styles from './CompanyCard.module.css'

type Props = {
    cardRef: RefObject<HTMLElement>,
    name: string | null,
    year: number,
    row: CompanyResult | undefined,
    onClose: () => void
}

export default function CompanyCard({ cardRef, name, year, row, onClose }: Props) {
    return (
        <aside ref={cardRef} className={styles.card} data-empty={name === null} aria-label='Карточка компании'>
            {name === null ? <p>Выберите компанию на карте, в таблице или через поиск.</p> : <>
                <div className={styles.heading}>
                    <h2>{name}</h2>
                    <Button appearance='subtle' onClick={onClose} aria-label='Закрыть карточку компании'>×</Button>
                </div>
                <h3>{year}</h3>
                {row ? <>
                    <dl>{([
                        ['Знают', row.knownVotes, row.knownLevel],
                        ['Рекомендуют', row.goodVotes, row.goodLevel],
                        ['Хотят работать', row.wantedVotes, row.wantedLevel]
                    ] as const).map(([label, count, share]) => <div key={label}>
                        <dt>{label}</dt>
                        <dd>{count} ({row.selectionCount > 0 && Number.isFinite(share) ? `${toPercentWithTenths(share)}%` : '—'})</dd>
                    </div>)}</dl>
                    <p>Ответили на вопрос о компании: {row.selectionCount}</p>
                </> : <p>Нет данных за {year} год.</p>}
            </>}
        </aside>
    )
}
