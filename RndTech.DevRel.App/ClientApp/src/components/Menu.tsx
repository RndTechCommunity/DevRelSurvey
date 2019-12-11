import ExportIcon from '@skbkontur/react-icons/Export'
import FilterIcon from '@skbkontur/react-icons/Filter'
import Button from '@skbkontur/react-ui/components/Button/Button'
import Gapped from '@skbkontur/react-ui/components/Gapped/Gapped'
import Tabs from '@skbkontur/react-ui/components/Tabs/Tabs'
import * as React from 'react'
import injectSheet from 'react-jss'

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

type Props = {
    classes?: any,
    active: MenuId,
    onChange: (item: MenuId) => void,
    onShowFilters: () => void,
    onOpenDuplicate: () => void,
}

type MenuItem = {
    id: MenuId,
    title: string
}

export type MenuId =
    'known-and-wanted' |
    'selection-factors' |
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
    {
        id: 'selection-factors',
        title: 'Критерии выбора'
    }
]

class Menu extends React.Component<Props> {
    render() {
        const {
            classes,
            active,
            onChange,
            onShowFilters,
            onOpenDuplicate
        } = this.props

        return (
            <div className={classes.container}>
                <div className={classes.menu}>
                    <Tabs
                        value={active}
                        onChange={(_, active) => onChange(active as MenuId)}
                    >
                        {items.map(item => (
                            <Tabs.Tab key={item.id} id={item.id}>{item.title}</Tabs.Tab>
                        ))}
                    </Tabs>
                </div>
                <Gapped>
                    <Button
                        icon={<FilterIcon />}
                        onClick={onShowFilters}
                    >
                        Фильтровать
                    </Button>
                    <Button
                        icon={<ExportIcon />}
                        onClick={onOpenDuplicate}
                    >
                        Дублировать
                    </Button>
                </Gapped>
            </div>
        )
    }
}

export default injectSheet(styles)(Menu)
