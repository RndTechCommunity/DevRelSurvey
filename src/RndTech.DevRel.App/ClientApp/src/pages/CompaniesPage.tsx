import { Checkbox } from 'rsuite'
import { CompanyResult } from '../api/types'
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import CompanyMap from '../features/companies/CompanyMap'
import CompanyTable from '../features/companies/CompanyTable'
import { companyNames, selectCompanyRows, selectMapRows, yAxisMax } from '../features/companies/companyMetrics'
import { AsyncState, RequestState } from '../shared/AsyncState'
import MultiSelect from '../shared/MultiSelect'
import styles from './CompaniesPage.module.css'
import { AboutNote, OpenAbout } from './MethodologyPage'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    companies: RequestState<readonly CompanyResult[]>,
    onAbout: OpenAbout
}

// Выбор компаний влияет на карту, таблица показывает весь год.
export default function CompaniesPage({ state, update, companies, onAbout }: Props) {
    const flags = { showGood: state.showGood, showWanted: state.showWanted }

    return (
        <AsyncState
            state={companies}
            isEmpty={rows => selectCompanyRows(rows, state.year).length === 0}
            empty={`Нет данных о компаниях за ${state.year} год для выбранной группы.`}
        >
            {rows => {
                const yearRows = selectCompanyRows(rows, state.year)
                return (
                    <>
                        <div className={styles.controls}>
                            <label>Компании</label>
                            <div className={styles.companyPicker}>
                                <MultiSelect
                                    options={companyNames(rows)}
                                    placeholder='Компании'
                                    value={state.companies}
                                    onChange={companies => update({ companies })}
                                />
                            </div>
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
                        <div className={styles.chart}>
                            <CompanyMap
                                rows={selectMapRows(yearRows, state.companies)}
                                yAxisMax={yAxisMax(yearRows, flags)}
                                flags={flags}
                                showLegacyError={state.showLegacyError}
                            />
                        </div>
                        <AboutNote section='denominators' onAbout={onAbout}>
                            Доли считаются от числа участников группы, ответивших на вопрос о компании, и у каждой
                            компании это число своё.
                        </AboutNote>
                        <AboutNote section='overlap' onAbout={onAbout}>
                            Один участник мог и рекомендовать компанию, и хотеть в ней работать, поэтому
                            «Рекомендуют + хотят» — сумма долей, а не доля людей.
                        </AboutNote>
                        <CompanyTable rows={yearRows} sort={state.sort} onSort={sort => update({ sort })} />
                        <AboutNote section='indexes' onAbout={onAbout}>
                            «Сила бренда» и «Рейтинг бренда» — индексы, а не проценты людей.
                        </AboutNote>
                    </>
                )
            }}
        </AsyncState>
    )
}
