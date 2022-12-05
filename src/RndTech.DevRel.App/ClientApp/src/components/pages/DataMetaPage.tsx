import * as React from 'react'
import { getMeta, MetaData } from '../../api'
import { Filter } from '../filters/Filter'
import injectSheet from 'react-jss';
import { DataMetaTable } from './DataMetaTable';
import { Col, Container, Content, Divider, Grid, Loader, Row } from 'rsuite';
import { useEffect } from 'react';

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

export function SelectionFactorsPage(props: Props) {
    const [isReady, setIsReady] = React.useState<boolean>(false);
    const [meta, setMeta] = React.useState<MetaData>();

    useEffect(() => {
        getMeta(props.filter)
            .then(data => setMeta(data))
            .then(() => setIsReady(true));
    }, [props.filter]);

    return (
        !isReady ? <Loader content='Загрузка данных' center /> :
        <Container>
            <Content>
                <div className={props.classes.groups}>
                    <Grid fluid>
                        <Row>
                            <Col>
                                <DataMetaTable filteredTotal={meta!.filtered} data={meta!.sources.cities} header={'Город'} />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable filteredTotal={meta!.filtered} data={meta!.sources.ages} header={'Возраст'} />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable 
                                    filteredTotal={meta!.filtered} 
                                    data={meta!.sources.education} 
                                    header={'Образование'} 
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable 
                                    filteredTotal={meta!.filtered} 
                                    data={meta!.sources.professions} 
                                    header={'Профессия'} 
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable 
                                    filteredTotal={meta!.filtered} 
                                    data={meta!.sources.languages} 
                                    header={'Язык программирования'} 
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable 
                                    filteredTotal={meta!.filtered} 
                                    data={meta!.sources.levels} 
                                    header={'Грейд'} 
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable 
                                    filteredTotal={meta!.filtered} 
                                    data={meta!.sources.isCommunity} 
                                    header={'Посещает митапы'} 
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col>
                                <DataMetaTable 
                                    filteredTotal={meta!.filtered} 
                                    data={meta!.sources.communitySource} 
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

export default injectSheet(styles)(SelectionFactorsPage)
