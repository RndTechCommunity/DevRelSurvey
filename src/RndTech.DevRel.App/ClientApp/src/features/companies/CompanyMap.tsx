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
import { ChartMetric, METRIC_LABELS, metricValue, yAxisScale } from './companyMetrics'

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
    year: number,
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

export default function CompanyMap({ rows, year, metric, scale, focused }: Props) {
    const renderCompanyEntry = ({ payload, cx, cy }: ScatterPointItem) => {
        const { name, knownVotes, goodVotes, wantedVotes, selectionCount }: MapPoint = payload
        if (cx === undefined || cy === undefined) {
            return null
        }

        const selected = name === focused
        const tooltip = (
            <Tooltip className={styles.tooltip}>
                <div>{name}</div>
                <div className={styles.number}>Знают: {knownVotes} человек, {toPercentWithTenths(knownVotes / selectionCount)}%</div>
                <div className={styles.number}>Рекомендуют: {goodVotes} человек, {toPercentWithTenths(goodVotes / selectionCount)}%</div>
                <div className={styles.number}>Хотят работать: {wantedVotes} человек, {toPercentWithTenths(wantedVotes / selectionCount)}%</div>
            </Tooltip>
        )

        return (
            <Whisper placement='auto' trigger='hover' speaker={tooltip}>
                <g fill={companyFillColorMap[name] || 'var(--chart-point)'} data-company={name}>
                    {selected && <Dot cx={cx} cy={cy} r={10} fill='none' stroke='var(--rs-text-primary)' strokeWidth={1.5} />}
                    <Dot cx={cx} cy={cy} r={selected ? 7 : 4} stroke='var(--rs-text-primary)' />
                    {selected && <CompanyLabel name={name} cx={cx} cy={cy} />}
                </g>
            </Whisper>
        )
    }

    const points: MapPoint[] = rows.map(row => ({ ...row, metricValue: metricValue(row, metric) }))
        .sort((a, b) => Number(a.name === focused) - Number(b.name === focused))

    return (
        <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart margin={{ top: 12, left: 12, bottom: 10, right: 10 }} accessibilityLayer={false} role='img'
                aria-label={`Карта компаний, ${year} год. ${METRIC_LABELS[metric]}. Компаний: ${rows.length}. Числа доступны в виде «Таблица».`}>
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
                <Scatter
                    data={points}
                    shape={renderCompanyEntry}
                    isAnimationActive={false}
                />
            </ScatterChart>
        </ResponsiveContainer>
    )
}
