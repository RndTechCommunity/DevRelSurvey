import * as React from 'react'
import injectSheet from 'react-jss';
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import Menu from './Menu'
import DataMetaPage from './pages/DataMetaPage'
import KnownAndWantedPage from './pages/KnownAndWantedPage'
import { Container, Content, Sidebar, Sidenav } from 'rsuite';
import FiltersSidePage from './filters/FiltersSidePage';
import { useEffect } from 'react';
import { getCompanyResults } from '../api/client';
import { CompanyResult } from '../api/types';
import { companyNames } from '../features/companies/companyMetrics';

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
    onDuplicate: () => void
}

export function App(props: Props) {
    const { state, update } = props
    const filter = state.filter
    const [filteredData, setFilteredData] = React.useState<readonly CompanyResult[]>();
    
    useEffect(() => {
        const fetchData = async () => {
            const data = await getCompanyResults(filter)
            await setFilteredData(data)
        };

        fetchData();
    }, [filter])
    
    const calculateCompaniesList = (entries: readonly CompanyResult[] | undefined) => {
        return companyNames(entries ?? []).map(x => ({ value: x, label: x }))
    }
    
    let content =
        state.page === 'sample' ? <DataMetaPage filter={filter}/> :
            <KnownAndWantedPage
                selectedCompanies={state.companies}
                filter={filter}
                year={state.year}
                onCompaniesChanged={companies => update({ companies })}
                useError={state.showLegacyError}
                onUseErrorChanged={showLegacyError => update({ showLegacyError })}
                useGood={state.showGood}
                companyEntries={filteredData}
                useWanted={state.showWanted}
                companies={calculateCompaniesList(filteredData)}
                onUseGoodChanged={showGood => update({ showGood })}
                onUseWantedChanged={showWanted => update({ showWanted })}
                sort={state.sort}
                onSortChanged={sort => update({ sort })}
            />

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
