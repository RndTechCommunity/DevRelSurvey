import { Fragment } from 'react'
import { Button, Divider } from 'rsuite'
import { countOf, MetaSourceKey, SurveyMeta, SurveyYear } from '../api/types'
import SampleTable from '../features/sample/SampleTable'
import { AsyncState, RequestState } from '../shared/AsyncState'
import { AboutNote, MethodologySection, OpenAbout } from './MethodologyPage'

type Note = { readonly section: MethodologySection, readonly text: string }

const MULTIPLE_ANSWERS: Note = {
    section: 'sample',
    text: 'Можно было выбрать несколько вариантов, поэтому сумма долей может превышать 100\u00A0%.'
}

const SECTIONS: readonly { readonly source: MetaSourceKey, readonly header: string, readonly note?: Note }[] = [
    {
        source: 'cities',
        header: 'Город',
        note: {
            section: 'sample',
            text: 'Сервер возвращает не больше 10 городов — с наибольшим числом участников группы в 2021 году; список неполный.'
        }
    },
    { source: 'ages', header: 'Возраст' },
    { source: 'education', header: 'Образование' },
    { source: 'professions', header: 'Профессия' },
    { source: 'languages', header: 'Язык программирования', note: MULTIPLE_ANSWERS },
    { source: 'levels', header: 'Грейд' },
    {
        source: 'isCommunity',
        header: 'Митапы или сообщество',
        note: { section: 'filters', text: '«Да» — посещает митапы или участвует в сообществе.' }
    },
    { source: 'communitySource', header: 'Откуда узнает о митапах', note: MULTIPLE_ANSWERS }
]

type Props = {
    meta: RequestState<SurveyMeta>,
    year: SurveyYear,
    compareYear: SurveyYear | null,
    onAbout: OpenAbout,
    onAllParticipants: () => void
}

export default function SamplePage({ meta, year, compareYear, onAbout, onAllParticipants }: Props) {
    return (
        <AsyncState
            state={meta}
            isEmpty={loaded => countOf(loaded.filtered, year) === 0 && (compareYear === null || countOf(loaded.filtered, compareYear) === 0)}
            empty={<>
                В выбранной группе нет респондентов за {compareYear === null ? `${year} год` : `${year} и ${compareYear} годы`}.{' '}
                <Button appearance='link' onClick={onAllParticipants}>Все участники</Button>
            </>}
        >
            {loaded => <>
                <AboutNote section='sample' onAbout={onAbout}>
                    Доли — от размера группы в выбранном году. 0 означает, что в этом году так никто не ответил,
                    в том числе если такого варианта не было в анкете.
                </AboutNote>
                {SECTIONS.map(({ source, header, note }, index) => (
                    <Fragment key={source}>
                        {index > 0 && <Divider />}
                        {note && <AboutNote section={note.section} onAbout={onAbout}>{note.text}</AboutNote>}
                        <SampleTable
                            filteredTotal={loaded.filtered}
                            total={loaded.total}
                            year={year}
                            compareYear={compareYear}
                            data={loaded.sources[source]}
                            header={header}
                        />
                    </Fragment>
                ))}
            </>}
        </AsyncState>
    )
}
