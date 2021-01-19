import * as React from 'react'
import injectSheet from 'react-jss';
import {
    getAges,
    getCities,
    getEducations,
    getExperienceLevels,
    getProfessions,
    getProgrammingLanguages
} from '../../api'
import MultiSelect from '../MultiSelect'
import {
    topRostovFilter,
    topTaganrogFilter,
    topQAFilter,
    topFrontendFilter,
    topStudentsFilter,
    Filter,
} from './Filter'
import { Button, Dropdown, Icon, Nav, SelectPicker } from 'rsuite';

const styles = {
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        lineHeight: '32px'
    },
    sideBar: {
        maxWidth: '300px',
        display: 'inline-block',
        background: 'rgb(65, 70, 78)'
    },
}

type Props = {
    classes?: any,
    filter: Filter,
    onSetFilter: (filter: Filter) => void,
    onOpenDuplicate: () => void,
}

type State = Filter

class FiltersSidePage extends React.Component<Props, State> {
    state = this.props.filter
    isCommunityDataSource = [{ value: 'Да', label: 'Да' }, { value: 'Нет', label: 'Нет' }]

    notify(state: State) {
        this.props.onSetFilter(state)
    }

    reset(newFilter: any) {
        console.log(this.state)
        this.notify(newFilter)
        this.setState(newFilter)
    }

    render() {
        const { onOpenDuplicate } = this.props

        return (             
            <Nav>
                <Dropdown eventKey='1' open={true} title='Фильтры' icon={<Icon icon='filter' />}>
                <Nav.Item eventKey='1-1' componentClass='span'>
                            <MultiSelect
                                fetch={getCities}
                                placeholder='Город'
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
                </Nav.Item>
                <Nav.Item eventKey='1-2' componentClass='span'>
                            <MultiSelect
                                fetch={getAges}
                                selected={this.state.ages}
                                placeholder='Возраст'
                                onChange={ages => {
                                    const state = {
                                        ...this.state,
                                        ages
                                    }

                                    this.notify(state)
                                    this.setState({ ages })
                                }}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-3' componentClass='span'>
                            <MultiSelect
                                fetch={getEducations}
                                selected={this.state.educations}
                                placeholder='Образование'
                                onChange={educations => {
                                    const state = {
                                        ...this.state,
                                        educations
                                    }

                                    this.notify(state)
                                    this.setState({ educations })
                                }}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-4' componentClass='span'>
                            <MultiSelect
                                fetch={getExperienceLevels}
                                selected={this.state.experiences}
                                placeholder='Опыт'
                                onChange={experiences => {
                                    const state = {
                                        ...this.state,
                                        experiences
                                    }

                                    this.notify(state)
                                    this.setState({ experiences })
                                }}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-5' componentClass='span'>
                            <MultiSelect
                                fetch={getProfessions}
                                selected={this.state.professions}
                                placeholder='Профессия'
                                onChange={professions => {
                                    const state = {
                                        ...this.state,
                                        professions
                                    }

                                    this.notify(state)
                                    this.setState({ professions })
                                }}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-6' componentClass='span'>
                            <MultiSelect
                                fetch={getProgrammingLanguages}
                                placeholder='Язык'
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
                </Nav.Item>
                <Nav.Item eventKey='1-7' componentClass='span'>
                            <SelectPicker 
                                block
                                data={this.isCommunityDataSource}
                                placeholder='Посещает митапы'
                                value={this.state.isCommunity}
                                onChange={isCommunity => {
                                    const state = {
                                        ...this.state,
                                        isCommunity
                                    }

                                    this.notify(state)
                                    this.setState({ isCommunity })
                                }}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-8' componentClass='span'>
                    <Button appearance='link' onClick={onOpenDuplicate}>
                        <Icon icon='copy-o' />
                        Дублировать
                    </Button>
                </Nav.Item>
                </Dropdown>
                <Dropdown eventKey='2' open={true} title='Популярные фильтры' icon={<Icon icon='fire' />}>
                    <Dropdown.Item>
                        <Button
                            appearance='link'
                            disabled={FiltersSidePage.IsEqualFilters(this.state, topRostovFilter)}
                            onClick={() => this.reset(topRostovFilter)}
                        >
                            Топ Ростова
                        </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <Button
                            appearance='link'
                            disabled={FiltersSidePage.IsEqualFilters(this.state, topTaganrogFilter)}
                            onClick={() => this.reset(topTaganrogFilter)}
                        >
                            Топ Таганрога
                        </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <Button
                            appearance='link'
                            disabled={FiltersSidePage.IsEqualFilters(this.state, topQAFilter)}
                            onClick={() => this.reset(topQAFilter)}
                        >
                            Какие компании знают QA
                        </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <Button
                            appearance='link'
                            disabled={FiltersSidePage.IsEqualFilters(this.state, topFrontendFilter)}
                            onClick={() => this.reset(topFrontendFilter)}
                        >
                            Куда хотят фронтендеры
                        </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <Button
                            appearance='link'
                            disabled={FiltersSidePage.IsEqualFilters(this.state, topStudentsFilter)}
                            onClick={() => this.reset(topStudentsFilter)}
                        >
                            Известные студентам
                        </Button>
                    </Dropdown.Item>
                </Dropdown>
            </Nav>
        )
    }

    private static IsEqualFilters(currentFilter: Filter, hotFilter: Filter) {
        return currentFilter.isCommunity == hotFilter.isCommunity
            && currentFilter.ages == hotFilter.ages
            && currentFilter.cities == hotFilter.cities
            && currentFilter.educations == hotFilter.educations
            && currentFilter.experiences == hotFilter.experiences
            && currentFilter.languages == hotFilter.languages
            && currentFilter.professions == hotFilter.professions;
    }
}

export default injectSheet(styles)(FiltersSidePage)
