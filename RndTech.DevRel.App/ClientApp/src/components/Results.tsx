import * as React from 'react'
import injectSheet from 'react-jss';
import { topRostovFilter, Filter, selectedCompanies } from './filters/Filter'
import Menu, { MenuId } from './Menu'
import DataMetaPage from './pages/DataMetaPage'
import KnownAndWantedPage from './pages/KnownAndWantedPage'
import { Container, Content, Sidebar, Sidenav } from 'rsuite';
import FiltersSidePage from './filters/FiltersSidePage';

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
    modalOpened: boolean
}

export function App(props: Props) {
    const restoreTab = () => {
        const params = new URLSearchParams(window.location.search);
        const maybeTab = params.get('tab')

        return maybeTab !== null
            ? JSON.parse(decodeURIComponent(maybeTab)) as MenuId
            : 'known-and-wanted-2021'
    }

    const restoreFilter = () => {
        const params = new URLSearchParams(window.location.search);
        const maybeFilter = params.get('filter')

        return maybeFilter !== null
            ? JSON.parse(decodeURIComponent(maybeFilter)) as Filter
            : topRostovFilter
    }

    const [tab, setTab] = React.useState<MenuId>(restoreTab());
    const [filter, setFilter] = React.useState<Filter>(restoreFilter());
    const [companiesFilter, setCompaniesFilter] = React.useState<string[]>(selectedCompanies);
    const [useError, setUseError] = React.useState<boolean>(false);
    const [useGood, setUseGood] = React.useState<boolean>(false);
    const [useWanted, setUseWanted] = React.useState<boolean>(true);

    const openDuplicate = () => {
        const uri = `?tab=${encodeURIComponent(JSON.stringify(tab))}` +
            `&filter=${encodeURIComponent(JSON.stringify(filter))}`
        window.open(uri, '_blank')
    }

    let content =
        tab === 'data-meta' ? <DataMetaPage filter={filter}/> :
            <KnownAndWantedPage
                selectedCompanies={companiesFilter}
                filter={filter}
                year={tab === 'known-and-wanted-2021' ? 2021 : (tab === 'known-and-wanted-2020' ? 2020 : 2019)}
                onCompaniesChanged={companies => setCompaniesFilter(companies)}
                useError={useError}
                onUseErrorChanged={ue => setUseError(ue)}
                useGood={useGood}
                useWanted={useWanted}
                onUseGoodChanged={ue => setUseGood(ue)}
                onUseWantedChanged={ue => setUseWanted(ue)}
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
                            onSetFilter={filter => setFilter(filter)}
                            onOpenDuplicate={() => openDuplicate()}
                        />
                    </Sidenav.Body>
                </Sidenav>
            </Sidebar>

            <Container>
                <Content>
                    <div className={props.classes.menuContainer}>
                        <Menu
                            active={tab}
                            onChange={tab => setTab(tab)}
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
