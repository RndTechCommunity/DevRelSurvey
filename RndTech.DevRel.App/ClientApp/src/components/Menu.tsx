import * as React from 'react'
import injectSheet from 'react-jss';
import { Nav } from 'rsuite';

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

export type MenuId =
    'known-and-wanted-2020' |
    'known-and-wanted-2019' |
    'data-meta'

const items: MenuItem[] = [
    {
        id: 'known-and-wanted-2020',
        title: 'Узнаваемость и привлекательность 2020'
    },
    {
        id: 'known-and-wanted-2019',
        title: 'Узнаваемость и привлекательность 2019'
    },
    {
        id: 'data-meta',
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
                    <Nav activeKey={active} onSelect={(active: MenuId) => onChange(active)} appearance='subtle'>
                        {items.map(item => (
                            <Nav.Item 
                                style={menuItemStyle} 
                                eventKey={item.id}
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
