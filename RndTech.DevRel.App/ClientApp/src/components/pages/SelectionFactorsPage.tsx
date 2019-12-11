import Loader from '@skbkontur/react-ui/components/Loader/Loader'
import * as React from 'react'
import injectSheet, { CSSProperties } from 'react-jss'
import { FactorData, getFactorData } from '../../api'
import { toPercent } from '../../format'
import { Filter } from '../filters/Filter'

const styles = {
    container: {
        marginTop: -30
    },
    groups: {
        width: '100%'
    },
    groupRow: {
        display: 'grid',
        gridTemplateColumns: '4fr 50px 4fr'
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
    }
}

const groupNames = {
    0: 'Деятельность',
    1: 'Условия работы',
    2: 'Коллеги и карьера',
    3: 'Внешние активности'
}

type Props = {
    classes?: any,
    filter: Filter
}

type State = {
    isReady: boolean,
    data: FactorData
}

class SelectionFactorsPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        data: {}
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
        return getFactorData(filter)
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
                    <div className={classes.groupRow}>
                        {this.renderGroup(0, data[0])}
                        <span>&nbsp;</span>
                        {this.renderGroup(1, data[1])}
                    </div>
                    <div className={classes.groupRow}>
                        {this.renderGroup(2, data[2])}
                        <span>&nbsp;</span>
                        {this.renderGroup(3, data[3])}
                    </div>
                </div>
            </Loader>
        )
    }

    renderGroup(i: number, factors: { [factor: string]: number }) {
        const { classes } = this.props

        return (
            <div key={i}>
                <h2>{groupNames[i]}</h2>
                <table className={classes.table}>
                    <tbody>
                    {Object.keys(factors).map(i => {
                        const factorClass =
                            factors[i] > 0.10 ? classes.important :
                                factors[i] < 0.05 ? classes.unimportant : null

                        return (
                            <tr key={i} className={factorClass}>
                                <td>{i}</td>
                                <td className={classes.ratio}>
                                    {toPercent(factors[i])}
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
