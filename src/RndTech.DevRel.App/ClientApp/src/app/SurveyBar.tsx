import { Button, SegmentedControl, SelectPicker } from 'rsuite'
import { Split } from '@rsuite/icons'
import { AudienceMatrixResponse, countOf, SURVEY_YEARS, SurveyMeta, SurveyYear } from '../api/types'
import { describeFilter } from '../features/filters/model'
import { RequestState } from '../shared/AsyncState'
import { usePickerFocusReturn } from '../shared/usePickerFocusReturn'
import styles from './SurveyBar.module.css'
import { SurveyState } from './surveyState'
import { UpdateSurveyState } from './useSurveyState'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    meta: RequestState<SurveyMeta>,
    matrixRequest?: RequestState<AudienceMatrixResponse>,
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

export default function SurveyBar({ state, update, meta, matrixRequest, onDuplicate }: Props) {
    const { ref, wrapperProps, pickerProps } = usePickerFocusReturn()
    const group = describeFilter(state.filter).map(restriction => restriction.value).join(', ') || 'Все участники'

    const selectYear = (value: string | number | null) => {
        const year = SURVEY_YEARS.find(y => y === value)
        if (year) {
            update({ year, compareYear: state.page !== 'audience-matrix' && year === state.compareYear ? null : state.compareYear }, 'push')
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
                {state.page === 'audience-matrix' ? <span>Матрица показывает один год. Сохранённое сравнение работает на других страницах.</span> : <>
                    <span id='compare-year-label' className={styles.label}>Сравнить с</span>
                    <div {...wrapperProps}>
                        <SelectPicker ref={ref} {...pickerProps} className={styles.compare}
                            aria-labelledby='compare-year-label' placeholder='нет' cleanable searchable={false}
                            data={YEAR_OPTIONS.filter(option => option.value !== state.year)}
                            value={state.compareYear === state.year ? null : state.compareYear} onChange={compareYear => update({ compareYear })} />
                    </div>
                    {state.compareYear === state.year && <span>Сравнение с {state.compareYear} сохранено. Выберите другой основной год, чтобы включить его.</span>}
                </>}
            </div>
            <div className={styles.summary}>
                <p role='status'>{state.year} · {group} · Выборка: {matrixRequest
                    ? matrixRequest.status === 'error' ? 'не удалось загрузить'
                        : matrixRequest.status === 'ready' ? matrixRequest.data?.baseRespondentCount : '…'
                    : sampleSize(meta, state.year)}</p>
                <Button appearance='link' onClick={onDuplicate}>
                    <Split />&nbsp;
                    Дублировать
                </Button>
            </div>
        </div>
    )
}
