import { useEffect, useState } from 'react'
import {
    CartesianGrid,
    Dot,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    ScatterPointItem,
    Text,
    usePlotArea,
    XAxis,
    YAxis
} from 'recharts'
import { Tooltip, Whisper } from 'rsuite'
import { CompanyResult } from '../../api/types'
import { toPercent, toPercentWithTenths } from '../../shared/format'
import styles from './CompanyMap.module.css'
import { ChartMetric, companyNames, METRIC_LABELS, metricValue, nearbyCompanies, yAxisScale } from './companyMetrics'

const companyFillColorMap: { readonly [name: string]: string } = {
    'OSSHelp': '#E34422',
    'Почтатех': '#0018A8',
    'Mobyte': '#8F68AC',
    'INOSTUDIO': '#E4003B',
    'A2SEVEN': '#F6B300',
    'IntSpirit': '#179BD7',
    'Justice IT': '#6BA7C3',
    'Afterlogic': '#1CBEE5',
    'IBS Dunice': '#009C4F',
    'ИТРУМ (ex Exceed Team)': '#26397E',
    'Аркадия': '#00ABDB',
    'Контур': '#D70C17',
    'Axenix (ex Accenture)': '#A100FF',
    'Oggetto': '#FFDD00',
    'Distillery': '#d8a462',
    'Devexperts': '#f4511e',
    'РНДСОФТ': '#ff8833',
    'Usetech': '#92B700',
    'НИИ "Спецвузавтоматика"': '#237BE7',
    'uKit': '#338FFF',
    'MentalStack': '#ffe13c',
    'Reksoft': '#E22227',
    'WebAnt': '#C21B75',
    'Intellectika (Интеллектика)': '#03723A',
    'Вебпрактик': '#FFBE01',
    'Auriga': '#007BE0',
    'Центр-инвест': 'rgb(57, 163, 28)',
    'Тинькофф': '#FFDD2D'
}

type MapPoint = CompanyResult & { readonly metricValue: number }

type Props = {
    rows: readonly CompanyResult[],
    focused: string | null,
    onFocus: (name: string) => void,
    year: number,
    compareYear: number | null,
    metric: ChartMetric,
    scale: ReturnType<typeof yAxisScale>
}

function CompanyLabel({ name, cx, cy }: { name: string, cx: number, cy: number }) {
    const plot = usePlotArea()
    if (!plot) return null
    const left = cx > plot.x + plot.width / 2
    const below = cy < plot.y + plot.height / 2
    const width = left ? cx - plot.x - 12 : plot.x + plot.width - cx - 12
    return <Text x={cx + (left ? -12 : 12)} y={cy + (below ? 12 : -12)}
        width={width} textAnchor={left ? 'end' : 'start'} verticalAnchor={below ? 'start' : 'end'}
        breakAll style={{ fontSize: 12, fontWeight: 600 }} fill='inherit' className={styles.label}>{name}</Text>
}

const HIT_RADIUS = 12

function CompanyPoint({ point, points, focused, onFocus, tooltipName, onTooltip, yMax, year, comparison }: {
    point: ScatterPointItem,
    points: readonly MapPoint[],
    focused: string | null,
    onFocus: (name: string) => void,
    tooltipName: string | null,
    onTooltip: (name: string | null) => void,
    yMax: number,
    year: number,
    comparison: boolean
}) {
    const plot = usePlotArea()
    const { payload, cx, cy } = point
    const target: MapPoint = payload
    const { name, knownVotes, goodVotes, wantedVotes, selectionCount } = target
    if (cx === undefined || cy === undefined) return null
    const selected = name === focused
    const compared = target.year !== year
    const pointKey = `${target.year}:${name}`
    const label = !compared || !points.some(row => row.name === name && row.year === year)
    const color = companyFillColorMap[name] || 'var(--chart-point)'
    const nearby = plot && Number.isFinite(plot.width) && Number.isFinite(plot.height) && plot.width > 0 && plot.height > 0
        ? nearbyCompanies(points, target, { x: HIT_RADIUS / plot.width, y: HIT_RADIUS / plot.height * yMax }) : []
    const tooltip = (
        <Tooltip className={styles.tooltip}>
            <div>{name}{comparison && ` · ${target.year}`}</div>
            <div className={styles.number}>Знают: {knownVotes} человек, {toPercentWithTenths(knownVotes / selectionCount)}%</div>
            <div className={styles.number}>Рекомендуют: {goodVotes} человек, {toPercentWithTenths(goodVotes / selectionCount)}%</div>
            <div className={styles.number}>Хотят работать: {wantedVotes} человек, {toPercentWithTenths(wantedVotes / selectionCount)}%</div>
            {nearby.length > 1 && <><div>Рядом на карте:</div><ul>{nearby.map(row => <li key={`${row.year}:${row.name}`}>{row.name}{comparison && ` · ${row.year}`}</li>)}</ul></>}
        </Tooltip>
    )
    return (
        <Whisper placement='auto' trigger='none' open={tooltipName === pointKey} speaker={tooltip}>
            <g fill={color} data-company={name} data-year={target.year}
                onPointerEnter={event => { if (event.pointerType === 'mouse') onTooltip(pointKey) }}
                onPointerLeave={event => { if (event.pointerType === 'mouse') onTooltip(null) }}
                onClick={() => { onTooltip(pointKey); onFocus(name) }}>
                <circle cx={cx} cy={cy} r={HIT_RADIUS} fill='transparent' />
                {selected && <Dot cx={cx} cy={cy} r={10} fill='none' stroke='var(--rs-text-primary)' strokeWidth={1.5} />}
                {compared && <Dot cx={cx} cy={cy} r={selected ? 7 : 6} fill='none' stroke='var(--rs-text-primary)' strokeWidth={4} />}
                <Dot cx={cx} cy={cy} r={selected ? 7 : compared ? 6 : 4}
                    fill={compared ? 'none' : color} stroke={compared ? color : 'var(--rs-text-primary)'}
                    strokeWidth={compared ? 2 : 1} />
                {label && <CompanyLabel name={name} cx={cx} cy={cy} />}
            </g>
        </Whisper>
    )
}

export default function CompanyMap({ rows, year, compareYear, metric, scale, focused, onFocus }: Props) {
    const [tooltipName, setTooltipName] = useState<string | null>(null)
    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!(event.target instanceof Element) || !event.target.closest(`[data-company], .${styles.tooltip}`)) setTooltipName(null)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setTooltipName(null)
        }
        document.addEventListener('click', close)
        document.addEventListener('keyup', closeOnEscape)
        return () => {
            document.removeEventListener('click', close)
            document.removeEventListener('keyup', closeOnEscape)
        }
    }, [])

    const points: MapPoint[] = rows.map(row => ({ ...row, metricValue: metricValue(row, metric) }))
    const years = compareYear === null ? [year] : [compareYear, year]

    return (
        <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart margin={{ top: 12, left: 12, bottom: 10, right: 10 }} accessibilityLayer={false} role='img'
                aria-label={`Карта компаний, ${year}${compareYear === null ? ' год' : ` и ${compareYear} годы`}. ${METRIC_LABELS[metric]}. Компаний: ${companyNames(rows).length}. Числа доступны в виде «Таблица».`}>
                <CartesianGrid stroke='var(--chart-grid)' strokeDasharray='1 1' />
                <XAxis
                    label={{
                        value: 'Узнаваемость',
                        position: 'center',
                        dy: 20,
                        fill: 'var(--chart-axis)'
                    }}
                    dataKey='knownLevel'
                    type='number'
                    domain={[0, 1]}
                    tickCount={11}
                    stroke='var(--chart-axis)'
                    tickFormatter={toPercent}
                    axisLine={false}
                />
                <YAxis
                    label={{
                        value: METRIC_LABELS[metric],
                        position: 'center',
                        angle: -90,
                        dx: 20,
                        fill: 'var(--chart-axis)'
                    }}
                    dataKey='metricValue'
                    type='number'
                    domain={[0, scale.max]}
                    ticks={scale.ticks}
                    stroke='var(--chart-axis)'
                    tickFormatter={toPercent}
                    axisLine={false}
                    orientation='right'
                />
                {/* Выбранная компания поверх обоих лет, даже если она есть только в году сравнения. */}
                {[false, true].flatMap(selected => years.map(shownYear => <Scatter key={`${selected}:${shownYear}`}
                    data={points.filter(point => point.year === shownYear && (point.name === focused) === selected)}
                    shape={point => <CompanyPoint point={point} points={points} focused={focused} onFocus={onFocus}
                        year={year} comparison={compareYear !== null}
                        tooltipName={tooltipName} onTooltip={setTooltipName} yMax={scale.max} />}
                    isAnimationActive={false}
                />))}
            </ScatterChart>
        </ResponsiveContainer>
    )
}
