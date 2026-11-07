import { useId } from 'react'
import { Button, SelectPicker } from 'rsuite'
import MultiSelect from '../../shared/MultiSelect'
import { AGE_OPTIONS, DEFAULT_FILTER, FILTER_PRESETS, NO_RESTRICTIONS, RespondentFilter, sameFilter } from './model'
import { FilterOptions } from '../../api/types'
import { AsyncState, RequestState } from '../../shared/AsyncState'
import { usePickerFocusReturn } from '../../shared/usePickerFocusReturn'
import styles from './FilterPanel.module.css'

type Props = {
    filter: RespondentFilter,
    options: RequestState<FilterOptions>,
    onChange: (filter: RespondentFilter) => void
}

const COMMUNITY_OPTIONS: { value: 'Да' | 'Нет', label: string }[] = [{ value: 'Да', label: 'Да' }, { value: 'Нет', label: 'Нет' }]
const QUICK_FILTERS = [
    { label: 'Исходная выборка', filter: DEFAULT_FILTER },
    { label: 'Все участники', filter: NO_RESTRICTIONS }
]

export default function FilterPanel({ filter, options, onChange }: Props) {
    const change = (patch: Partial<RespondentFilter>) => onChange({ ...filter, ...patch })
    const { ref, wrapperProps } = usePickerFocusReturn()
    const id = useId()

    return (
        <div className={styles.panel}>
            <h2>Группа респондентов</h2>
            <AsyncState state={options}>
                {loaded => ([
                    { key: 'cities', label: 'Город', options: loaded.cities },
                    { key: 'ages', label: 'Возраст', options: AGE_OPTIONS },
                    { key: 'educations', label: 'Образование', options: loaded.educations },
                    { key: 'experiences', label: 'Опыт', options: loaded.experienceLevels },
                    { key: 'professions', label: 'Профессия', options: loaded.professions },
                    { key: 'languages', label: 'Язык', options: loaded.programmingLanguages }
                ] as const).map(({ key, label, options }) => (
                    <div className={styles.field} key={key}>
                        <span id={`${id}-${key}`}>{label}</span>
                        <MultiSelect
                            options={options}
                            placeholder='Все'
                            labelledBy={`${id}-${key}`}
                            value={filter[key]}
                            onChange={value => change({ [key]: value })}
                        />
                    </div>
                ))}
            </AsyncState>
            <div className={styles.field}>
                <span id={`${id}-community`}>Митапы или сообщество</span>
                <div {...wrapperProps}>
                    <SelectPicker
                        ref={ref}
                        block
                        searchable={false}
                        aria-labelledby={`${id}-community`}
                        data={COMMUNITY_OPTIONS}
                        placeholder='Все'
                        value={filter.isCommunity}
                        onChange={isCommunity => change({ isCommunity })}
                    />
                </div>
            </div>
            <h2>Быстрый выбор</h2>
            {QUICK_FILTERS.map(preset => (
                <Button key={preset.label} block disabled={sameFilter(filter, preset.filter)} onClick={() => onChange(preset.filter)}>
                    {preset.label}
                </Button>
            ))}
            <h2>Готовые группы</h2>
            {FILTER_PRESETS.map(preset => (
                <Button key={preset.label} block disabled={sameFilter(filter, preset.filter)} onClick={() => onChange(preset.filter)}>
                    {preset.label}
                </Button>
            ))}
        </div>
    )
}
