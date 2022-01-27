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
import { getKnownAndWantedData, KnownAndWantedData } from '../../api'
import { toPercent } from '../../format'
import { Filter } from '../filters/Filter'
import MultiSelect from '../MultiSelect'
import injectSheet from 'react-jss';
import { Checkbox, Loader } from 'rsuite';

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
    onUseErrorChanged: (filter: boolean) => void
    onUseGoodChanged: (filter: boolean) => void
    onUseWantedChanged: (filter: boolean) => void
}

type State = {
    isReady: boolean,
    companyEntries: KnownAndWantedData[]
    companies: { value: string; label: any; }[],
    maxWantedLevel: number,
    useError: boolean,
    useGood: boolean,
    useWanted: boolean,
    selectedCompanies: string[]
}

class KnownAndWantedPage extends React.Component<Props, State> {
    state: State = {
        isReady: false,
        companyEntries: [],
        companies: [],
        maxWantedLevel: 0.3,
        useError: this.props.useError,
        useGood: this.props.useGood,
        useWanted: this.props.useWanted,
        selectedCompanies: this.props.selectedCompanies,
    }

    _isMounted = false

    componentDidMount() {
        this._isMounted = true;

        this.loadData(this.props.filter)
            .then(() => {
                    if (this._isMounted) {
                        this.setState({isReady: true})
                    }
                })
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.filter !== prevProps.filter 
            || this.props.year !== prevProps.year
            || this.props.useGood !== prevProps.useGood
            || this.props.useWanted !== prevProps.useWanted) {
            this.setState({ isReady: false })

            this.loadData(this.props.filter)
                .then(() => {
                    if (this._isMounted) {
                        this.setState({isReady: true})
                    }
                })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadData(filter: Filter) {
        return getKnownAndWantedData(filter)
            .then(data => {
                const companyEntries = data.filter(d => d.year === this.props.year)
                const companies = KnownAndWantedPage.calculateList(companyEntries).sort().map(x => ({
                    value: x, label: x
                }))
                const maxWantedLevel = Math.max.apply(null, 
                    companyEntries.map(ce => (this.state.useGood ? 1 : 0) * ce.goodLevel 
                        + (this.state.useWanted ? 1 : 0) * ce.wantedLevel)) + 0.05;

                if (this._isMounted) {
                    this.setState({
                        companyEntries,
                        companies,
                        maxWantedLevel
                    })
                }
            })
    }

    render() {
        const { classes, onCompaniesChanged, onUseErrorChanged, onUseGoodChanged, onUseWantedChanged } = this.props
        const {
            isReady,
            companyEntries,
            companies,
            maxWantedLevel,
            selectedCompanies,
            useError,
            useGood,
            useWanted
        } = this.state

        if (!isReady) {
            return (<Loader content='Загрузка данных' center />)
        }

        const entries = selectedCompanies.length > 0
            ? companyEntries.filter(x => selectedCompanies.indexOf(x.name) !== -1)
            : companyEntries

        const data = entries.map(x => ({
            knownLevel: x.knownLevel,
            wantedLevel: (useGood ? 1 : 0) * x.goodLevel + (useWanted ? 1 : 0) * x.wantedLevel,
            name: this.renderLabel(x.name)
        }))

        return (
            <div className={classes.container}>
                <div className={classes.companies}>
                    <div className={classes.graphicFilter}>
                        <div className={classes.graphicFilterCompanies}>
                            <label>Компании</label>
                        </div>
                        <MultiSelect
                            items={companies}
                            placeholder='Компании'
                            selected={selectedCompanies}
                            onChange={selectedCompanies => {
                                this.setState({selectedCompanies})
                                onCompaniesChanged(selectedCompanies)
                            }}
                        />
                            <Checkbox 
                                checked={useError} 
                                onChange={(v, ch) => {
                                    this.setState({useError: ch})
                                    onUseErrorChanged(ch)
                                }}
                            >
                                Отображать доверительный интервал
                            </Checkbox>
                            <Checkbox
                                checked={useGood}
                                onChange={(v, ch) => {
                                    this.setState({useGood: ch})
                                    onUseGoodChanged(ch)
                                }}
                            >
                                Знаю и рекомендую
                            </Checkbox>
                            <Checkbox
                                checked={useWanted}
                                onChange={(v, ch) => {
                                    this.setState({useWanted: ch})
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
                            shape={x => this.renderCompanyEntry(x)}
                            isAnimationActive={false}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        )
    }

    renderCompanyEntry(entry: KnownAndWantedData & { cx: number, cy: number }) {
        const { name, error, cx, cy } = entry

        const errorSize = (this.state.useError ? error : 0) * cx / entry.knownLevel

        return (
            <g fill={KnownAndWantedPage.getFillColor(name)}>
                <g fillOpacity={0.1}>
                    <Dot cx={cx} cy={cy} r={errorSize} />
                </g>
                <Dot cx={cx} cy={cy} r={1.5} />
                <g transform={`translate(${cx},${cy})`}>
                    <text x={6} y={0} dy={-2} textAnchor='left' style={{ fontWeight: 600 }}>
                        {name}
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

    static calculateList(entries: KnownAndWantedData[]): string[] {
        return entries.reduce((all: string[], current: KnownAndWantedData) => {
            if (all.indexOf(current.name) === -1) {
                all.push(current.name)
            }

            return all
        }, [])
    }
}

export default injectSheet(styles)(KnownAndWantedPage)
