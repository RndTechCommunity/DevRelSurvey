import { Checkbox } from 'rsuite'
import { CompanyResult, countOf, SurveyMeta } from '../api/types'
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import CompanyMap from '../features/companies/CompanyMap'
import CompanyTable from '../features/companies/CompanyTable'
import { companyNames, selectCompanyRows, selectMapRows, yAxisMax } from '../features/companies/companyMetrics'
import { AsyncState, RequestState } from '../shared/AsyncState'
import MultiSelect from '../shared/MultiSelect'
import styles from './CompaniesPage.module.css'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    companies: RequestState<readonly CompanyResult[]>,
    meta: RequestState<SurveyMeta>
}

// Выбор компаний влияет на карту, таблица показывает весь год.
export default function CompaniesPage({ state, update, companies, meta }: Props) {
    const flags = { showGood: state.showGood, showWanted: state.showWanted }

    return (
        <div>
            <AsyncState state={meta}>
                {loaded => (
                    <div>
                        <h4>В выборке {countOf(loaded.filtered, state.year)} человек</h4>
                    </div>
                )}
            </AsyncState>
            <AsyncState
                state={companies}
                isEmpty={rows => selectCompanyRows(rows, state.year).length === 0}
                empty={`Нет данных о компаниях за ${state.year} год для выбранной группы.`}
            >
                {rows => {
                    const yearRows = selectCompanyRows(rows, state.year)
                    return (
                        <div>
                            <div className={styles.companies}>
                                <div className={styles.graphicFilter}>
                                    <div className={styles.graphicFilterCompanies}>
                                        <label>Компании</label>
                                    </div>
                                    <MultiSelect
                                        options={companyNames(rows)}
                                        placeholder='Компании'
                                        value={state.companies}
                                        onChange={companies => update({ companies })}
                                    />
                                    <Checkbox
                                        checked={state.showLegacyError}
                                        onChange={(_, checked) => update({ showLegacyError: checked })}
                                    >
                                        Отображать доверительный интервал
                                    </Checkbox>
                                    <Checkbox
                                        checked={state.showGood}
                                        onChange={(_, checked) => update({ showGood: checked })}
                                    >
                                        Знаю и рекомендую
                                    </Checkbox>
                                    <Checkbox
                                        checked={state.showWanted}
                                        onChange={(_, checked) => update({ showWanted: checked })}
                                    >
                                        Знаю и хочу работать
                                    </Checkbox>
                                </div>
                            </div>
                            <div className={styles.chart}>
                                <CompanyMap
                                    rows={selectMapRows(yearRows, state.companies)}
                                    yAxisMax={yAxisMax(yearRows, flags)}
                                    flags={flags}
                                    showLegacyError={state.showLegacyError}
                                />
                            </div>
                            <CompanyTable rows={yearRows} sort={state.sort} onSort={sort => update({ sort })} />
                        </div>
                    )
                }}
            </AsyncState>
        </div>
    )
}
