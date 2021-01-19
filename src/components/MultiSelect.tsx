import * as React from 'react'
import injectSheet from 'react-jss';
import { Checkbox, CheckPicker } from 'rsuite';

const styles = {
    hidden: {
        opacity: 0
    }
}

const footerStyles = {
    padding: '10px 2px',
    borderTop: '1px solid #e5e5e5'
};

interface IProps {
    classes?: any,
    items?: MultiSelectItem[],
    fetch?: () => Promise<string[]>,
    selected: string[],
    placeholder: string,
    onChange: (selected: string[]) => void
}

interface IState {
    items: MultiSelectItem[],
    indeterminate: boolean,
    checkAll: boolean,
    value: string[]
}

interface MultiSelectItem {
    value: string; // property value is the value of valueKey 
    label: any; // property value is the vaue of labelKey
}

class MultiSelect extends React.Component<IProps, IState> {
    state: IState = {
        items: this.props.items || [],
        indeterminate: false,
        checkAll: false,
        value: this.props.selected
    }
    
    constructor(props: IProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheckAll = this.handleCheckAll.bind(this);
    }
    
    updateGroupCheckbox() {
        this.setState({
            indeterminate: this.state.value.length > 0 && this.state.value.length < this.state.items.length,
            checkAll: this.state.value.length === this.state.items.length
        })
    }
    
    handleChange(value: string[]) {
        this.setState({
            value,
            indeterminate: value.length > 0 && value.length < this.state.items.length,
            checkAll: value.length === this.state.items.length
        });
        this.props.onChange(value.map(x => x))
    }

    handleCheckAll(v: [], checked: boolean) {
        const nextValue = checked ? this.state.items.map(x => x.value) : [];
        this.setState({
            value: nextValue,
            indeterminate: false,
            checkAll: checked
        });
        this.props.onChange(nextValue.map(x => x))
    }

    componentDidMount() {
        const {fetch, selected} = this.props

        if (fetch !== undefined) {
            fetch().then(items => this.setState({
                items: items.filter(x => x !== '').map(x => ({
                    value: x, label: x
                } as MultiSelectItem))
            })).then(() => this.updateGroupCheckbox())
        }
        if (selected !== undefined) {
            this.setState({
                value: selected
            })
            this.updateGroupCheckbox()
        }

        this.updateGroupCheckbox()
    }

    render() {
        const { items, checkAll, indeterminate } = this.state

        return (
            <CheckPicker
                data={items}
                placeholder={this.props.placeholder}
                style={{width: 224}}
                value={this.props.selected}
                onChange={this.handleChange}
                renderExtraFooter={() => (
                    <div style={footerStyles}>
                        <Checkbox
                            inline
                            indeterminate={indeterminate}
                            checked={checkAll}
                            onChange={this.handleCheckAll}
                        >
                            Выбрать все
                        </Checkbox>
                    </div>
                )}
            />
        )
    }
}

export default injectSheet(styles)(MultiSelect)
