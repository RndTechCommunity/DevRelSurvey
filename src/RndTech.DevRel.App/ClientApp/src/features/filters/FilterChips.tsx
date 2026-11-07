import { Button } from 'rsuite'
import { describeFilter, NO_RESTRICTIONS, RespondentFilter } from './model'
import styles from './FilterChips.module.css'

type Props = {
    filter: RespondentFilter,
    onChange: (filter: RespondentFilter) => void
}

export default function FilterChips({ filter, onChange }: Props) {
    const restrictions = describeFilter(filter)
    if (restrictions.length === 0) {
        return null
    }
    return (
        <div className={styles.chips} role='group' aria-label='Активные ограничения'>
            {restrictions.map(({ key, label, value }) => (
                <Button
                    key={key}
                    size='xs'
                    aria-label={`Убрать ограничение «${label}»: ${value}`}
                    onClick={() => onChange({ ...filter, [key]: NO_RESTRICTIONS[key] })}
                >
                    {label}: {value} <span aria-hidden>×</span>
                </Button>
            ))}
            <Button size='xs' appearance='link' onClick={() => onChange(NO_RESTRICTIONS)}>Сбросить ограничения</Button>
        </div>
    )
}
