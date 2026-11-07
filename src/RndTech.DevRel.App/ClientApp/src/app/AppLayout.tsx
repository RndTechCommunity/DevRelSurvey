import { Container, Content, Nav, Sidebar, Sidenav } from 'rsuite'
import { CompanyResult, FilterOptions, SURVEY_YEARS, SurveyMeta } from '../api/types'
import FilterPanel from '../features/filters/FilterPanel'
import CompaniesPage from '../pages/CompaniesPage'
import SamplePage from '../pages/SamplePage'
import { RequestState } from '../shared/AsyncState'
import styles from './AppLayout.module.css'
import { SurveyState } from './surveyState'
import { UpdateSurveyState } from './useSurveyState'

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    onDuplicate: () => void,
    companies: RequestState<readonly CompanyResult[]>,
    meta: RequestState<SurveyMeta>,
    options: RequestState<FilterOptions>
}

const YEARS_DESCENDING = [...SURVEY_YEARS].reverse()

export default function AppLayout({ state, update, onDuplicate, companies, meta, options }: Props) {
    const selectTab = (key: string) => {
        const year = SURVEY_YEARS.find(y => String(y) === key)
        update(year ? { page: 'companies', year } : { page: 'sample' }, 'push')
    }

    return (
        <Container>
            <Sidebar
                style={{display: 'flex', flexDirection: 'column'}}
                width={260}
            >
                <Sidenav
                    expanded={true}
                    defaultOpenKeys={['1', '2']}
                    appearance='subtle'
                >
                    <Sidenav.Body>
                        <FilterPanel
                            filter={state.filter}
                            options={options}
                            onChange={filter => update({ filter })}
                            onDuplicate={onDuplicate}
                        />
                    </Sidenav.Body>
                </Sidenav>
            </Sidebar>

            <Container>
                <Content>
                    <div className={styles.menuContainer}>
                        <div className={styles.menuBar}>
                            <div className={styles.menu}>
                                <Nav
                                    activeKey={state.page === 'sample' ? 'sample' : String(state.year)}
                                    onSelect={selectTab}
                                    appearance='subtle'
                                >
                                    {YEARS_DESCENDING.map(year => (
                                        <Nav.Item eventKey={String(year)} key={year}>{year}</Nav.Item>
                                    ))}
                                    <Nav.Item eventKey='sample'>Состав выборки</Nav.Item>
                                </Nav>
                            </div>
                        </div>
                        <div className={styles.playground}>
                            {state.page === 'sample'
                                ? <SamplePage meta={meta} />
                                : <CompaniesPage state={state} update={update} companies={companies} />}
                        </div>
                    </div>
                </Content>
            </Container>
        </Container>
    )
}
