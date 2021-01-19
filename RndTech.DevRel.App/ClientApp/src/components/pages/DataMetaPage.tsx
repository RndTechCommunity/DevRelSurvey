import * as React from 'react'
import { getMeta, MetaData } from '../../api'
import { Filter } from '../filters/Filter'
import Plural from '../Plural'
import injectSheet from 'react-jss';
import { Col, Container, Content, Grid, Icon, Loader, Row } from 'rsuite';

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
    },
    important: {
        color: '#228007'
    },
    unimportant: {
        color: '#808080'
    },
    centeredText: {
        textAlign: 'center'
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
    data2019: MetaData,
    data2020: MetaData
}

class SelectionFactorsPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        data2019: {
            count: 0,
            total: 0,
            sources : []
        },
        data2020: {
            count: 0,
            total: 0,
            sources : []
        }
    }

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        Promise
            .all([this.loadData(this.props.filter, 2019), this.loadData(this.props.filter, 2020)])
            .then(() => {
                if (this._isMounted) {
                    this.setState({isReady: true})
                }
            })
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.filter !== prevProps.filter) {
            this.setState({ isReady: false })

            Promise
                .all([this.loadData(this.props.filter, 2019), this.loadData(this.props.filter, 2020)])
                .then(() => {
                    if (this._isMounted) {
                        this.setState({isReady: true})
                    }
                })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadData(filter: Filter, year: number) {
        filter.year = year;
        return getMeta(filter)
            .then(data => {
                if (this._isMounted) {
                    if (year === 2019) {
                        this.setState({data2019: data})
                    }
                    else {
                        this.setState({data2020: data})
                    }
                }
            })
    }

    render() {
        const { classes } = this.props
        const { isReady, data2019, data2020 } = this.state

        if (!isReady) {
            return (<Loader content='Загрузка данных' center />)
        }

        return (
            <Container>
                <Content>
                    <div className={classes.groups}>
                        <Grid fluid>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    <h3 className={classes.centeredText}>2020</h3>
                                    <h5>
                                        {data2020.count}
                                        &nbsp;<Plural n={data2020.count} one='участник' few='участника' many='участников' />
                                        &nbsp;в выборке (из {data2020.total})
                                    </h5>
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    <h3 className={classes.centeredText}>2019</h3>
                                    <h5>
                                        {data2019.count}
                                        &nbsp;<Plural n={data2019.count} one='участник' few='участника' many='участников' />
                                        &nbsp;в выборке (из {data2019.total})
                                    </h5>
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Города', 'cities')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Города', 'cities')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Возраст', 'ages')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Возраст', 'ages')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Образование', 'education')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Образование', 'education')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Уровни', 'levels')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Уровни', 'levels')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Профессии', 'professions')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Профессии', 'professions')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Языки', 'languages')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Языки', 'languages')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Критерии выбора компаний', 'motivationFactors')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}/>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Ходят ли на митапы', 'isCommunity')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Ходят ли на митапы', 'isCommunity')}
                                </Col>
                            </Row>
                            <Row gutter={30}>
                                <Col xs={11}>
                                    {this.renderGroup(data2020, 'Откуда узнают о митапах', 'communitySource')}
                                </Col>
                                <Col xs={2} />
                                <Col xs={11}>
                                    {this.renderGroup(data2019, 'Откуда узнают о митапах', 'communitySource')}
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                </Content>
            </Container>
        )
    }

    renderGroup(data: MetaData, title: string, key: string) {
        const { classes, filter } = this.props

        return (data.sources && data.sources[key] &&
            <div key={title}>
                <h3>{title} {filter[key] !== undefined && filter[key] !== null && filter[key].length !== 0
                    ? <Icon icon='filter' />
                    : ''
                }</h3>
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
