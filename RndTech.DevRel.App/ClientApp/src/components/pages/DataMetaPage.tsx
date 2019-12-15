import FilterIcon from '@skbkontur/react-icons/Filter'
import Loader from '@skbkontur/react-ui/components/Loader/Loader'
import * as React from 'react'
import injectSheet, { CSSProperties } from 'react-jss'
import { getMeta, MetaData } from '../../api'
import { Filter } from '../filters/Filter'
import Plural from '../Plural'

const styles = {
    container: {
        marginTop: -30
    },
    groups: {
        width: '100%'
    },
    groupRow: {
        display: 'grid',
        gridTemplateColumns: '4fr 40px 4fr 40px 4fr 40px 4fr'
    },
    table: {
        width: '100%'
    },
    ratio: {
        textAlign: 'right'
    } as CSSProperties<Props>,
    important: {
        color: '#228007'
    },
    unimportant: {
        color: '#808080'
    },
    icon: {
        opacity: 0.5
    }
}

type Props = {
    classes?: any,
    filter: Filter
}

type State = {
    isReady: boolean,
    data: MetaData
}

class SelectionFactorsPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        data: {
            count: 0,
            total: 0,
            sources : []
        }
    }

    componentDidMount() {
        this.loadData(this.props.filter)
            .then(() => this.setState({ isReady: true }))
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.filter !== prevProps.filter) {
            this.setState({ isReady: false })

            this.loadData(this.props.filter)
                .then(() => this.setState({ isReady: true }))
        }
    }

    loadData(filter: Filter) {
        return getMeta(filter)
            .then(data => this.setState({ data }))
    }

    render() {
        const { classes } = this.props
        const { isReady, data } = this.state

        if (!isReady) {
            return null
        }

        return (
            <Loader active={!isReady} className={classes.container}>
                <div className={classes.groups}>
                    <h2>
                        {data.count}
                        &nbsp;<Plural n={data.count} one='участник' few='участника' many='участников' />
                        &nbsp;в выборке (из {data.total})
                    </h2>
                    <div className={classes.groupRow}>
                        {this.renderGroup('Города', 'cities')}
                        <span>&nbsp;</span>
                        {this.renderGroup('Возраст', 'ages')}
                        <span>&nbsp;</span>
                        {this.renderGroup('Образование', 'education')}
                    </div>
                    <div className={classes.groupRow}>
                        {this.renderGroup('Уровни', 'levels')}
                        <span>&nbsp;</span>
                        {this.renderGroup('Профессии', 'professions')}
                        <span>&nbsp;</span>
                        {this.renderGroup('Языки', 'languages')}
                    </div>
                    <div className={classes.groupRow}>
                        {this.renderGroup('Источники информации о компаниях', 'companySources')}
                        <span>&nbsp;</span>
                        {this.renderGroup('Ходят ли на митапы', 'isCommunity')}
                        <span>&nbsp;</span>
                        {this.renderGroup('Откуда узнают о митапах', 'communitySource')}
                    </div>
                </div>
            </Loader>
        )
    }

    renderGroup(title: string, key: string) {
        const { classes, filter } = this.props
        const { data } = this.state

        return (
            <div key={title}>
                <h2>{title} {filter[key] !== undefined && filter[key].length !== 0
                    ? <span className={classes.icon}><FilterIcon /></span>
                    : ''
                }</h2>
                <table className={classes.table}>
                    <tbody>
                        {Object.keys(data.sources[key]).map(i => {
                        const rowClass =
                            data.sources[key][i] > 0.10 ? classes.important :
                                data.sources[key][i] < 0.05 ? classes.unimportant : null

                        return (
                            <tr key={i} className={rowClass}>
                                <td>{i}</td>
                                <td className={classes.ratio}>
                                    {data.sources[key][i]}
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default injectSheet(styles)(SelectionFactorsPage)
