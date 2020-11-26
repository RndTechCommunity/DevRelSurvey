import * as React from 'react'
import { FlexboxGrid } from 'rsuite';
import injectSheet from 'react-jss';

const styles = {
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        padding: '10px'
    },
    pageText: {
        fontFamily: 'Roboto, "JetBrains Mono"'
    }
}

type Props = {
    classes?: any,
}

class Partners extends React.Component<Props> {
    render() {
        const { classes } = this.props
        return (
            <FlexboxGrid justify='center'>
                <FlexboxGrid.Item colspan={12} className={classes.pageText}>
                    &nbsp;
                    <p>
                        Чем больше людей из местного ИТ-сообщества заполнят анкету, 
                        тем точнее будут данные в результатах и больше довермя к ним.
                    </p>
                    <p>
                        Вот список компаний и сообществ, которые помогали с распространением
                        опроса (в соц.сетях, рассылках и на сайтах):
                    </p>
                    <p><b>Ну, то есть, мы скоро сверстаем этот список :)</b></p>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        )
    }
}

export default injectSheet(styles)(Partners)
