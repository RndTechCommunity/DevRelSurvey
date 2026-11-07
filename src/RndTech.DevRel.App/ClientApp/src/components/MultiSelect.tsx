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
    selected: readonly string[],
    placeholder: string,
    onChange: (selected: readonly string[]) => void
}

interface MultiSelectItem {
    value: string; // property value is the value of valueKey 
    label: any; // property value is the vaue of labelKey
}

export function MultiSelect(props: IProps) {
    const [items, setItems] = React.useState<MultiSelectItem[]>(props.items || []);

    useEffect(() => {
        const {fetch, items} = props

        if (fetch !== undefined) {
            fetch().then(items => setItems(
                items.filter(x => x !== '').map(x => ({
                    value: x, label: x
                } as MultiSelectItem))
            ))
        }
        if (items !== undefined) {
            setItems(items)
        }
    }, [props.items, props.selected, props.fetch])

    const selectedCount = items.filter(item => props.selected.includes(item.value)).length
    const checkAll = items.length > 0 && selectedCount === items.length

    return (
        <CheckPicker
            data={items}
            placeholder={props.placeholder}
            style={{width: 224}}
            value={[...props.selected]}
            onChange={props.onChange}
            renderExtraFooter={() => (
                <div style={footerStyles}>
                    <Checkbox
                        inline
                        indeterminate={selectedCount > 0 && !checkAll}
                        checked={checkAll}
                        onChange={(value1, checked) => props.onChange(checked ? items.map(x => x.value) : [])}
                    >
                        Выбрать все
                    </Checkbox>
                </div>
            )}
        />
    )
}

export default injectSheet(styles)(MultiSelect)
