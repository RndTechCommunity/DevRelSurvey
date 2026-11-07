import * as React from 'react'
import injectSheet from 'react-jss';
import { Nav } from 'rsuite';
import { SURVEY_YEARS, SurveyYear } from '../api/types';

const styles = {
    container: {
        display: 'flex',
        padding: '40px 50px 0'
    },
    menu: {
        flexGrow: 1,
        marginTop: -4
    }
}

const menuItemStyle = {
};

type Props = {
    classes?: any,
    active: MenuId,
    onChange: (item: MenuId) => void,
}

type MenuItem = {
    id: MenuId,
    title: string
}

export type MenuId = SurveyYear | 'sample'

const items: MenuItem[] = [
    ...[...SURVEY_YEARS].reverse().map(year => ({ id: year, title: String(year) })),
    {
        id: 'sample',
        title: 'Состав выборки'
    }
]

class Menu extends React.Component<Props> {
    render() {
        const {
            classes,
            active,
            onChange,
        } = this.props

        return (
            <div className={classes.container}>
                <div className={classes.menu}>
                    <Nav
                        activeKey={String(active)}
                        onSelect={(key: string) => onChange(SURVEY_YEARS.find(year => String(year) === key) ?? 'sample')}
                        appearance='subtle'
                    >
                        {items.map(item => (
                            <Nav.Item 
                                style={menuItemStyle} 
                                eventKey={String(item.id)}
                                key={item.id}
                            >
                                {item.title}
                            </Nav.Item>
                        ))}
                    </Nav>
                </div>
            </div>
        )
    }
}

export default injectSheet(styles)(Menu)
