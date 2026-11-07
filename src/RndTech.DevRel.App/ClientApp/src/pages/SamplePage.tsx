import { Fragment } from 'react'
import { Divider } from 'rsuite'
import { countOf, MetaSourceKey, SurveyMeta, SurveyYear } from '../api/types'
import SampleTable from '../features/sample/SampleTable'
import { AsyncState, RequestState } from '../shared/AsyncState'

const SECTIONS: readonly { readonly source: MetaSourceKey, readonly header: string }[] = [
    { source: 'cities', header: 'Город' },
    { source: 'ages', header: 'Возраст' },
    { source: 'education', header: 'Образование' },
    { source: 'professions', header: 'Профессия' },
    { source: 'languages', header: 'Язык программирования' },
    { source: 'levels', header: 'Грейд' },
    { source: 'isCommunity', header: 'Посещает митапы' },
    { source: 'communitySource', header: 'Откуда узнает о митапах' }
]

export default function SamplePage({ meta, year }: { meta: RequestState<SurveyMeta>, year: SurveyYear }) {
    return (
        <AsyncState
            state={meta}
            isEmpty={loaded => countOf(loaded.filtered, year) === 0}
            empty={`В выбранной группе нет респондентов за ${year} год.`}
        >
            {loaded => SECTIONS.map(({ source, header }, index) => (
                <Fragment key={source}>
                    {index > 0 && <Divider />}
                    <SampleTable
                        filteredTotal={loaded.filtered}
                        total={loaded.total}
                        year={year}
                        data={loaded.sources[source]}
                        header={header}
                    />
                </Fragment>
            ))}
        </AsyncState>
    )
}
