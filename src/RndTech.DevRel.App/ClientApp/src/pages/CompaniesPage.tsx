import { useRef, useState } from 'react'
import { Button, Message } from 'rsuite'
import { CompanyResult } from '../api/types'
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import { NO_RESTRICTIONS } from '../features/filters/model'
import CompanyCard from '../features/companies/CompanyCard'
import CompanyMap from '../features/companies/CompanyMap'
import CompanyControls from '../features/companies/CompanyControls'
import CompanyTable from '../features/companies/CompanyTable'
import { chartMetric, companyNames, hasWantedOnlyYear, selectCompanyRows, restrictCompanies, yAxisScale } from '../features/companies/companyMetrics'
import { AsyncState, RequestState } from '../shared/AsyncState'
import styles from './CompaniesPage.module.css'
import { AboutNote, OpenAbout } from './MethodologyPage'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    companies: RequestState<readonly CompanyResult[]>,
    onAbout: OpenAbout
}

export default function CompaniesPage({ state, update, companies, onAbout }: Props) {
    const [focused, setFocused] = useState<string | null>(null)
    const cardRef = useRef<HTMLElement>(null)
    const focusCompany = (name: string | null) => {
        setFocused(name)
        if (name !== null) requestAnimationFrame(() => cardRef.current?.scrollIntoView({ block: 'nearest' }))
    }
    const availableFocus = state.companies.length === 0 || (focused !== null && state.companies.includes(focused))
        ? focused : null
    const metric = chartMetric(state, [state.year])

    return (
        <AsyncState state={companies}>
            {rows => {
                const yearRows = selectCompanyRows(rows, state.year)
                const shownRows = restrictCompanies(yearRows, state.companies)
                return (
                    <>
                        <CompanyControls state={state} update={update} companyNames={companyNames(rows)}
                            shownNames={companyNames(shownRows)} focused={availableFocus} onFocus={focusCompany} />
                        <div className={styles.results}>
                            <CompanyCard cardRef={cardRef} name={availableFocus} year={state.year}
                                row={shownRows.find(row => row.name === availableFocus)} onClose={() => setFocused(null)} />
                            <div className={styles.view}>
                                {yearRows.length === 0
                                    ? <Message type='info' showIcon>
                                        Нет данных о компаниях за {state.year} год для выбранной группы.{' '}
                                        <Button appearance='link' onClick={() => update({ filter: NO_RESTRICTIONS })}>Все участники</Button>
                                    </Message>
                                    : shownRows.length === 0
                                        ? <Message type='info'>
                                            Для выбранных компаний нет данных за {state.year} год.{' '}
                                            <Button appearance='link' onClick={() => update({ companies: [] })}>Показать все компании</Button>
                                        </Message>
                                        : state.view === 'table'
                                            ? <CompanyTable rows={shownRows} focused={availableFocus} onFocus={focusCompany} sort={state.sort} onSort={sort => update({ sort })} />
                                            : metric === null
                                                ? <Message type='info'>Показатель не выбран. Выберите показатель над картой.</Message>
                                                : <>
                                                    {hasWantedOnlyYear([state.year]) && <AboutNote section='year-2019' onAbout={onAbout}>
                                                        В 2019 году ось показывает только «Хотят работать».
                                                    </AboutNote>}
                                                    <div className={styles.chart}>
                                                        <CompanyMap rows={shownRows} focused={availableFocus} onFocus={focusCompany} year={state.year}
                                                            metric={metric} scale={yAxisScale(yearRows, metric)} />
                                                    </div>
                                                </>}
                            </div>
                        </div>
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
