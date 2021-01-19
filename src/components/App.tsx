import * as React from 'react'
import { Container, Content, Header, Icon, Nav, Navbar } from 'rsuite';
import injectSheet from 'react-jss';
import 'rsuite/lib/styles/themes/dark/index.less';
import 'rsuite/dist/styles/rsuite-dark.css';
import Results from './Results';
import Partners from './Partners';
import About from './About';

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
        const { classes } = this.props
        const { tab, modalOpened } = this.state

        let content =
             tab === 'page-results' ? <Results modalOpened={modalOpened} /> :
                tab === 'page-partners' ? <Partners /> :
                    tab === 'page-about' ? <About /> : null
        
        return (
            <Container className='App'>
                <Header className='App-header'>
                    <Navbar appearance='inverse'>
                        <Navbar.Header>
                            <img src={'rndtech-logo.png'} className={classes.barLogo} alt='logo' />
                        </Navbar.Header>
                        <Navbar.Body>
                            <Nav onSelect={(key) => this.setState({ tab: key, modalOpened: false })}>
                                <Nav.Item icon={<Icon icon='area-chart' />} eventKey='page-results'>
                                    Результаты
                                </Nav.Item>
                                <Nav.Item icon={<Icon icon='heart' />} eventKey='page-partners'>
                                    Друзья
                                </Nav.Item>
                                <Nav.Item icon={<Icon icon='file-text' />} eventKey='page-about'>
                                    О проекте
                                </Nav.Item>
                            </Nav>
                            <Nav pullRight>
                                <Nav.Item icon={<Icon icon='vk'/>} href='https://vk.com/rndtech' target='_blank' />
                                <Nav.Item 
                                    icon={<Icon icon='instagram'/>} 
                                    href='https://www.instagram.com/rndtechpro/' 
                                    target='_blank' 
                                />
                            </Nav>
                        </Navbar.Body>
                    </Navbar>
                </Header>
                <Content>
                    {content}
                </Content>
            </Container>
        )
    }
}

export default injectSheet(styles)(App)
