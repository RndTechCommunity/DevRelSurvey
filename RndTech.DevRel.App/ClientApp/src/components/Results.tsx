import * as React from 'react'
import injectSheet from 'react-jss';
import { topRostovFilter, Filter, selectedCompanies } from './filters/Filter'
import Menu, { MenuId } from './Menu'
import DataMetaPage from './pages/DataMetaPage'
import KnownAndWantedPage from './pages/KnownAndWantedPage'
import { Button, Container, Content, Modal, Sidebar, Sidenav } from 'rsuite';
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

type State = {
    tab: MenuId,
    modalOpened: boolean
    filter: Filter,
    areFiltersShown: boolean,
    companiesFilter: string[]
    useError: boolean
}

class App extends React.Component<Props, State> {
    state: State = {
        tab: App.restoreTab(),
        filter: App.restoreFilter(),
        areFiltersShown: false,
        modalOpened: this.props.modalOpened,
        companiesFilter: selectedCompanies,
        useError: false
    }

    renderModal() {
        return (
            <Modal show={this.state.modalOpened} onHide={this.modalClose}>
                <Modal.Header>
                    <Modal.Title>Узнаваемость и привлекательность IT-компаний в Ростовской области</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Мы в IT-сообществе RndTech сделали исследование узнаваемости брендов IT-компаний в Ростове и
                        Таганроге.
                        В 2019 больше 700 человек, а в 2020 — уже 1200! Спасибо, что поделились своим мнением.
                        Мы спешим поделиться с вами результатами.
                    </p>
                    <p>
                        На этом сайте можно посмотреть статистику местного IT-сообщества — на чём люди
                        программируют в 2020 году, кем работают и откуда узнают о митапах.
                        А ещё — какие компании они знают и в каких хотят работать.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.modalClose} appearance='primary'>
                        Посмотреть результаты
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        const { classes } = this.props
        const { tab, filter, companiesFilter, useError } = this.state
        
        let content =
            tab === 'data-meta' ? <DataMetaPage filter={filter} /> :
                tab === 'known-and-wanted-2021' ?
                    <KnownAndWantedPage
                        selectedCompanies={companiesFilter}
                        filter={filter}
                        year={2021}
                        onCompaniesChanged={companies => this.setState({ companiesFilter: companies })}
                        useError={useError}
                        onUseErrorChanged={ue => this.setState({ useError: ue })}
                    /> : 
                    (tab === 'known-and-wanted-2020' ? 
                    <KnownAndWantedPage 
                        selectedCompanies={companiesFilter} 
                        filter={filter}
                        year={2020}
                        onCompaniesChanged={companies => this.setState({ companiesFilter: companies })}
                        useError={useError}
                        onUseErrorChanged={ue => this.setState({ useError: ue })}
                    /> 
                                                :
                        (tab === 'known-and-wanted-2019' ?
                        <KnownAndWantedPage
                            selectedCompanies={companiesFilter}
                            filter={filter}
                            year={2019}
                            onCompaniesChanged={companies => this.setState({ companiesFilter: companies })}
                            useError={useError}
                            onUseErrorChanged={ue => this.setState({ useError: ue })}
                        />
                        : null))

        return (
            <Container>
                <Sidebar
                    style={{ display: 'flex', flexDirection: 'column' }}
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
                                    onSetFilter={filter => this.setState({ filter })}
                                    onOpenDuplicate={() => this.openDuplicate()}
                                />
                            </Sidenav.Body>
                        </Sidenav>
                </Sidebar>

                <Container>
                    <Content>
                        <div className={classes.menuContainer}>
                            <Menu
                                active={tab}
                                onChange={tab => this.setState({ tab })}
                            />
                            <div className={classes.playground}>
                                {content}
                                {this.state.modalOpened && this.renderModal()}
                            </div>
                        </div>
                    </Content>
                </Container>
            </Container>
    )
    }

    modalClose = () => this.setState({ modalOpened: false })

    openDuplicate() {
        const { tab, filter } = this.state

        const uri = `?tab=${encodeURIComponent(JSON.stringify(tab))}` +
            `&filter=${encodeURIComponent(JSON.stringify(filter))}`

        window.open(uri, '_blank')
    }

    static restoreTab(): MenuId {
        const params = new URLSearchParams(window.location.search);
        const maybeTab = params.get('tab')

        return maybeTab !== null
            ? JSON.parse(decodeURIComponent(maybeTab)) as MenuId
            : 'known-and-wanted-2021'
    }

    static restoreFilter(): Filter {
        const params = new URLSearchParams(window.location.search);
        const maybeFilter = params.get('filter')

        return maybeFilter !== null
            ? JSON.parse(decodeURIComponent(maybeFilter)) as Filter
            : topRostovFilter
    }
}

export default injectSheet(styles)(App)
