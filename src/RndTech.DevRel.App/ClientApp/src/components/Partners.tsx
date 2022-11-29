import * as React from 'react'
import { FlexboxGrid, Avatar, Row, Col, Panel } from 'rsuite';
import injectSheet from 'react-jss';

const styles = {
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        padding: '10px'
    },
    pageText: {
        fontFamily: 'Roboto, "JetBrains Mono"'
    },
    centeredText: {
        textAlign: 'center'
    }
}

type Props = {
    classes?: any,
}

class Partners extends React.Component<Props> {
    render() {
        const { classes } = this.props
        return (
            <FlexboxGrid justify='center'>
                <FlexboxGrid.Item colspan={12} className={classes.pageText}>
                    &nbsp;
                    <p>
                        Чем больше людей из местного ИТ-сообщества заполняют анкету, 
                        тем точнее получаются данные в результатах и больше довермя к ним.
                    </p>
                    <p>
                        Мы очень благодарны нашим друзьям, которые  передавали ссылки на опрос 
                        во внутренние чаты и рассылки, делились ими в соц.сетях и рассказывали
                        о нем коллегам и знакомым. Благодаря вам в этом году у нас в полтора раза
                        больше участников, целых 1200!
                    </p>
                    <p>
                        Хотим сказать отдельное спасибо и 💓 сообществам и компаниям,
                        которые помогали нам в публичном распространении анкеты 
                        в своих группах, каналах и на сайтах:
                    </p>
                    <Row>
                        <Col md={6} sm={12}>
                            <Panel className={classes.centeredText}>
                                <a href={'https://t.me/js_tgn'}>
                                    <Avatar
                                        circle
                                        size={'lg'}
                                        src={'https://cdn4.telesco.pe/file/m1NGOkzHCUyFw8faN3fJPR3a9nFqoxpyOLbpPM0IVHCrfBpnr8EcIurZVnwTfIMplV9JO1ufPYiCwPcVd5mZZ2dAlqPxY3N_l46AM_cX1EeDuQR8D59OKKWX4BNLrlQnsx9CD_DUkzNyALIMaiXf5naaTqycrbv98ri96wdDIQXHtg4-f9TBDQM7vSjUK_0G3Sla2rTLyMXwv285JMVEqZyf2vFnbONPGIuDqS0THNV7ZHcJcOULSOnKMqKO2iOaTlzai9K5TPMwTdRIqWAmWpL2Hq9_VB1aivuEuVW40A23PtdKdGOihkvQWMVQ6T4BPVOlPVWUVTDS7WkukVCgsg.jpg'}
                                    />
                                    <p>JS Tgn Weekends</p>
                                </a>
                            </Panel>
                        </Col>
                        <Col md={6} sm={12}>
                            <Panel className={classes.centeredText}>
                                <a href={'https://vk.com/storytellingsoftware'}>
                                    <Avatar 
                                        circle 
                                        size={'lg'} 
                                        src={'https://sun1-29.userapi.com/impf/c844416/v844416136/62733/cyeiMFPEC18.jpg?size=50x0&quality=96&crop=0,0,400,400&sign=616856dca1327f3d4ff95fc3ab2115d5&ava=1'} 
                                    />
                                    <p>Storytelling Software</p>
                                </a>
                            </Panel>
                        </Col>
                        <Col md={6} sm={12}>
                            <Panel className={classes.centeredText}>
                                <a href={'https://t.me/it_61job'}>
                                    <Avatar
                                        circle
                                        size={'lg'}
                                        src={'https://cdn4.telesco.pe/file/RLXIqTpXuDZ0z9-wnbCk09YbJMeXya6JS2BybvfQaVDSISdMVeyePthp2fnQcXWt-Nr28tL5upkieBfN_7jWRYPD8U3X0cvBKltK7w4ZkqdjOT7OQD98wkrHEvpK53i_TzVW2oUnhYzxXVjJj5aWz-p9VC6diO1f2w5Px5lfpat6S0KDv_IZZUoL9H5xNEmfen5RM_VYoIBlf60HARtdR_8bI6IW9CYrovtD4px1OwN856M8jdOxMHBj3url7yeDeU3pDN4Ex9kBglSVIOWv4yuz-bn7tCN9rModvL1R4NwNFs6m3nj-bdJH_XV5kS3g6MjybhDMf5B-o-cFu2lZZw.jpg'}
                                    />
                                    <p>IT61job</p>
                                </a>
                            </Panel>
                        </Col>
                        <Col md={6} sm={12}>
                            <Panel className={classes.centeredText}>
                                <a href={'https://vk.com/afterlogic'}>
                                    <Avatar
                                        circle
                                        size={'lg'}
                                        src={'https://sun1-94.userapi.com/impg/c853420/v853420286/1a884c/CrEv2AnHg3U.jpg?size=50x0&quality=96&crop=30,95,905,905&sign=f14e3c6addfd49af8a588d0eadc1f1bc&ava=1'}
                                    />
                                    <p>Afterlogic</p>
                                </a>
                            </Panel>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} sm={12} />
                        <Col md={6} sm={12}>
                            <Panel className={classes.centeredText}>
                                <a href={'https://www.facebook.com/mopevm/'}>
                                    <Avatar
                                        circle
                                        size={'lg'}
                                        src={'https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/10420331_816875101668357_2010640913126961740_n.jpg?_nc_cat=107&ccb=2&_nc_sid=09cbfe&_nc_ohc=2Wp5oZTn-QkAX_YZUOM&_nc_ht=scontent-arn2-1.xx&oh=9d00d2f8329a2f95f8b0e54458e31394&oe=6010F76E'}
                                    />
                                    <p>Кафедра МОП ЭВМ - ИТА ЮФУ</p>
                                </a>
                            </Panel>
                        </Col>
                        <Col md={6} sm={12}>
                            <Panel className={classes.centeredText}>
                                <a href={'https://t.me/qarostov'}>
                                    <Avatar
                                        circle
                                        size={'lg'}
                                        src={'https://cdn4.telesco.pe/file/P1G1vMCtNRyutXRU2ckYxryv7cBK0nUiJTPGjuXNeatU0ymvhqi7iwGVNVnr2lQf01DBQsHX0COvbE8XiAk3WWe9bNKODLi8yyG6Iksgaxa8yu1wK8fp5C7P6r8xfqkxWNjLPraSyWNcjxZMlSLvcSAV5h5qAFMcQNjv_tHjjnYSsRSfJ-mXWbiay9DhGb_EIEpb6meFNbbDtg8wRPdNpEG8vW8ZWxJqR92rb804y2WMCaaAnxNyJmIx_n99S2NzxB8Kw37CmXKB5eTr4OKbhVhU0IGLqT2ijJnVs0wOdWUFbES2NruZlkHcj2BOTb_8kre7OAsvrwIvuDA1KbnAhA.jpg'}
                                    />
                                    <p>QA - Rostov</p>
                                </a>
                            </Panel>
                        </Col>
                    </Row>
                    
                    <p>
                        Мы делали эту страницу в последний момент :) и уверены, что забыли кого-то разместить.
                        Не стесняйтесь написать нам в личку чтобы мы вас добавили (или присылайте пулл-реквест
                        в <a href={'https://github.com/RndTechCommunity/DevRelSurvey'}>Github</a>).
                    </p>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        )
    }
}

export default injectSheet(styles)(Partners)
