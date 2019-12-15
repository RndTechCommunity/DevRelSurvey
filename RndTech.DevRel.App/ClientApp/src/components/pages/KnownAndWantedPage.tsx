import Gapped from '@skbkontur/react-ui/components/Gapped/Gapped'
import Loader from '@skbkontur/react-ui/components/Loader/Loader'
import * as React from 'react'
import injectSheet, { CSSProperties } from 'react-jss'
import {
    CartesianGrid,
    Dot,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis
} from 'recharts'
import { getKnownAndWantedData, KnownAndWantedData } from '../../api'
import { toPercent } from '../../format'
import { Filter, selectedCompanies } from '../filters/Filter'
import MultiSelect from '../MultiSelect'

const styles = {
    container: {},
    companies: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 1000
    } as CSSProperties<Props>,
    chart: {
        fontSize: '12px'
    }
}

const defaultFillColor = '#666'

const companyFillColorMap = {
    'Контур': '#D70C17',
    'Яндекс': 'rgb(249, 219, 103)',
    'JetBrains': 'rgb(173, 81, 140)',
    'Тинькофф': 'rgb(64, 71, 86)',
    'Avito': 'rgb(163, 204, 74)',
    'ЦентрИнвест': 'rgb(57, 163, 28)',
    'TradingView (eSignal)': 'rgb(31, 150, 243)',
    'Umbrella IT': 'rgb(0, 80, 255)',
    'WIS Software': 'rgb(109, 213, 68)',
    'INOSTUDIO': 'rgb(189, 33, 47)'
}

type Props = {
    classes?: any,
    filter: Filter
}

type State = {
    isReady: boolean,
    companyEntries: CompanyEntry[]
    companies: string[],
    maxWantedLevel: number,
    selectedCompanies: string[]
}

type CompanyEntry = {
    company: string,
    knownLevel: number,
    wantedLevel: number,
    error: number
}

class KnownAndWantedPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        companyEntries: [],
        companies: [],
        maxWantedLevel: 0.3,
        selectedCompanies
    }

    componentDidMount() {
        this.loadData(this.props.filter)
            .then(() => this.setState({ isReady: true }))
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.filter !== prevProps.filter) {
            this.setState({ isReady: false })

            this.loadData(this.props.filter)
                .then(() => this.setState({ isReady: true }))
        }
    }

    loadData(filter: Filter) {
        return getKnownAndWantedData(filter)
            .then(data => {
                const companyEntries = KnownAndWantedPage.calculateEntries(data)
                const companies = KnownAndWantedPage.calculateList(companyEntries).sort()
                const maxWantedLevel = Math.max.apply(null, companyEntries.map(ce => ce.wantedLevel)) + 0.05;
                this.setState({
                    companyEntries,
                    companies,
                    maxWantedLevel
                })
            })
    }

    render() {
        const { classes } = this.props
        const {
            isReady,
            companyEntries,
            companies,
            maxWantedLevel,
            selectedCompanies
        } = this.state

        if (!isReady) {
            return null
        }

        const entries = selectedCompanies.length > 0
            ? companyEntries.filter(x => selectedCompanies.indexOf(x.company) !== -1)
            : companyEntries

        const data = entries.map(x => ({
            ...x,
            label: this.renderLabel(x.company)
        }))

        return (
            <Loader active={!isReady} className={classes.container}>
                <div className={classes.companies}>
                    <Gapped>
                        <span>Компании</span>
                        <MultiSelect
                            items={companies}
                            selected={selectedCompanies}
                            onChange={selectedCompanies => this.setState({ selectedCompanies })}
                        />
                    </Gapped>
                </div>
                <ResponsiveContainer aspect={1.5} width={1100}>
                    <ScatterChart margin={{ bottom: 10, right: 10 }} className={classes.chart}>
                        <CartesianGrid strokeDasharray='1 1' />
                        <XAxis
                            label={{
                                value: 'Узнаваемость',
                                position: 'center',
                                dy: 20
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
                                dx: 20
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
                            shape={x => this.renderCompanyEntry(x)}
                            isAnimationActive={false}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </Loader>
        )
    }

    renderCompanyEntry(entry: CompanyEntry & { cx: number, cy: number }) {
        const { company, error, cx, cy } = entry

        const errorSize = error * cx / entry.knownLevel

        return (
            <g fill={KnownAndWantedPage.getFillColor(company)}>
                <g fillOpacity={0.1}>
                    <Dot cx={cx} cy={cy} r={errorSize} />
                </g>
                <Dot cx={cx} cy={cy} r={1.5} />
                <g transform={`translate(${cx},${cy})`}>
                    <text x={6} y={0} dy={-2} textAnchor='left' style={{ fontWeight: 600 }}>
                        {company}
                    </text>
                </g>
            </g>
        )
    }

    static getFillColor(company: string) {
        return companyFillColorMap[company] || defaultFillColor
    }

    renderLabel(company: string) {
        const parts = company.split(' ')
        return parts.join('\u00A0')
    }

    static calculateEntries(data: KnownAndWantedData): CompanyEntry[] {
        if (data === undefined) {
            return []
        }

        return Object
            .keys(data)
            .map(company => ({
                    company,
                    ...data[company]
                }))
    }

    static calculateList(entries: CompanyEntry[]): string[] {
        return entries.reduce((all: string[], current: CompanyEntry) => {
            if (all.indexOf(current.company) === -1) {
                all.push(current.company)
            }

            return all
        }, [])
    }
}

export default injectSheet(styles)(KnownAndWantedPage)
