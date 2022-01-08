import * as React from 'react'
import { Container, Content } from 'rsuite';
import injectSheet from 'react-jss';
import 'rsuite/lib/styles/themes/dark/index.less';
import 'rsuite/dist/styles/rsuite-dark.css';
import Results from './Results';

const styles = {
    barLogo: {
        maxWidth: '100%',
        maxHeight: '100%',
        padding: '10px'
    }
}

export type SitePageId =
    'page-results' |
    'page-partners' |
    'page-about'

type Props = {
    classes?: any
}

type State = {
    tab: SitePageId,
    modalOpened: boolean
}

class App extends React.Component<Props, State> {
    state: State = {
        tab: 'page-results',
        modalOpened: true
    }
    
    render() {
        return (
            <Container className='App'>
                <Content>
                    <Results modalOpened={false} />
                </Content>
            </Container>
        )
    }
}

export default injectSheet(styles)(App)
