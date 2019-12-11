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
    'Avito': 'rgb(163, 204, 74)'
}

type Props = {
    classes?: any,
    filter: Filter
}

type State = {
    isReady: boolean,
    isSingleCity: boolean,
    companyEntries: CompanyEntry[]
    companies: string[],
    selectedCompanies: string[]
}

type CompanyEntry = {
    city: string,
    company: string,
    isKnown: number,
    isWanted: number,
    isKnownRatio: number,
    isWantedRatio: number,
    error: number
}

class KnownAndWantedPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        isSingleCity: false,
        companyEntries: [],
        companies: [],
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
                const companies = KnownAndWantedPage.calculateList(companyEntries)

                this.setState({
                    isSingleCity: Object.keys(data).length === 1,
                    companyEntries,
                    companies
                })
            })
    }

    render() {
        const { classes } = this.props
        const {
            isReady,
            companyEntries,
            companies,
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
            label: this.renderLabel(x.company, x.city)
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
                            dataKey='isKnownRatio'
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
                            dataKey='isWantedRatio'
                            type='number'
                            domain={[0, 1]}
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
        const { company, city, error, cx, cy } = entry

        const errorSize = error * cx / entry.isKnownRatio

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
                    <text x={6} y={0} dy={10} textAnchor='left'>
                        {city}
                    </text>
                </g>
            </g>
        )
    }

    static getFillColor(company: string) {
        return companyFillColorMap[company] || defaultFillColor
    }

    renderLabel(company: string, city: string) {
        const { isSingleCity, selectedCompanies } = this.state

        const parts = company.split(' ')

        return isSingleCity
            ? parts.join('\u00A0')
            : selectedCompanies.length === 1
                ? city
                : [...parts, '×', city].join('\u00A0')
    }

    static calculateEntries(data: KnownAndWantedData): CompanyEntry[] {
        if (data === undefined) {
            return []
        }

        return Object
            .keys(data)
            .map(city => Object
                .keys(data[city])
                .map(company => ({
                    city,
                    company,
                    ...data[city][company]
                }))
            )
            .reduce((all, current) => [
                ...all,
                ...current
            ], [])
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
