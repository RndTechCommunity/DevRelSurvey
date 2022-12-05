import * as React from 'react'
import injectSheet from 'react-jss';
import { Checkbox, CheckPicker } from 'rsuite';
import { useEffect } from 'react';

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

interface MultiSelectItem {
    value: string; // property value is the value of valueKey 
    label: any; // property value is the vaue of labelKey
}

export function MultiSelect(props: IProps) {
    const [items, setItems] = React.useState<MultiSelectItem[]>(props.items || []);
    const [indeterminate, setIndeterminate] = React.useState<boolean>(false);
    const [checkAll, setCheckAll] = React.useState<boolean>(false);
    const [value, setValue] = React.useState<string[]>(props.selected);

    const updateGroupCheckbox = () => {
        setIndeterminate(value.length > 0 && value.length < items.length)
        setCheckAll(value.length === items.length)
    }

    const handleChange = (value: string[]) => {
        setValue(value)
        setIndeterminate(value.length > 0 && value.length < items.length)
        setCheckAll(value.length === items.length)

        props.onChange(value.map(x => x))
    }
    
    useEffect(() => {
        const {fetch, selected, items} = props

        if (fetch !== undefined) {
            fetch().then(items => setItems(
                items.filter(x => x !== '').map(x => ({
                    value: x, label: x
                } as MultiSelectItem))
            )).then(() => updateGroupCheckbox())
        }
        if (items !== undefined) {
            setItems(items)
        }
        if (selected !== undefined) {
            setValue(selected)
        }

        updateGroupCheckbox()
    }, [props.items, props.selected, props.fetch])

    return (
        <CheckPicker
            data={items}
            placeholder={props.placeholder}
            style={{width: 224}}
            value={props.selected}
            onChange={handleChange}
            renderExtraFooter={() => (
                <div style={footerStyles}>
                    <Checkbox
                        inline
                        indeterminate={indeterminate}
                        checked={checkAll}
                        onChange={(value1, checked) => {
                            const nextValue = checked ? items.map(x => x.value) : [];
                            setValue(nextValue)
                            setIndeterminate(false)
                            setCheckAll(checked)
                            props.onChange(nextValue.map(x => x))
                        }}
                    >
                        Выбрать все
                    </Checkbox>
                </div>
            )}
        />
    )
}

export default injectSheet(styles)(MultiSelect)
