import { Button, SegmentedControl } from 'rsuite'
import { Split } from '@rsuite/icons'
import { countOf, SURVEY_YEARS, SurveyMeta, SurveyYear } from '../api/types'
import { describeFilter } from '../features/filters/model'
import { RequestState } from '../shared/AsyncState'
import styles from './SurveyBar.module.css'
import { SurveyState } from './surveyState'
import { UpdateSurveyState } from './useSurveyState'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    meta: RequestState<SurveyMeta>,
    onDuplicate: () => void
}

const YEAR_OPTIONS = [...SURVEY_YEARS].reverse().map(year => ({ value: year, label: String(year) }))

// Размер группы — meta.filtered выбранного года; пока ответ не пришёл, прежнее число не показывается.
function sampleSize(meta: RequestState<SurveyMeta>, year: SurveyYear) {
    if (meta.status === 'error') {
        return <>не удалось загрузить <Button appearance='link' onClick={meta.retry}>Повторить</Button></>
    }
    return meta.status === 'ready' && meta.data
        ? `${countOf(meta.data.filtered, year)} из ${countOf(meta.data.total, year)}`
        : '…'
}

export default function SurveyBar({ state, update, meta, onDuplicate }: Props) {
    const group = describeFilter(state.filter).map(restriction => restriction.value).join(', ') || 'Все участники'

    const selectYear = (value: string | number | null) => {
        const year = SURVEY_YEARS.find(y => y === value)
        if (year) {
            update({ year }, 'push')
        }
    }

    return (
        <div className={styles.bar}>
            <div className={styles.year}>
                <span id='survey-year-label' className={styles.label}>Год исследования</span>
                <SegmentedControl
                    aria-labelledby='survey-year-label'
                    className={styles.years}
                    data={YEAR_OPTIONS}
                    value={state.year}
                    onChange={selectYear}
                />
            </div>
            <div className={styles.summary}>
                <p role='status'>{state.year} · {group} · Выборка: {sampleSize(meta, state.year)}</p>
                <Button appearance='link' onClick={onDuplicate}>
                    <Split />&nbsp;
                    Дублировать
                </Button>
            </div>
        </div>
    )
}
