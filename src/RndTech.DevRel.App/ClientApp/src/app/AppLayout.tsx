import { useState } from 'react'
import { Nav, Sidenav } from 'rsuite'
import { CompanyResult, FilterOptions, SurveyMeta } from '../api/types'
import FilterPanel from '../features/filters/FilterPanel'
import CompaniesPage from '../pages/CompaniesPage'
import MethodologyPage, { MethodologySection } from '../pages/MethodologyPage'
import SamplePage from '../pages/SamplePage'
import { RequestState } from '../shared/AsyncState'
import styles from './AppLayout.module.css'
import SurveyBar from './SurveyBar'
import { SurveyPage, SurveyState } from './surveyState'
import { UpdateSurveyState } from './useSurveyState'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    onDuplicate: () => void,
    companies: RequestState<readonly CompanyResult[]>,
    meta: RequestState<SurveyMeta>,
    options: RequestState<FilterOptions>
}

const SECTIONS = [
    { page: 'companies', label: 'Компании' },
    { page: 'sample', label: 'Состав выборки' },
    { page: 'methodology', label: 'О данных' }
] as const

export default function AppLayout({ state, update, onDuplicate, companies, meta, options }: Props) {
    // Раздел «О данных», на который ведёт «Подробнее»; в адрес не пишется.
    const [aboutSection, setAboutSection] = useState<MethodologySection>()

    const openPage = (page: SurveyPage, section?: MethodologySection) => {
        setAboutSection(section)
        update({ page }, 'push')
    }
    const openAbout = (section: MethodologySection) => openPage('methodology', section)

    return (
        <>
            <header className={styles.header}>
                <span className={styles.brand}>RndTech · Исследование ИТ-сообщества</span>
                <Nav
                    as='nav'
                    aria-label='Разделы'
                    appearance='subtle'
                    activeKey={state.page}
                    onSelect={key => openPage(SECTIONS.find(({ page }) => page === key)?.page ?? 'companies')}
                >
                    {SECTIONS.map(({ page, label }) => (
                        // У пункта роль button: для неё допустим aria-current, а не aria-selected.
                        <Nav.Item
                            key={page}
                            eventKey={page}
                            aria-selected={undefined}
                            aria-current={state.page === page ? 'page' : undefined}
                        >
                            {label}
                        </Nav.Item>
                    ))}
                </Nav>
            </header>
            {state.page === 'methodology'
                ? (
                    <main className={styles.main}>
                        <MethodologyPage section={aboutSection} />
                    </main>
                )
                : <>
                    <SurveyBar state={state} update={update} meta={meta} onDuplicate={onDuplicate} />
                    <div className={styles.body}>
                        <aside className={styles.aside}>
                            {/* Вне Sidenav группы фильтров (Nav.Menu) раскрываются выпадающими меню. */}
                            <Sidenav expanded={true} defaultOpenKeys={['1', '2']} appearance='subtle'>
                                <Sidenav.Body>
                                    <FilterPanel
                                        filter={state.filter}
                                        options={options}
                                        onChange={filter => update({ filter })}
                                    />
                                </Sidenav.Body>
                            </Sidenav>
                        </aside>
                        <main className={styles.main}>
                            {state.page === 'sample'
                                ? <SamplePage meta={meta} year={state.year} onAbout={openAbout} />
                                : <CompaniesPage state={state} update={update} companies={companies} onAbout={openAbout} />}
                        </main>
                    </div>
                </>}
        </>
    )
}
