import * as React from 'react'
import injectSheet, { CSSProperties } from 'react-jss'
import { defaultFilter, Filter } from './filters/Filter'
import FiltersSidePage from './filters/FiltersSidePage'
import Menu, { MenuId } from './Menu'
import DataMetaPage from './pages/DataMetaPage'
import KnownAndWantedPage from './pages/KnownAndWantedPage'
import Modal from '@skbkontur/react-ui/components/Modal/Modal'
import Button from '@skbkontur/react-ui/components/Button/Button'

const styles = {
    app: {
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        minHeight: '100vh'
    } as CSSProperties<Props>,
    playground: {
        flexGrow: 1,
        padding: '50px 50px 25px'
    }
}

type Props = {
    classes?: any
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
        modalOpened: false
    }

    renderModal() {
        return (
            <Modal width='40%' onClose={this.modalClose}>
                <Modal.Header>Узнаваемость и привлекательность IT-компаний в Ростовской области</Modal.Header>
                <Modal.Body>
                    <p>Мы в IT-сообществе RndTech сделали исследование узнаваемости брендов IT-компаний в Ростове.
                        Вы рассказали о нашей анкете 25 раз, а заполнили анкету больше 700 человек. И мы спешим
                        поделиться результатами с вами.</p>
                    <p>На этом сайте можно посмотреть статистику местного IT-сообщества — на чём люди 
                        программируют в 2019 году, кем работают и откуда узнают о митапах. 
                        А ещё — какие компании они знают и в каких хотят работать.
                    </p>
                    <p>Например, можно посмотреть, где хотят работать джависты, 
                        или куда мечают устроиться студенты Таганрога.
                        Фильтры справа позволят сделать выборку по нужным данным, 
                        в поле на графике сравнить интересующие компании.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button use='success' onClick={this.modalClose}>Поехали</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        const { classes } = this.props
        const { tab, filter, areFiltersShown } = this.state

        let content =
            tab === 'data-meta' ? <DataMetaPage filter={filter} /> :
                tab === 'known-and-wanted' ? <KnownAndWantedPage filter={filter} /> :
                    null

        return (
            <div className={classes.app}>
                <Menu
                    active={tab}
                    onChange={tab => this.setState({ tab })}
                    onShowFilters={() => this.setState({ areFiltersShown: true })}
                    onOpenDuplicate={() => this.openDuplicate()}
                />
                <div className={classes.playground}>
                    {content}
                </div>
                {areFiltersShown && (
                    <FiltersSidePage
                        filter={filter}
                        onSetFilter={filter => this.setState({ filter })}
                        onClose={() => this.setState({ areFiltersShown: false })}
                    />
                )}
                {this.state.modalOpened && this.renderModal()}
            </div>
        )
    }

    componentDidMount() {
        this.setState({ modalOpened: true });
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
            : defaultFilter
    }
}

export default injectSheet(styles)(App)
