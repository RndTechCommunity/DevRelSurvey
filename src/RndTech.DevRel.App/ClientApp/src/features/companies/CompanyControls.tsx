import { SegmentedControl } from 'rsuite'
import { SurveyState } from '../../app/surveyState'
import { UpdateSurveyState } from '../../app/useSurveyState'
import MultiSelect from '../../shared/MultiSelect'
import { chartMetric, hasWantedOnlyYear, METRIC_LABELS } from './companyMetrics'
import styles from './CompanyControls.module.css'

const METRICS = (['goodAndWanted', 'good', 'wanted'] as const)
    .map(value => ({ value, label: METRIC_LABELS[value] }))
const VIEWS = [{ value: 'map', label: 'Карта' }, { value: 'table', label: 'Таблица' }]

type Props = { state: SurveyState, update: UpdateSurveyState, companyNames: readonly string[] }

export default function CompanyControls({ state, update, companyNames }: Props) {
    return (
        <div className={styles.controls}>
            <div className={styles.companyPicker}>
                <span id='company-filter-label'>Компании</span>
                <MultiSelect options={companyNames} placeholder='Компании' labelledBy='company-filter-label'
                    value={state.companies} onChange={companies => update({ companies })} />
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
