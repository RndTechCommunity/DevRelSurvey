import * as React from 'react'
import injectSheet from 'react-jss';
import {
    getCities,
    getEducations,
    getExperienceLevels,
    getProfessions,
    getProgrammingLanguages
} from '../../api/client'
import MultiSelect from '../MultiSelect'
import { AGE_OPTIONS, FILTER_PRESETS, RespondentFilter, sameFilter } from '../../features/filters/model'
import { Button, Nav, SelectPicker } from 'rsuite';
import { Split, Pin, TagFilter } from '@rsuite/icons';

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
    filter: RespondentFilter,
    onSetFilter: (filter: RespondentFilter) => void,
    onOpenDuplicate: () => void,
}

const ageItems = AGE_OPTIONS.map(x => ({ value: x, label: x }))

class FiltersSidePage extends React.Component<Props> {
    isCommunityDataSource: { value: 'Да' | 'Нет', label: string }[] = [{ value: 'Да', label: 'Да' }, { value: 'Нет', label: 'Нет' }]

    change(patch: Partial<RespondentFilter>) {
        this.props.onSetFilter({ ...this.props.filter, ...patch })
    }

    render() {
        const { filter, onOpenDuplicate, onSetFilter } = this.props

        return (             
            <Nav>
                <Nav.Menu eventKey='1' open={true} title='Фильтры' icon={<TagFilter />}>

                <Nav.Item eventKey='1-1' as='span'>
                            <MultiSelect
                                fetch={getCities}
                                placeholder='Город'
                                selected={filter.cities}
                                onChange={cities => this.change({ cities })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-2' as='span'>
                            <MultiSelect
                                items={ageItems}
                                selected={filter.ages}
                                placeholder='Возраст'
                                onChange={ages => this.change({ ages })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-3' as='span'>
                            <MultiSelect
                                fetch={getEducations}
                                selected={filter.educations}
                                placeholder='Образование'
                                onChange={educations => this.change({ educations })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-4' as='span'>
                            <MultiSelect
                                fetch={getExperienceLevels}
                                selected={filter.experiences}
                                placeholder='Опыт'
                                onChange={experiences => this.change({ experiences })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-5' as='span'>
                            <MultiSelect
                                fetch={getProfessions}
                                selected={filter.professions}
                                placeholder='Профессия'
                                onChange={professions => this.change({ professions })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-6' as='span'>
                            <MultiSelect
                                fetch={getProgrammingLanguages}
                                placeholder='Язык'
                                selected={filter.languages}
                                onChange={languages => this.change({ languages })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-7' as='span'>
                            <SelectPicker 
                                block
                                data={this.isCommunityDataSource}
                                placeholder='Посещает митапы'
                                value={filter.isCommunity}
                                onChange={isCommunity => this.change({ isCommunity })}
                            />
                </Nav.Item>
                <Nav.Item eventKey='1-8' as='span'>
                    <Button appearance='link' onClick={onOpenDuplicate}>
                        <Split />&nbsp;
                        Дублировать
                    </Button>
                </Nav.Item>
                </Nav.Menu>
                <Nav.Menu eventKey='2' open={true} title='Популярные фильтры' icon={<Pin />}>
                    {FILTER_PRESETS.map(preset => (
                        <Nav.Item key={preset.label}>
                            <Button
                                appearance='link'
                                disabled={sameFilter(filter, preset.filter)}
                                onClick={() => onSetFilter(preset.filter)}
                            >
                                {preset.label}
                            </Button>
                        </Nav.Item>
                    ))}
                </Nav.Menu>
            </Nav>
        )
    }
}

export default injectSheet(styles)(FiltersSidePage)
