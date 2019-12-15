import Button from '@skbkontur/react-ui/components/Button/Button'
import Gapped from '@skbkontur/react-ui/components/Gapped/Gapped'
import Switcher from '@skbkontur/react-ui/components/Switcher/Switcher'
import SidePage from '@skbkontur/react-ui/components/SidePage/SidePage'
import * as React from 'react'
import injectSheet from 'react-jss'
import {
    getAges,
    getCities,
    // getCommunitySources,
    getEducations,
    // getCompanySources,
    getExperienceLevels,
    getProfessions,
    getProgrammingLanguages
} from '../../api'
import MultiSelect from '../MultiSelect'
import {
    defaultFilter,
    Filter,
} from './Filter'

const styles = {
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        lineHeight: '32px'
    }
}

type Props = {
    classes?: any,
    filter: Filter,
    onSetFilter: (filter: Filter) => void,
    onClose: () => void
}

type State = Filter

class FiltersSidePage extends React.Component<Props, State> {
    state = this.props.filter

    notify(state: State) {
        this.props.onSetFilter(state)
    }

    reset() {
        this.notify(defaultFilter)
        this.setState(defaultFilter)
    }

    render() {
        const { classes, onClose } = this.props

        return (
            <SidePage onClose={onClose}>
                <SidePage.Header>Выборка данных</SidePage.Header>
                <SidePage.Body>
                    <SidePage.Container>
                        <Gapped vertical={true}>
                            {/* Город */}
                            <div className={classes.row}>
                                <span>Город</span>
                                <MultiSelect
                                    fetch={getCities}
                                    selected={this.state.cities}
                                    onChange={cities => {
                                        const state = {
                                            ...this.state,
                                            cities
                                        }

                                        this.notify(state)
                                        this.setState({ cities })
                                    }}
                                />
                            </div>
                            {/* Возраст */}
                            <div className={classes.row}>
                                <span>Возраст</span>
                                <MultiSelect
                                    fetch={getAges}
                                    selected={this.state.ages}
                                    onChange={ages => {
                                        const state = {
                                            ...this.state,
                                            ages
                                        }

                                        this.notify(state)
                                        this.setState({ ages })
                                    }}
                                />
                            </div>
                            {/* Образование */}
                            <div className={classes.row}>
                                <span>Образование</span>
                                <MultiSelect
                                    fetch={getEducations}
                                    selected={this.state.educations}
                                    onChange={educations => {
                                        const state = {
                                            ...this.state,
                                            educations
                                        }

                                        this.notify(state)
                                        this.setState({ educations })
                                    }}
                                />
                            </div>
                            {/* СТАЖ НЕ РЕАЛИЗОВАН */}
                            {/* Уровень */}
                            <div className={classes.row}>
                                <span>Уровень</span>
                                <MultiSelect
                                    fetch={getExperienceLevels}
                                    selected={this.state.experiences}
                                    onChange={experiences => {
                                        const state = {
                                            ...this.state,
                                            experiences
                                        }

                                        this.notify(state)
                                        this.setState({ experiences })
                                    }}
                                />
                            </div>
                            {/* Профессия */}
                            <div className={classes.row}>
                                <span>Профессия</span>
                                <MultiSelect
                                    fetch={getProfessions}
                                    selected={this.state.professions}
                                    onChange={professions => {
                                        const state = {
                                            ...this.state,
                                            professions
                                        }

                                        this.notify(state)
                                        this.setState({ professions })
                                    }}
                                />
                            </div>
                            {/* Язык */}
                            <div className={classes.row}>
                                <span>Язык</span>
                                <MultiSelect
                                    fetch={getProgrammingLanguages}
                                    selected={this.state.languages}
                                    onChange={languages => {
                                        const state = {
                                            ...this.state,
                                            languages
                                        }

                                        this.notify(state)
                                        this.setState({ languages })
                                    }}
                                />
                            </div>
                            {/* Ходит ли на митапы */}
                            <div className={classes.row}>
                                <span>Посещает митапы</span>
                                <Switcher
                                    label=''
                                    items={['Да', 'Нет', 'Неважно']}
                                    value={this.state.isCommunity}
                                    onChange={(_, isCommunity) => {
                                        const state = {
                                            ...this.state,
                                            isCommunity
                                        }

                                        this.notify(state)
                                        this.setState({ isCommunity })
                                    }}
                                />
                            </div>
                        </Gapped>
                    </SidePage.Container>
                </SidePage.Body>
                <SidePage.Footer>
                    <Button
                        disabled={JSON.stringify(this.state) === JSON.stringify(defaultFilter)}
                        onClick={() => this.reset()}
                    >
                        Сбросить
                    </Button>
                </SidePage.Footer>
            </SidePage>
        )
    }
}

export default injectSheet(styles)(FiltersSidePage)
