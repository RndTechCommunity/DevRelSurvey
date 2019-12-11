import OkIcon from '@skbkontur/react-icons/Ok'
import Gapped from '@skbkontur/react-ui/components/Gapped/Gapped'
import Select from '@skbkontur/react-ui/components/Select/Select'
import * as React from 'react'
import injectSheet from 'react-jss'
import classNames from 'classnames'
import { plural } from './Plural'

const styles = {
    hidden: {
        opacity: 0
    }
}

type Props = {
    classes?: any,
    items?: string[],
    fetch?: () => Promise<string[]>,
    selected?: string[],
    controls?: ControlItem[],
    onChange: (selected: string[]) => void
}

type State = {
    items: Item[],
    selected: Item[]
}

type Item = string | ControlItem

type ControlItem = {
    label: string,
    action: (items: Item[]) => Item[]
}

const controls = [{
    label: 'Выбрать всё',
    action: (items: Item[]) => items.filter(x => typeof x === 'string')
}, {
    label: 'Сбросить всё',
    action: (items: Item[]) => []
}]

class MultiSelect extends React.Component<Props, State> {
    state: State = {
        items: this.props.items || [],
        selected: []
    }

    componentDidMount() {
        const { fetch } = this.props

        if (fetch !== undefined) {
            fetch().then(items => this.setState({
                items: items.filter(x => x !== '')
            }))
        }
    }

    static getDerivedStateFromProps(props: Props) {
        return {
            selected: props.selected || []
        }
    }

    render() {
        const { items, selected } = this.state

        const itemsAndControls = [
            ...controls,
            Select.SEP(),
            ...(this.props.controls !== undefined ? this.props.controls : []),
            ...(this.props.controls !== undefined ? [Select.SEP()] : []),
            ...items
        ]

        return (
            <Select
                items={itemsAndControls}
                value={MultiSelect.createSelectedItem(selected)}
                renderItem={(x: Item) => this.renderItem(x)}
                renderValue={(x: Item) => MultiSelect.renderValue(x)}
                onChange={(_: any, x: Item) => this.toggleItem(x)}
                maxMenuHeight={500}
            />
        )
    }

    static createSelectedItem(selected: Item[]): Item {
        if (selected === undefined) {
            return '—'
        }

        switch (selected.length) {
            case 0:
                return '—'
            case 1:
                return selected[0]
            default:
                return `${selected.length} ${plural(selected.length, 'вариант', 'варианта', 'вариантов')}`
        }
    }

    notify(selected: Item[]) {
        this.props.onChange(selected.filter(x => isRegularItem(x)).map(x => x.toString()))
    }

    toggleItem(item: Item) {
        const { items, selected } = this.state

        if (isControlItem(item)) {
            const state = {
                items,
                selected: item.action(items)
            }

            this.notify(state.selected)
            this.setState(state)
        }
        else {
            if (selected.some(x => x === item)) {
                const items = selected.filter(x => x !== item)

                this.notify(items)
                this.setState({ selected: items })
            }
            else {
                const items = [
                    ...selected,
                    item
                ].sort()

                this.notify(items)
                this.setState({ selected: items })
            }
        }
    }

    renderItem(item: Item): string | JSX.Element {
        return isControlItem(item)
            ? item.label
            : this.renderRegularItem(item)
    }

    renderRegularItem(item: string): JSX.Element {
        const { classes } = this.props
        const { selected } = this.state

        const iconClasses = classNames({
            [classes.hidden]: selected.every(x => !isControlItem(x) && x !== item)
        })

        return (
            <Gapped>
                <span className={iconClasses}><OkIcon /></span>
                {item}
            </Gapped>
        )
    }

    static renderValue(value: Item): string {
        return isControlItem(value)
            ? value.label
            : value
    }
}

function isRegularItem(item: Item): item is string {
    return typeof item === 'string'
}

function isControlItem(item: Item): item is ControlItem {
    return typeof item !== 'string'
}

export default injectSheet(styles)(MultiSelect)
