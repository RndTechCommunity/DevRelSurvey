// @ts-nocheck

import * as React from 'react'
import injectSheet from 'react-jss';
import { DEFAULT_FILTER, sameFilter } from '../features/filters/model'
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import {
    BarChart,
    ResponsiveContainer,
    XAxis,
    Bar,
    YAxis,
    PieChart,
    Pie
} from 'recharts'
import { useEffect } from 'react';
import { getCities, getCompanyResults, getSurveyMeta } from '../api/client';
import { CompanyResult, countOf, LATEST_YEAR, SurveyMeta } from '../api/types';
import { SelectPicker, Divider, Container, Table, FlexboxGrid } from 'rsuite';
import { toPercentWithTenths } from '../shared/format';
import { chartY, selectCompanyRows, topCompanies } from '../features/companies/companyMetrics';


const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name}) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {name}
            </text>
            );
};

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
    },
    headertext : {
        textAlign: 'center'
    },
    smallText : {
        fontSize: '10px'
    }
}

type BarData = {
    name: string,
    level: number
}

type Props = {
    classes?: any,
    state: SurveyState,
    update: UpdateSurveyState
}

export function ResultsMobile(props: Props) {
    const { filter, year } = props.state
    const [cities, setCities] = React.useState<string[]>([]);
    const [data, setData] = React.useState<CompanyResult[]>([]);
    const [mostKnown, setMostKnown] = React.useState<BarData[]>([]);
    const [mostWanted, setMostWanted] = React.useState<BarData[]>([]);
    const [meta, setMeta] = React.useState<SurveyMeta>();
    const [ages, setAges] = React.useState<BarData[]>([]);
    const [levels, setLevels] = React.useState<BarData[]>([]);
    const [professions, setProfessions] = React.useState<BarData[]>([]);
    const [languages, setLanguages] = React.useState<BarData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCompanyResults(filter)
            await setData(data)

            const meta = await getSurveyMeta(filter)
            await setMeta(meta)
            await setAges(meta.sources.ages.map(l => ({ name: l.name, level: countOf(l, year)} as BarData)))
            await setLevels(meta.sources.levels.map(l => ({ name: l.name.split('/')[0], level: countOf(l, year)} as BarData)))
            await setProfessions(meta
                .sources
                .professions
                .map(l => ({ name: l.name.split('/')[0], level: countOf(l, year)} as BarData))
                .sort((l1, l2) => l2.level - l1.level)
                .slice(0,10))

            await setLanguages(meta
                .sources
                .languages
                .map(l => ({ name: l.name.split('/')[0], level: countOf(l, year)} as BarData))
                .sort((l1, l2) => l2.level - l1.level)
                .slice(0,10))

            const top = topCompanies(selectCompanyRows(data, year));
            const popular = top.known
                .map(d => ({
                    name: d.name.split('(')[0],
                    level: toPercentWithTenths(d.knownLevel)
                } as BarData))
            await setMostKnown(popular)

            const wanted = top.attractive
                .map(d => ({
					name: d.name.split('(')[0],
                    level: toPercentWithTenths(chartY(d, { showGood: true, showWanted: true }))
                } as BarData))
            await setMostWanted(wanted)
        };

        fetchData();
        }, [filter, year])

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCities()
            await setCities(data)
        };

        fetchData();
        }, [])

    // Мобильный вид выбирает только один город; остальные ограничения задаются в полной версии.
    const city = filter.cities.length === 1 ? filter.cities[0] : null
    const hasOtherFilters = filter.cities.length > 1
        || (city !== null && cities.length > 0 && !cities.includes(city))
        || !sameFilter({ ...filter, cities: [] }, { ...DEFAULT_FILTER, cities: [] })

    return (
            <Container>
                <div>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <h2>Исследование Ростовского ИТ-сообщества</h2>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            Делаем это исследование, чтобы узнать какие компании в целом знают и рекомендуют, а потом собираем всё в таблицы и графики и открываем для общего использования.
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <i className={props.classes.smallText}>Это мобильная версия сайта с базовыми данными последнего года. Много подробных графиков с сравнением данных между разными периодами можно посмотреть в десктопной версии.</i>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    {year !== LATEST_YEAR && (
                        <FlexboxGrid justify="center">
                            <FlexboxGrid.Item colspan={20}>
                                <b>Данные {year} года</b>
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                    )}

                    <Divider>Город выборки</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <SelectPicker
                                data={cities.map(item => ({ label: item, value: item }))}
                                value={city}
                                onChange={value => props.update({ filter: { ...filter, cities: value ? [value] : [] } })}
                                block />
                            {hasOtherFilters && (
                                <i className={props.classes.smallText}>Применены дополнительные фильтры полной версии</i>
                            )}
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Всего участников</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <h1 className={props.classes.headertext}>{Math.max.apply(null, !data?.length
                    ? [0]
                    : data?.map(ca => ca.selectionCount))}</h1>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Топ узнаваемости</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <ResponsiveContainer width='100%' aspect={1}>
                                <BarChart data={mostKnown} layout='vertical'>
                                    <XAxis type="number" hide={true} />
									<YAxis width={100} type="category" dataKey="name" />
                                    <Bar dataKey="level"
                                        label={{
                                            position: "center",
                                            fill: "black",
                                            formatter: (v: string) => v + ' %',
                                        }}
                                        fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Топ привлекательности</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <ResponsiveContainer width='100%' aspect={1}>
                                <BarChart data={mostWanted} layout='vertical'>
                                    <XAxis type="number" hide={true} />
									<YAxis width={100} type="category" dataKey="name" />
                                    <Bar dataKey="level"
                                        label={{
                                        position: "center",
                                            fill: "black",
                                            formatter: (v: string) => v + ' %',
                                        }}
                                        fill="#7FFFD4" />
                                </BarChart>
                            </ResponsiveContainer>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Возраст и грейд</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <ResponsiveContainer width='100%' aspect={1}>
                                <PieChart>
                                    <Pie data={ages} dataKey="level" outerRadius='50%' fill="#FF4500" labelLine={false} label={renderCustomizedLabel} />
                                    <Pie data={levels} dataKey="level" innerRadius='60%' outerRadius='70%' fill="#82ca9d" labelLine={false} label={renderCustomizedLabel} />
                                </PieChart>
                            </ResponsiveContainer>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Топ специаальностей</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <Table
                                autoHeight={true}
                                showHeader={false}
                                data={professions}>
                                <Table.Column flexGrow={1}>
                                    <Table.HeaderCell />
                                    <Table.Cell dataKey='name'/>
                                </Table.Column>

                                <Table.Column>
                                    <Table.HeaderCell />
                                    <Table.Cell dataKey='level'/>
                                </Table.Column>
                            </Table>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Топ языков</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <Table
                                autoHeight={true}
                                showHeader={false}
                                data={languages}>
                                <Table.Column flexGrow={1}>
                                    <Table.HeaderCell />
                                    <Table.Cell dataKey='name'/>
                                </Table.Column>

                                <Table.Column>
                                    <Table.HeaderCell />
                                    <Table.Cell dataKey='level'/>
                                </Table.Column>
                            </Table>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </div>
            </Container>
            )
}

export default injectSheet(styles)(ResultsMobile)
