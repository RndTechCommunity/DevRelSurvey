import {
    CartesianGrid,
    Dot,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    ScatterPointItem,
    XAxis,
    YAxis
} from 'recharts'
import { Tooltip, Whisper } from 'rsuite'
import { CompanyResult } from '../../api/types'
import { toPercent, toPercentWithTenths } from '../../shared/format'
import { chartY, ChartFlags } from './companyMetrics'

const defaultFillColor = '#AAAAAA'
const axesColor = '#81E2E7'

// Ключи — подписи с неразрывными пробелами; исходное имя компании остаётся идентификатором.
const companyFillColorMap: { readonly [label: string]: string } = {
    'OSSHelp': '#E34422',
    'Почтатех': '#0018A8',
    'Mobyte': '#8F68AC',
    'INOSTUDIO': '#E4003B',
    'A2SEVEN': '#F6B300',
    'IntSpirit': '#179BD7',
    'Justice\u00A0IT': '#6BA7C3',
    'Afterlogic': '#1CBEE5',
    'IBS\u00A0Dunice': '#009C4F',
    'ИТРУМ\u00A0(ex\u00A0Exceed\u00A0Team)': '#26397E',
    'Аркадия': '#00ABDB',
    'Контур': '#D70C17',
    'Axenix\u00A0(ex\u00A0Accenture)': '#A100FF',
    'Oggetto': '#FFDD00',
    'Distillery': '#d8a462',
    'Devexperts': '#f4511e',
    'РНДСОФТ': '#ff8833',
    'Usetech': '#92B700',
    'НИИ\u00A0"Спецвузавтоматика"': '#237BE7',
    'uKit': '#338FFF',
    'MentalStack': '#ffe13c',
    'Reksoft': '#E22227',
    'WebAnt': '#C21B75',
    'Intellectika\u00A0(Интеллектика)': '#03723A',
    'Вебпрактик': '#FFBE01',
    'Auriga': '#007BE0',
    'Центр-инвест': 'rgb(57, 163, 28)',
    'Тинькофф': '#FFDD2D'
}

const nbspLabel = (text: string) => text.split(' ').join('\u00A0')

type MapPoint = CompanyResult & { readonly chartY: number }

type Props = {
    rows: readonly CompanyResult[],
    yAxisMax: number,
    flags: ChartFlags,
    showLegacyError: boolean
}

export default function CompanyMap({ rows, yAxisMax, flags, showLegacyError }: Props) {
    const renderCompanyEntry = ({ payload, cx, cy }: ScatterPointItem) => {
        const { name, error, knownLevel, knownVotes, goodVotes, wantedVotes, selectionCount }: MapPoint = payload
        if (cx === undefined || cy === undefined) {
            return null
        }

        const tooltip = (
            <Tooltip>
                {nbspLabel(`Знают: ${knownVotes} человек,`
                    + ` ${toPercentWithTenths(knownVotes / selectionCount)}%`)}<br />
                {nbspLabel(`Рекомендуют: ${goodVotes} человек,`
                    + ` ${toPercentWithTenths(goodVotes / selectionCount)}%`)}<br />
                {nbspLabel(`Хотят работать: ${wantedVotes} человек,`
                    + ` ${toPercentWithTenths(wantedVotes / selectionCount)}%`)}<br />
            </Tooltip>
        );

        // При нулевой узнаваемости формула даёт Infinity или NaN — круг не рисуется.
        const radius = (showLegacyError ? error : 0) * cx / knownLevel

        return (
            <Whisper placement='auto' trigger='hover' speaker={tooltip}>
                <g fill={companyFillColorMap[nbspLabel(name)] || defaultFillColor} data-company={name}>
                    <g fillOpacity={0.1}>
                        <Dot cx={cx} cy={cy} r={Number.isFinite(radius) ? radius : 0} />
                    </g>
                    <Dot cx={cx} cy={cy} r={1.5} />
                    <g transform={`translate(${cx},${cy})`}>
                        <text x={6} y={0} dy={-2} textAnchor='left' style={{ fontWeight: 600 }}>
                            {nbspLabel(name)}
                        </text>
                    </g>
                </g>
            </Whisper>
        )
    }

    const points: MapPoint[] = rows.map(row => ({ ...row, chartY: chartY(row, flags) }))

    return (
        <ResponsiveContainer aspect={1.5} width={1100}>
            <ScatterChart margin={{ bottom: 10, right: 10 }} accessibilityLayer={false}>
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
                    dataKey='chartY'
                    type='number'
                    domain={[0, yAxisMax]}
                    tickCount={11}
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
