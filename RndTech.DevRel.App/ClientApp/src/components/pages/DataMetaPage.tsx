import * as React from 'react'
import { getMeta, MetaData } from '../../api'
import { Filter } from '../filters/Filter'
import injectSheet from 'react-jss';
import { DataMetaTable } from './DataMetaTable';
import { Col, Container, Content, Divider, Grid, Loader, Row } from 'rsuite';

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
    meta: MetaData,
}

class SelectionFactorsPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        meta: {
            filtered: {name: 'Выбрано', count2019: 0, count2020: 0, count2021: 0},
            total: {name: 'Всего', count2019: 0, count2020: 0, count2021: 0},
            sources : []
        }
    }

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        Promise
            .all([this.loadData(this.props.filter)])
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
                .all([this.loadData(this.props.filter)])
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

    loadData(filter: Filter) {
        return getMeta(filter)
            .then(data => {
                if (this._isMounted) {
                    this.setState({meta: data})
                }
            })
    }

    render() {
        const { classes } = this.props
        const { isReady, meta } = this.state

        if (!isReady) {
            return (<Loader content='Загрузка данных' center />)
        }

        return (
            <Container>
                <Content>
                    <div className={classes.groups}>
                        <Grid fluid>
                            <Row>
                                <Col>
                                    <DataMetaTable filteredTotal={meta.filtered} data={meta.sources.cities} header={'Город'} />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable filteredTotal={meta.filtered} data={meta.sources.ages} header={'Возраст'} />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable 
                                        filteredTotal={meta.filtered} 
                                        data={meta.sources.education} 
                                        header={'Образование'} 
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable 
                                        filteredTotal={meta.filtered} 
                                        data={meta.sources.professions} 
                                        header={'Профессия'} 
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable 
                                        filteredTotal={meta.filtered} 
                                        data={meta.sources.languages} 
                                        header={'Язык программирования'} 
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable 
                                        filteredTotal={meta.filtered} 
                                        data={meta.sources.levels} 
                                        header={'Грейд'} 
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable 
                                        filteredTotal={meta.filtered} 
                                        data={meta.sources.isCommunity} 
                                        header={'Посещает митапы'} 
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <Row>
                                <Col>
                                    <DataMetaTable 
                                        filteredTotal={meta.filtered} 
                                        data={meta.sources.communitySource} 
                                        header={'Откуда узнает о митапах'} 
                                    />
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                </Content>
            </Container>
        )
    }
}

export default injectSheet(styles)(SelectionFactorsPage)
