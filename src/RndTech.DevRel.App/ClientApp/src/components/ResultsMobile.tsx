// @ts-nocheck

import * as React from 'react'
import injectSheet from 'react-jss';
import { Filter } from './filters/Filter'
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
import { getKnownAndWantedData, getCities, getMeta, KnownAndWantedData, MetaData } from '../api';
import { SelectPicker, Divider, Container, Table, FlexboxGrid } from 'rsuite';
import { toPercentWithTenths } from '../format';


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

const defaultFilter: Filter = {
    cities: ['Ростов-на-Дону'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: ['20 - 24 лет', '25 - 29 лет', '30 - 34 лет', '35 - 39 лет', '40 - 44 лет'],
    isCommunity: null
}

type Props = {
    classes?: any,
}

export function ResultsMobile(props: Props) {
    const [city, setCity] = React.useState<string | null>('Ростов-на-Дону');
    const [cities, setCities] = React.useState<string[]>([]);
    const [data, setData] = React.useState<KnownAndWantedData[]>([]);
    const [mostKnown, setMostKnown] = React.useState<BarData[]>([]);
    const [mostWanted, setMostWanted] = React.useState<BarData[]>([]);
    const [meta, setMeta] = React.useState<MetaData>();
    const [ages, setAges] = React.useState<BarData[]>([]);
    const [levels, setLevels] = React.useState<BarData[]>([]);
    const [professions, setProfessions] = React.useState<BarData[]>([]);
    const [languages, setLanguages] = React.useState<BarData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const filter = defaultFilter;
            filter.cities = city !== null ? [ city ] : [];

            const data = await getKnownAndWantedData(filter)
            await setData(data)

            const meta = await getMeta(filter)
            await setMeta(meta)
            await setAges(meta.sources.ages.map(l => ({ name: l.name, level: l.count2022} as BarData)))
            await setLevels(meta.sources.levels.map(l => ({ name: l.name.split('/')[0], level: l.count2022} as BarData)))
            await setProfessions(meta
                .sources
                .professions
                .map(l => ({ name: l.name.split('/')[0], level: l.count2022} as BarData))
                .sort((l1, l2) => l2.level - l1.level)
                .slice(0,10))

            await setLanguages(meta
                .sources
                .languages
                .map(l => ({ name: l.name.split('/')[0], level: l.count2022} as BarData))
                .sort((l1, l2) => l2.level - l1.level)
                .slice(0,10))

            const lastYearData = data.filter(d => d.year === 2022);
            const popular = lastYearData
                .sort((d1, d2) => d2.knownLevel - d1.knownLevel)
                .slice(0, 10)
                .map(d => ({
                    name: d.name.split('(')[0],
                    level: toPercentWithTenths(d.knownLevel)
                } as BarData))
            await setMostKnown(popular)

            const wanted = lastYearData
                .sort((d1, d2) => (d2.wantedLevel + d2.goodLevel) - (d1.wantedLevel + d1.goodLevel))
                .slice(0, 10)
                .map(d => ({
					name: d.name.split('(')[0],
                    level: toPercentWithTenths(d.wantedLevel + d.goodLevel)
                } as BarData))
            await setMostWanted(wanted)
        };

        fetchData();
        }, [city])

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCities()
            await setCities(data)
        };

        fetchData();
        }, [])

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

                    <Divider>Город выборки</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <SelectPicker
                                data={cities.map(item => ({ label: item, value: item }))}
                                defaultValue={'Ростов-на-Дону'}
                                onChange={(value, event) => {
                                setCity(value)
                            }}
                                block />
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
