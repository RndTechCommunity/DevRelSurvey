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
import { Checkbox, Loader, Tooltip, Whisper } from 'rsuite';

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
    'Спецвузавтоматика': '#237BE7',
    'uKit (uCoz)': '#338FFF',
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
    onUseErrorChanged: (filter: boolean) => void
}

type State = {
    isReady: boolean,
    companyEntries: CompanyEntry[]
    companies: { value: string; label: any; }[],
    maxWantedLevel: number,
    useError: boolean,
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
        useError: this.props.useError,
        selectedCompanies: this.props.selectedCompanies,
    }

    tooltip = (
        <Tooltip>
            Если эта опция включена, то для каждой компании отображается область,
            в которую <b>с 95% вероятностью попадает её узнаваемость и привлекательность</b>.
            Данные считаются по формуле доверительного интервала для генерального среднего.
        </Tooltip>
    );

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
        if (this.props.filter !== prevProps.filter || this.props.year !== prevProps.year) {
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
        filter.year = this.props.year
        return getKnownAndWantedData(filter)
            .then(data => {
                const companyEntries = KnownAndWantedPage.calculateEntries(data)
                const companies = KnownAndWantedPage.calculateList(companyEntries).sort().map(x => ({
                    value: x, label: x
                }))
                const maxWantedLevel = Math.max.apply(null, companyEntries.map(ce => ce.wantedLevel)) + 0.05;
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
        const { classes, onCompaniesChanged, onUseErrorChanged } = this.props
        const {
            isReady,
            companyEntries,
            companies,
            maxWantedLevel,
            selectedCompanies,
            useError
        } = this.state

        if (!isReady) {
            return (<Loader content='Загрузка данных' center />)
        }

        const entries = selectedCompanies.length > 0
            ? companyEntries.filter(x => selectedCompanies.indexOf(x.company) !== -1)
            : companyEntries

        const data = entries.map(x => ({
            ...x,
            label: this.renderLabel(x.company)
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
                        <Whisper placement='top' trigger='hover' speaker={this.tooltip}>
                            <Checkbox 
                                checked={useError} 
                                onChange={(v, ch, e) => {
                                    this.setState({useError: ch})
                                    onUseErrorChanged(ch)
                                }}
                            >
                                Отображать доверительный интервал
                            </Checkbox>
                        </Whisper>
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

    renderCompanyEntry(entry: CompanyEntry & { cx: number, cy: number }) {
        const { company, error, cx, cy } = entry

        const errorSize = (this.state.useError ? error : 0) * cx / entry.knownLevel

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
