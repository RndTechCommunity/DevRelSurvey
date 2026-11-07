import { Container, Content, CustomProvider, Message } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import { useMediaQuery } from 'react-responsive'
import Results from '../components/Results'
import ResultsMobile from '../components/ResultsMobile'
import { useSurveyState } from './useSurveyState'

export default function App() {
    const { state, warnings, update, duplicate, dismissWarning } = useSurveyState()
    const isDesktop = useMediaQuery({ minWidth: 1224 })

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
                        ? <Results state={state} update={update} onDuplicate={duplicate} />
                        : <ResultsMobile state={state} update={update} />}
                </Content>
            </Container>
        </CustomProvider>
    )
}
