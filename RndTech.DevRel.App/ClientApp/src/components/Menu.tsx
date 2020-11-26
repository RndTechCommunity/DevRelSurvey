import * as React from 'react'
import injectSheet from 'react-jss';
import { Tabs } from '@skbkontur/react-ui';

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
    textDecoration: 'none'
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
    'known-and-wanted' |
    'data-meta'

const items: MenuItem[] = [
    {
        id: 'data-meta',
        title: 'Выборка данных'
    },
    {
        id: 'known-and-wanted',
        title: 'Узнаваемость и привлекательность'
    },
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
                    <Tabs
                        value={active}
                        onValueChange={active => onChange(active as MenuId)}
                    >
                        {items.map(item => (
                            <Tabs.Tab style={menuItemStyle} key={item.id} id={item.id}>{item.title}</Tabs.Tab>
                        ))}
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default injectSheet(styles)(Menu)
