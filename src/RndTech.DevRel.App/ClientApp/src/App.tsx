import * as React from 'react'
import { Container, Content, CustomProvider } from 'rsuite';
import injectSheet from 'react-jss';
import 'rsuite/dist/rsuite.min.css';
import Results from './components/Results';

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

function App(props: Props) {
  const [tab, setTab] = React.useState<string>('page-results')
  const [isModalOpened, setIsModalOpened] = React.useState<boolean>(true)

  return (
      <CustomProvider theme='dark'>
        <Container className='App'>
          <Content>
            <Results modalOpened={false} />
          </Content>
        </Container>
      </CustomProvider>
  )
}

export default injectSheet(styles)(App)
