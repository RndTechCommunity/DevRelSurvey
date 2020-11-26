import * as React from 'react'
import injectSheet from 'react-jss';
import { topRostovFilter, Filter } from './filters/Filter'
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
    areFiltersShown: boolean
}

class App extends React.Component<Props, State> {
    state: State = {
        tab: App.restoreTab(),
        filter: App.restoreFilter(),
        areFiltersShown: false,
        modalOpened: this.props.modalOpened
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
                        В 2019 вы рассказали о нашей анкете 25 раз, а заполнили анкету больше 700 человек.
                        И мы спешим поделиться результатами с вами.
                    </p>
                    <p>
                        На этом сайте можно посмотреть статистику местного IT-сообщества — на чём люди
                        программируют в 2019 году, кем работают и откуда узнают о митапах.
                        А ещё — какие компании они знают и в каких хотят работать.
                    </p>
                    <p>
                        Прямо сейчас идёт новый опрос узнаваемости компаний в 2020 году!
                        Если вы уже проходили опрос в 2019 — пора сверить свои ощущения и обновить информацию.
                        Если проходите первый раз, то это ещё лучше, значит теперь у нас будет больше данных.
                        В этом году в качестве призов футболки, лицензии Jetbrains и билеты на RndTechConf.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => window.open('https://devrel.rndtech.pro/2020.html', '_blank')} appearance='primary'>
                        Пройти опрос
                    </Button>
                    <Button onClick={this.modalClose} appearance='subtle'>
                        Посмотреть результаты
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        const { classes } = this.props
        const { tab, filter } = this.state

        let content =
            tab === 'data-meta' ? <DataMetaPage filter={filter} /> :
                tab === 'known-and-wanted' ? <KnownAndWantedPage filter={filter} /> :
                    null

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
            : 'data-meta'
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
