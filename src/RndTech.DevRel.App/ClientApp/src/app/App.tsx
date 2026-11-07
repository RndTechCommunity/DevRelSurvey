import { Container, Content, CustomProvider, Message } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import { useMediaQuery } from 'react-responsive'
import Results from '../components/Results'
import ResultsMobile from '../components/ResultsMobile'
import { useFilterOptions, useSurveyData } from './useSurveyData'
import { useSurveyState } from './useSurveyState'

export default function App() {
    const { state, warnings, update, duplicate, dismissWarning } = useSurveyState()
    const { companies, meta } = useSurveyData(state.filter)
    const options = useFilterOptions()
    const isDesktop = useMediaQuery({ minWidth: 1224 })
    const data = { companies, meta, options }

    return (
        <CustomProvider theme='dark'>
            <Container className='App'>
                <Content>
                    {warnings.map(warning => (
                        <Message key={warning} type='warning' showIcon closable duration={0} onClose={() => dismissWarning(warning)}>
                            {warning}
                        </Message>
                    ))}
                    {isDesktop
                        ? <Results state={state} update={update} onDuplicate={duplicate} {...data} />
                        : <ResultsMobile state={state} update={update} {...data} />}
                </Content>
            </Container>
        </CustomProvider>
    )
}
