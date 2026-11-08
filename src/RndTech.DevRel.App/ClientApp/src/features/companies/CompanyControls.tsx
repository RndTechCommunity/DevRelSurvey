import { Button, SegmentedControl, SelectPicker } from 'rsuite'
import { LEGACY_COMPANIES, SurveyState } from '../../app/surveyState'
import { UpdateSurveyState } from '../../app/useSurveyState'
import { usePickerFocusReturn } from '../../shared/usePickerFocusReturn'
import MultiSelect from '../../shared/MultiSelect'
import { chartMetric, hasWantedOnlyYear, METRIC_LABELS } from './companyMetrics'
import styles from './CompanyControls.module.css'

const METRICS = (['goodAndWanted', 'good', 'wanted'] as const)
    .map(value => ({ value, label: METRIC_LABELS[value] }))
const VIEWS = [{ value: 'map', label: 'Карта' }, { value: 'table', label: 'Таблица' }]

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    companyNames: readonly string[],
    shownNames: readonly string[],
    focused: string | null,
    onFocus: (name: string | null) => void
}

export default function CompanyControls({ state, update, companyNames, shownNames, focused, onFocus }: Props) {
    const { ref, wrapperProps, pickerProps } = usePickerFocusReturn(picker =>
        picker.overlay?.querySelector<HTMLInputElement>('[role="searchbox"]')?.focus({ preventScroll: true }))
    const isLegacy = state.companies.length === LEGACY_COMPANIES.length
        && LEGACY_COMPANIES.every(name => state.companies.includes(name))
    return (
        <div className={styles.controls}>
            <div className={styles.companyPicker}>
                <span id='company-filter-label'>Компании</span>
                <MultiSelect options={companyNames} placeholder='Компании' labelledBy='company-filter-label'
                    value={state.companies} onChange={companies => update({ companies })} />
                <Button disabled={isLegacy} onClick={() => update({ companies: LEGACY_COMPANIES })}>
                    Прежний набор: 29 компаний
                </Button>
                <Button disabled={state.companies.length === 0} onClick={() => update({ companies: [] })}>
                    Показать все компании
                </Button>
            </div>
            <div className={styles.companyPicker}>
                <span id='company-search-label'>Найти компанию</span>
                <div {...wrapperProps}>
                    <SelectPicker ref={ref} {...pickerProps} block cleanable
                        aria-labelledby='company-search-label' placeholder='Найти компанию'
                        data={shownNames.map(name => ({ value: name, label: name }))}
                        value={focused !== null && shownNames.includes(focused) ? focused : null}
                        onChange={onFocus} />
                </div>
            </div>
            <div className={styles.field}>
                <span id='company-metric-label'>Показатель</span>
                <SegmentedControl aria-labelledby='company-metric-label' className={styles.metrics}
                    data={hasWantedOnlyYear([state.year]) ? METRICS.filter(metric => metric.value === 'wanted') : METRICS}
                    value={chartMetric(state, [state.year])}
                    onChange={value => update({ showGood: value !== 'wanted', showWanted: value !== 'good' })} />
            </div>
            <div className={styles.field}>
                <span id='company-view-label'>Вид</span>
                <SegmentedControl aria-labelledby='company-view-label' data={VIEWS} value={state.view}
                    onChange={value => { if (value === 'map' || value === 'table') update({ view: value }) }} />
            </div>
        </div>
    )
}
