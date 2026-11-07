import injectSheet from 'react-jss';
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import Menu from './Menu'
import DataMetaPage from './pages/DataMetaPage'
import KnownAndWantedPage from './pages/KnownAndWantedPage'
import { Container, Content, Sidebar, Sidenav } from 'rsuite';
import FiltersSidePage from './filters/FiltersSidePage';
import { CompanyResult, countOf, FilterOptions, SURVEY_YEARS, SurveyMeta } from '../api/types';
import { companyNames, selectCompanyRows } from '../features/companies/companyMetrics';
import { AsyncState, RequestState } from '../shared/AsyncState';

const styles = {
    app: {
        display: 'flex',
        margin: 0,
        minHeight: '100vh'
    },
    playground: {
        flexGrow: 1,
        padding: '50px 50px 25px'
    },
    menuContainer : {
        display: 'inline-block'
    }
}

type Props = {
    classes?: any,
    state: SurveyState,
    update: UpdateSurveyState,
    onDuplicate: () => void,
    companies: RequestState<readonly CompanyResult[]>,
    meta: RequestState<SurveyMeta>,
    options: RequestState<FilterOptions>
}

export function App(props: Props) {
    const { state, update } = props
    const filter = state.filter

    let content =
        state.page === 'sample' ? (
            <AsyncState
                state={props.meta}
                isEmpty={meta => SURVEY_YEARS.every(year => countOf(meta.filtered, year) === 0)}
                empty='В выбранной группе нет респондентов.'
            >
                {meta => <DataMetaPage meta={meta}/>}
            </AsyncState>
        ) : (
            <AsyncState
                state={props.companies}
                isEmpty={rows => selectCompanyRows(rows, state.year).length === 0}
                empty={`Нет данных о компаниях за ${state.year} год для выбранной группы.`}
            >
                {rows => (
                    <KnownAndWantedPage
                        selectedCompanies={state.companies}
                        filter={filter}
                        year={state.year}
                        onCompaniesChanged={companies => update({ companies })}
                        useError={state.showLegacyError}
                        onUseErrorChanged={showLegacyError => update({ showLegacyError })}
                        useGood={state.showGood}
                        companyEntries={rows}
                        useWanted={state.showWanted}
                        companies={companyNames(rows)}
                        onUseGoodChanged={showGood => update({ showGood })}
                        onUseWantedChanged={showWanted => update({ showWanted })}
                        sort={state.sort}
                        onSortChanged={sort => update({ sort })}
                    />
                )}
            </AsyncState>
        )

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
                        <FiltersSidePage
                            filter={filter}
                            options={props.options}
                            onSetFilter={filter => update({ filter })}
                            onOpenDuplicate={props.onDuplicate}
                        />
                    </Sidenav.Body>
                </Sidenav>
            </Sidebar>

            <Container>
                <Content>
                    <div className={props.classes.menuContainer}>
                        <Menu
                            active={state.page === 'sample' ? 'sample' : state.year}
                            onChange={item => update(item === 'sample' ? { page: 'sample' } : { page: 'companies', year: item }, 'push')}
                        />
                        <div className={props.classes.playground}>
                            {content}
                        </div>
                    </div>
                </Content>
            </Container>
        </Container>
    )
}

export default injectSheet(styles)(App)
