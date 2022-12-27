import * as React from 'react'
import { Container, Content, CustomProvider } from 'rsuite';
import injectSheet from 'react-jss';
import 'rsuite/dist/rsuite.min.css';
import Results from './components/Results';
import ResultsMobile from './components/ResultsMobile';
import { useMediaQuery } from 'react-responsive'

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
  const [isModalOpened, setIsModalOpened] = React.useState<boolean>(true)
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' })

  return (

      <CustomProvider theme='dark'>
        <Container className='App'>
          <Content>
            { isDesktopOrLaptop && <Results modalOpened={false} /> }
            { isTabletOrMobile && <ResultsMobile /> }
          </Content>
        </Container>
      </CustomProvider>
  )
}

export default injectSheet(styles)(App)
