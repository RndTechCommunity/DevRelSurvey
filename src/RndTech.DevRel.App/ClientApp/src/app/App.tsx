import { Content, CustomProvider, Message } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import { ruRU } from 'rsuite/locales'
import '../shared/styles/tokens.css'
import { useMediaQuery } from 'react-responsive'
import MobileSummary from '../pages/MobileSummary'
import AppLayout from './AppLayout'
import { useFilterOptions, useSurveyData } from './useSurveyData'
import { useSurveyState } from './useSurveyState'

// В ruRU 6.2.5 подписи кнопки очистки — «Удалять» и «Прозрачный».
const locale = { ...ruRU, common: { ...ruRU.common, remove: 'Удалить', clear: 'Очистить' } }

export default function App() {
    const { state, warnings, update, duplicate, dismissWarning } = useSurveyState()
    const { companies, meta } = useSurveyData(state.filter)
    const options = useFilterOptions()
    const isDesktop = useMediaQuery({ minWidth: 1224 })
    const data = { companies, meta, options }

    return (
        <CustomProvider theme='dark' locale={locale}>
            {warnings.map(warning => (
                <Message key={warning} type='warning' showIcon closable duration={0} onClose={() => dismissWarning(warning)}>
                    {warning}
                </Message>
            ))}
            {/* AppLayout сам размечает шапку, панель фильтров и main; у мобильной сводки main — Content. */}
            {isDesktop
                ? <AppLayout state={state} update={update} onDuplicate={duplicate} {...data} />
                : <Content><MobileSummary state={state} update={update} {...data} /></Content>}
        </CustomProvider>
    )
}
