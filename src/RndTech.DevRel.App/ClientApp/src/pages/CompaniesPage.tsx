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
import { chartMetric, companyNames, hasWantedOnlyYear, pairCompanies, restrictCompanies, yAxisScale } from '../features/companies/companyMetrics'
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
    const years: readonly number[] = state.compareYear === null ? [state.year] : [state.year, state.compareYear]
    const metric = chartMetric(state, years)
    const yearLabel = state.compareYear === null ? `${state.year} год` : `${state.year} и ${state.compareYear} годы`

    return (
        <AsyncState state={companies}>
            {rows => {
                const yearRows = rows.filter(row => years.includes(row.year))
                const shownRows = restrictCompanies(yearRows, state.companies)
                return (
                    <>
                        <CompanyControls state={state} update={update} companyNames={companyNames(rows)}
                            shownNames={companyNames(shownRows)} focused={availableFocus} onFocus={focusCompany} />
                        <div className={styles.results}>
                            <CompanyCard cardRef={cardRef} name={availableFocus} year={state.year}
                                rows={shownRows} compareYear={state.compareYear} onClose={() => setFocused(null)} />
                            <div className={styles.view}>
                                {yearRows.length === 0
                                    ? <Message type='info' showIcon>
                                        Нет данных о компаниях за {yearLabel} для выбранной группы.{' '}
                                        <Button appearance='link' onClick={() => update({ filter: NO_RESTRICTIONS })}>Все участники</Button>
                                    </Message>
                                    : shownRows.length === 0
                                        ? <Message type='info'>
                                            Для выбранных компаний нет данных за {yearLabel}.{' '}
                                            <Button appearance='link' onClick={() => update({ companies: [] })}>Показать все компании</Button>
                                        </Message>
                                        : state.view === 'table'
                                            ? <>
                                                {state.compareYear !== null && hasWantedOnlyYear(years) && <AboutNote section='year-2019' onAbout={onAbout}>
                                                    С 2019 годом сравнивается только «Хотят работать».
                                                </AboutNote>}
                                                <CompanyTable rows={pairCompanies(rows, state.year, state.compareYear, state.companies)}
                                                    year={state.year} compareYear={state.compareYear} focused={availableFocus}
                                                    onFocus={focusCompany} sort={state.sort} onSort={sort => update({ sort })} />
                                            </>
                                            : metric === null
                                                ? <Message type='info'>Показатель не выбран. Выберите показатель над картой.</Message>
                                                : <>
                                                    {hasWantedOnlyYear(years) && <AboutNote section='year-2019' onAbout={onAbout}>
                                                        В 2019 году ось показывает только «Хотят работать».
                                                    </AboutNote>}
                                                    {state.compareYear !== null && <p aria-label='Годы на карте'>● {state.year} — основной год · ○ {state.compareYear} — сравнение</p>}
                                                    <div className={styles.chart}>
                                                        <CompanyMap rows={shownRows} focused={availableFocus} onFocus={focusCompany} year={state.year} compareYear={state.compareYear}
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
