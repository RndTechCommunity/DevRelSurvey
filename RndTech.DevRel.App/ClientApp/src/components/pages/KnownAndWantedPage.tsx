import * as React from 'react'
import {
    CartesianGrid,
    Dot,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis
} from 'recharts'
import { KnownAndWantedData } from '../../api'
import { toPercent, toPercentWithTenths } from '../../format'
import { Filter } from '../filters/Filter'
import MultiSelect from '../MultiSelect'
import injectSheet from 'react-jss';
import { Checkbox, Loader, Tooltip, Whisper } from 'rsuite';
import { useEffect } from 'react';

const defaultFillColor = '#AAAAAA'
const axesColor = '#81E2E7'

const styles = {
    container: {},
    companies: {
        position: 'absolute',
        margin: '15px',
        zIndex: 1000
    },
    chart: {
        fontSize: '12px',
    },
    graphicFilter: {
        display: 'flex',
        textAlign: 'center',
        verticalAlign: 'middle'
    },
    graphicFilterCompanies: {
        paddingTop: '10px',
        paddingBottom: '10px',
        lineHeight: 1,
        paddingRight: '10px'
    }
}

const companyFillColorMap = {
    'Контур': '#D70C17',
    'Accenture': '#A100FF',
    'Oggetto': '#FFDD00',
    'Distillery': '#d8a462',
    'Devexperts': '#f4511e',
    'Rnd soft (+Winvestor)': '#ff8833',
    'Arcadia': '#2eaecc',
    'Usetech': '#92B700',
    'НИИ "Спецвузавтоматика"': '#237BE7',
    'uKit': '#338FFF',
    'MentalStack': '#ffe13c',
    'Reksoft': '#E22227',
    'WebAnt': '#C21B75',
    'Intellectika (Интеллектика)': '#03723A',
    'Вебпрактик': '#FFBE01',
    'Auriga': '#007BE0',
    'ЦентрИнвест': 'rgb(57, 163, 28)'
}

type Props = {
    classes?: any,
    filter: Filter,
    year: number,
    selectedCompanies: string[],
    onCompaniesChanged: (filter: string[]) => void,
    useError: boolean,
    useGood: boolean,
    useWanted: boolean,
    companyEntries: KnownAndWantedData[] | undefined,
    onUseErrorChanged: (filter: boolean) => void,
    onUseGoodChanged: (filter: boolean) => void,
    onUseWantedChanged: (filter: boolean) => void,
    companies: { value: string; label: any; }[]
}

export function KnownAndWantedPage(props: Props) {
    const [companyEntries, setCompanyEntries] = React.useState<KnownAndWantedData[]>();
    const [maxWantedLevel, setMaxWantedLevel] = React.useState<number>(0.3);
    const [useError, setUseError] = React.useState<boolean>(props.useError);
    const [useGood, setUseGood] = React.useState<boolean>(props.useGood);
    const [useWanted, setUseWanted] = React.useState<boolean>(props.useWanted);
    const [selectedCompanies, setSelectedCompanies] = React.useState<string[]>(props.selectedCompanies);

    const loadData = () => {
        if (!props.companyEntries) {
            return
        }
        
        const companyEntries = props.companyEntries.filter(d => d.year === props.year)
        const maxWantedLevel = Math.max.apply(null,
            companyEntries.map(ce => (useGood ? 1 : 0) * ce.goodLevel + (useWanted ? 1 : 0) * ce.wantedLevel)) + 0.05;

        setCompanyEntries(companyEntries)
        setMaxWantedLevel(maxWantedLevel)
    }
    
    useEffect(() => {
        loadData()
        console.log(1)
    }, [props.companyEntries, props.year])

    useEffect(() => {
        const maxWantedLevel = Math.max.apply(null,
            companyEntries?.map(ce => (useGood ? 1 : 0) * ce.goodLevel + (useWanted ? 1 : 0) * ce.wantedLevel)) + 0.05;

        setMaxWantedLevel(maxWantedLevel)
        console.log(3)
    }, [useGood, useWanted])

    const { classes, onCompaniesChanged, onUseErrorChanged, onUseGoodChanged, onUseWantedChanged } = props

    if (!companyEntries) {
        return (<Loader content='Загрузка данных' center />)
    }

    const getFillColor = (company: string) => {
        return companyFillColorMap[company] || defaultFillColor
    }

    const renderLabel = (company: string) => {
        const parts = company.split(' ')
        return parts.join('\u00A0')
    }

    const renderCompanyEntry = (entry: KnownAndWantedData & { cx: number, cy: number }) => {
        const { name, error, cx, cy, knownVotes, goodVotes, wantedVotes, selectionCount } = entry

        const tooltip = (
            <Tooltip>
                {renderLabel(`Знают: ${knownVotes} человек,`
                    + ` ${toPercentWithTenths(knownVotes / selectionCount)}%`)}<br />
                {renderLabel(`Рекомендуют: ${goodVotes} человек,`
                    + ` ${toPercentWithTenths(goodVotes / selectionCount)}%`)}<br />
                {renderLabel(`Хотят работать: ${wantedVotes} человек,`
                    + ` ${toPercentWithTenths(wantedVotes / selectionCount)}%`)}<br />
            </Tooltip>
        );
        
        const radius = (useError ? error : 0) * cx / entry.knownLevel

        return (
            <Whisper placement='auto' trigger='hover' speaker={tooltip}>
                <g fill={getFillColor(name)}>
                    <g fillOpacity={0.1}>
                        <Dot cx={cx} cy={cy} r={radius} />
                    </g>
                    <Dot cx={cx} cy={cy} r={1.5} />
                    <g transform={`translate(${cx},${cy})`}>
                        <text x={6} y={0} dy={-2} textAnchor='left' style={{ fontWeight: 600 }}>
                            {name}
                        </text>
                    </g>
                </g>
            </Whisper>
        )
    }

    const entries = selectedCompanies.length > 0
        ? companyEntries?.filter(x => selectedCompanies.indexOf(x.name) !== -1)
        : companyEntries

    const data = entries?.map(x => ({
        knownLevel: x.knownLevel,
        wantedLevel: (useGood ? 1 : 0) * x.goodLevel + (useWanted ? 1 : 0) * x.wantedLevel,
        name: renderLabel(x.name),
        error: x.error,
        knownVotes: x.knownVotes,
        goodVotes: x.goodVotes,
        wantedVotes: x.wantedVotes,
        selectionCount: x.selectionCount
    }))

    console.log(2)
    return (
        <div className={classes.container}>
            <div>
                <h4>
                    В выборке {Math.max.apply(null, !data?.length
                    ? [0]
                    : data?.map(ca => ca.selectionCount))} человек
                </h4>
            </div>
            <div className={classes.companies}>
                <div className={classes.graphicFilter}>
                    <div className={classes.graphicFilterCompanies}>
                        <label>Компании</label>
                    </div>
                    <MultiSelect
                        items={props.companies}
                        placeholder='Компании'
                        selected={selectedCompanies}
                        onChange={selectedCompanies => {
                            setSelectedCompanies(selectedCompanies)
                            onCompaniesChanged(selectedCompanies)
                        }}
                    />
                    <Checkbox
                        checked={useError}
                        onChange={(v, ch) => {
                            setUseError(ch)
                            onUseErrorChanged(ch)
                        }}
                    >
                        Отображать доверительный интервал
                    </Checkbox>
                    <Checkbox
                        checked={useGood}
                        onChange={(v, ch) => {
                            setUseGood(ch)
                            onUseGoodChanged(ch)
                        }}
                    >
                        Знаю и рекомендую
                    </Checkbox>
                    <Checkbox
                        checked={useWanted}
                        onChange={(v, ch) => {
                            setUseWanted(ch)
                            onUseWantedChanged(ch)
                        }}
                    >
                        Знаю и хочу работать
                    </Checkbox>
                </div>
            </div>
            <ResponsiveContainer aspect={1.5} width={1100}>
                <ScatterChart margin={{ bottom: 10, right: 10 }} className={classes.chart}>
                    <CartesianGrid strokeDasharray='1 1' />
                    <XAxis
                        label={{
                            value: 'Узнаваемость',
                            position: 'center',
                            dy: 20,
                            fill: axesColor
                        }}
                        dataKey='knownLevel'
                        type='number'
                        domain={[0, 1]}
                        tickCount={11}
                        tickFormatter={toPercent}
                        axisLine={false}
                    />
                    <YAxis
                        label={{
                            value: 'Привлекательность',
                            position: 'center',
                            angle: -90,
                            dx: 20,
                            fill: axesColor
                        }}
                        dataKey='wantedLevel'
                        type='number'
                        domain={[0, maxWantedLevel]}
                        tickCount={11}
                        tickFormatter={toPercent}
                        axisLine={false}
                        orientation='right'
                    />
                    <Scatter
                        data={data}
                        shape={x => renderCompanyEntry(x)}
                        isAnimationActive={false}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    )
}

export default injectSheet(styles)(KnownAndWantedPage)
