import { Button, Message } from 'rsuite'
import { CompanyResult } from '../api/types'
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import { NO_RESTRICTIONS } from '../features/filters/model'
import CompanyMap from '../features/companies/CompanyMap'
import CompanyControls from '../features/companies/CompanyControls'
import CompanyTable from '../features/companies/CompanyTable'
import { chartMetric, companyNames, hasWantedOnlyYear, selectCompanyRows, selectMapRows, yAxisScale } from '../features/companies/companyMetrics'
import { AsyncState, RequestState } from '../shared/AsyncState'
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
    const metric = chartMetric(state, [state.year])

    return (
        <AsyncState
            state={companies}
            isEmpty={rows => selectCompanyRows(rows, state.year).length === 0}
            empty={<>
                Нет данных о компаниях за {state.year} год для выбранной группы.{' '}
                <Button appearance='link' onClick={() => update({ filter: NO_RESTRICTIONS })}>Все участники</Button>
            </>}
        >
            {rows => {
                const yearRows = selectCompanyRows(rows, state.year)
                return (
                    <>
                        <CompanyControls state={state} update={update} companyNames={companyNames(rows)} />
                        {state.view === 'table'
                            ? <CompanyTable rows={yearRows} sort={state.sort} onSort={sort => update({ sort })} />
                            : metric === null
                                ? <Message type='info'>Показатель не выбран. Выберите показатель над картой.</Message>
                                : <>
                                    {hasWantedOnlyYear([state.year]) && <AboutNote section='year-2019' onAbout={onAbout}>
                                        В 2019 году ось показывает только «Хотят работать».
                                    </AboutNote>}
                                    <div className={styles.chart}>
                                        <CompanyMap rows={selectMapRows(yearRows, state.companies)} year={state.year}
                                            metric={metric} scale={yAxisScale(yearRows, metric)} />
                                    </div>
                                </>}
                        <AboutNote section='denominators' onAbout={onAbout}>
                            Доли считаются от числа участников группы, ответивших на вопрос о компании, и у каждой
                            компании это число своё.
                        </AboutNote>
                        <AboutNote section='overlap' onAbout={onAbout}>
                            Один участник мог и рекомендовать компанию, и хотеть в ней работать, поэтому
                            «Рекомендуют + хотят» — сумма долей, а не доля людей.
                        </AboutNote>
                        <AboutNote section='indexes' onAbout={onAbout}>
                            «Сила бренда» и «Рейтинг бренда» — индексы, а не проценты людей.
                        </AboutNote>
                    </>
                )
            }}
        </AsyncState>
    )
}
