import { Fragment } from 'react'
import { Col, Container, Content, Divider, Grid, Row } from 'rsuite'
import { countOf, MetaSourceKey, SURVEY_YEARS, SurveyMeta } from '../api/types'
import SampleTable from '../features/sample/SampleTable'
import { AsyncState, RequestState } from '../shared/AsyncState'

const SECTIONS: readonly { readonly source: MetaSourceKey, readonly header: string }[] = [
    { source: 'cities', header: 'Город' },
    { source: 'ages', header: 'Возраст' },
    { source: 'education', header: 'Образование' },
    { source: 'professions', header: 'Профессия' },
    { source: 'languages', header: 'Язык программирования' },
    { source: 'levels', header: 'Грейд' },
    { source: 'isCommunity', header: 'Посещает митапы' },
    { source: 'communitySource', header: 'Откуда узнает о митапах' }
]

export default function SamplePage({ meta }: { meta: RequestState<SurveyMeta> }) {
    return (
        <AsyncState
            state={meta}
            isEmpty={loaded => SURVEY_YEARS.every(year => countOf(loaded.filtered, year) === 0)}
            empty='В выбранной группе нет респондентов.'
        >
            {loaded => (
                <Container>
                    <Content>
                        <div>
                            <Grid fluid>
                                {SECTIONS.map(({ source, header }, index) => (
                                    <Fragment key={source}>
                                        {index > 0 && <Divider />}
                                        <Row>
                                            <Col>
                                                <SampleTable
                                                    filteredTotal={loaded.filtered}
                                                    data={loaded.sources[source]}
                                                    header={header}
                                                />
                                            </Col>
                                        </Row>
                                    </Fragment>
                                ))}
                            </Grid>
                        </div>
                    </Content>
                </Container>
            )}
        </AsyncState>
    )
}
