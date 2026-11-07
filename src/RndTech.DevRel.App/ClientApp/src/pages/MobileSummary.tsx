import {
    BarChart,
    ResponsiveContainer,
    XAxis,
    Bar,
    YAxis,
    PieChart,
    Pie
} from 'recharts'
import { SelectPicker, Divider, Container, Table, FlexboxGrid } from 'rsuite';
import { CompanyResult, countOf, FilterOptions, LATEST_YEAR, MetaRow, SurveyMeta } from '../api/types';
import { SurveyState } from '../app/surveyState'
import { UpdateSurveyState } from '../app/useSurveyState'
import { chartY, selectCompanyRows, topCompanies } from '../features/companies/companyMetrics';
import { DEFAULT_FILTER, sameFilter } from '../features/filters/model'
import { AsyncState, RequestState } from '../shared/AsyncState';
import { toPercentWithTenths } from '../shared/format';
import styles from './MobileSummary.module.css'

type PieLabelProps = {
    cx: number,
    cy: number,
    midAngle: number,
    innerRadius: number,
    outerRadius: number,
    name: string
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name }: PieLabelProps) => {
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

type BarData = {
    name: string,
    level: number
}

function TopBarChart({ data, fill }: { data: BarData[], fill: string }) {
    return (
        <ResponsiveContainer width='100%' aspect={1}>
            <BarChart data={data} layout='vertical'>
                <XAxis type="number" hide={true} />
                <YAxis width={100} type="category" dataKey="name" />
                <Bar dataKey="level"
                    label={{
                        position: "center",
                        fill: "black",
                        formatter: (v: string) => v + ' %',
                    }}
                    fill={fill} />
            </BarChart>
        </ResponsiveContainer>
    )
}

function TopTable({ data }: { data: BarData[] }) {
    return (
        <Table
            autoHeight={true}
            showHeader={false}
            data={data}>
            <Table.Column flexGrow={1}>
                <Table.HeaderCell>{null}</Table.HeaderCell>
                <Table.Cell dataKey='name'/>
            </Table.Column>

            <Table.Column>
                <Table.HeaderCell>{null}</Table.HeaderCell>
                <Table.Cell dataKey='level'/>
            </Table.Column>
        </Table>
    )
}

type Props = {
    state: SurveyState,
    update: UpdateSurveyState,
    companies: RequestState<readonly CompanyResult[]>,
    meta: RequestState<SurveyMeta>,
    options: RequestState<FilterOptions>
}

const TOP_SIZE = 10

export default function MobileSummary({ state, update, companies, meta, options }: Props) {
    const { filter, year } = state
    const cities = options.data?.cities ?? []

    // Мобильный вид выбирает только один город; остальные ограничения задаются в полной версии.
    const city = filter.cities.length === 1 ? filter.cities[0] : null
    const hasOtherFilters = filter.cities.length > 1
        || (city !== null && cities.length > 0 && !cities.includes(city))
        || !sameFilter({ ...filter, cities: [] }, { ...DEFAULT_FILTER, cities: [] })

    const toBars = (rows: readonly MetaRow[]): BarData[] =>
        rows.map(l => ({ name: l.name.split('/')[0], level: countOf(l, year) }))
    const topBars = (rows: readonly MetaRow[]) =>
        toBars(rows).sort((l1, l2) => l2.level - l1.level).slice(0, TOP_SIZE)

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
                            <i className={styles.smallText}>Это мобильная версия сайта с базовыми данными последнего года. Много подробных графиков с сравнением данных между разными периодами можно посмотреть в десктопной версии.</i>
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
                            <AsyncState state={options}>
                                {loaded => (
                                    <SelectPicker
                                        data={loaded.cities.map(item => ({ label: item, value: item }))}
                                        value={city}
                                        onChange={value => update({ filter: { ...filter, cities: value ? [value] : [] } })}
                                        block />
                                )}
                            </AsyncState>
                            {hasOtherFilters && (
                                <i className={styles.smallText}>Применены дополнительные фильтры полной версии</i>
                            )}
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <Divider>Всего участников</Divider>
                    <FlexboxGrid justify="center">
                        <FlexboxGrid.Item colspan={20}>
                            <AsyncState state={meta}>
                                {loaded => <h1 className={styles.headerText}>{countOf(loaded.filtered, year)}</h1>}
                            </AsyncState>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <AsyncState state={companies}>
                        {data => {
                            const top = topCompanies(selectCompanyRows(data, year))
                            const mostKnown = top.known.map(d => ({
                                name: d.name.split('(')[0],
                                level: toPercentWithTenths(d.knownLevel)
                            }))
                            const mostWanted = top.attractive.map(d => ({
                                name: d.name.split('(')[0],
                                level: toPercentWithTenths(chartY(d, { showGood: true, showWanted: true }))
                            }))
                            return (
                                <>
                                    <Divider>Топ узнаваемости</Divider>
                                    <FlexboxGrid justify="center">
                                        <FlexboxGrid.Item colspan={20}>
                                            <TopBarChart data={mostKnown} fill="#8884d8" />
                                        </FlexboxGrid.Item>
                                    </FlexboxGrid>

                                    <Divider>Топ привлекательности</Divider>
                                    <FlexboxGrid justify="center">
                                        <FlexboxGrid.Item colspan={20}>
                                            <TopBarChart data={mostWanted} fill="#7FFFD4" />
                                        </FlexboxGrid.Item>
                                    </FlexboxGrid>
                                </>
                            )
                        }}
                    </AsyncState>

                    <AsyncState state={meta}>
                        {loaded => (
                            <>
                                <Divider>Возраст и грейд</Divider>
                                <FlexboxGrid justify="center">
                                    <FlexboxGrid.Item colspan={20}>
                                        <ResponsiveContainer width='100%' aspect={1}>
                                            <PieChart>
                                                <Pie data={loaded.sources.ages.map(l => ({ name: l.name, level: countOf(l, year) }))} dataKey="level" outerRadius='50%' fill="#FF4500" labelLine={false} label={renderCustomizedLabel} />
                                                <Pie data={toBars(loaded.sources.levels)} dataKey="level" innerRadius='60%' outerRadius='70%' fill="#82ca9d" labelLine={false} label={renderCustomizedLabel} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </FlexboxGrid.Item>
                                </FlexboxGrid>

                                <Divider>Топ специаальностей</Divider>
                                <FlexboxGrid justify="center">
                                    <FlexboxGrid.Item colspan={20}>
                                        <TopTable data={topBars(loaded.sources.professions)} />
                                    </FlexboxGrid.Item>
                                </FlexboxGrid>

                                <Divider>Топ языков</Divider>
                                <FlexboxGrid justify="center">
                                    <FlexboxGrid.Item colspan={20}>
                                        <TopTable data={topBars(loaded.sources.languages)} />
                                    </FlexboxGrid.Item>
                                </FlexboxGrid>
                            </>
                        )}
                    </AsyncState>
                </div>
            </Container>
            )
}
