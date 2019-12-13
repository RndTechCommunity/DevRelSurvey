import * as React from 'react'
import injectSheet, { CSSProperties } from 'react-jss'
import { defaultFilter, Filter } from './filters/Filter'
import FiltersSidePage from './filters/FiltersSidePage'
import Menu, { MenuId } from './Menu'
import DataMetaPage from './pages/DataMetaPage'
import KnownAndWantedPage from './pages/KnownAndWantedPage'

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
    filter: Filter,
    areFiltersShown: boolean
}

class App extends React.Component<Props, State> {
    state: State = {
        tab: App.restoreTab(),
        filter: App.restoreFilter(),
        areFiltersShown: false
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
            </div>
        )
    }

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
