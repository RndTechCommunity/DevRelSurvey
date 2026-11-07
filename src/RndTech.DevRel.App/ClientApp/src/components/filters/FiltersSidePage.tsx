import MultiSelect from '../MultiSelect'
import { AGE_OPTIONS, FILTER_PRESETS, RespondentFilter, sameFilter } from '../../features/filters/model'
import { FilterOptions } from '../../api/types'
import { AsyncState, RequestState } from '../../shared/AsyncState'
import { Button, Nav, SelectPicker } from 'rsuite';
import { Split, Pin, TagFilter } from '@rsuite/icons';

type Props = {
    filter: RespondentFilter,
    options: RequestState<FilterOptions>,
    onSetFilter: (filter: RespondentFilter) => void,
    onOpenDuplicate: () => void,
}

const isCommunityOptions: { value: 'Да' | 'Нет', label: string }[] = [{ value: 'Да', label: 'Да' }, { value: 'Нет', label: 'Нет' }]

export default function FiltersSidePage({ filter, options, onSetFilter, onOpenDuplicate }: Props) {
    const change = (patch: Partial<RespondentFilter>) => onSetFilter({ ...filter, ...patch })

    return (
        <Nav>
            <Nav.Menu eventKey='1' open={true} title='Фильтры' icon={<TagFilter />}>
                <AsyncState state={options}>
                    {loaded => (
                        <>
                            <Nav.Item eventKey='1-1' as='span'>
                                <MultiSelect
                                    options={loaded.cities}
                                    placeholder='Город'
                                    value={filter.cities}
                                    onChange={cities => change({ cities })}
                                />
                            </Nav.Item>
                            <Nav.Item eventKey='1-2' as='span'>
                                <MultiSelect
                                    options={AGE_OPTIONS}
                                    value={filter.ages}
                                    placeholder='Возраст'
                                    onChange={ages => change({ ages })}
                                />
                            </Nav.Item>
                            <Nav.Item eventKey='1-3' as='span'>
                                <MultiSelect
                                    options={loaded.educations}
                                    value={filter.educations}
                                    placeholder='Образование'
                                    onChange={educations => change({ educations })}
                                />
                            </Nav.Item>
                            <Nav.Item eventKey='1-4' as='span'>
                                <MultiSelect
                                    options={loaded.experienceLevels}
                                    value={filter.experiences}
                                    placeholder='Опыт'
                                    onChange={experiences => change({ experiences })}
                                />
                            </Nav.Item>
                            <Nav.Item eventKey='1-5' as='span'>
                                <MultiSelect
                                    options={loaded.professions}
                                    value={filter.professions}
                                    placeholder='Профессия'
                                    onChange={professions => change({ professions })}
                                />
                            </Nav.Item>
                            <Nav.Item eventKey='1-6' as='span'>
                                <MultiSelect
                                    options={loaded.programmingLanguages}
                                    placeholder='Язык'
                                    value={filter.languages}
                                    onChange={languages => change({ languages })}
                                />
                            </Nav.Item>
                        </>
                    )}
                </AsyncState>
                <Nav.Item eventKey='1-7' as='span'>
                    <SelectPicker
                        block
                        data={isCommunityOptions}
                        placeholder='Посещает митапы'
                        value={filter.isCommunity}
                        onChange={isCommunity => change({ isCommunity })}
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
