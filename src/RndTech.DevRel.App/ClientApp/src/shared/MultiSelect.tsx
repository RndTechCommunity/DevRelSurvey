import { Checkbox, CheckPicker } from 'rsuite';

const footerStyles = {
    padding: '10px 2px',
    borderTop: '1px solid #e5e5e5'
};

type Props = {
    options: readonly string[],
    value: readonly string[],
    placeholder: string,
    onChange: (value: readonly string[]) => void
}

// «Выбрать все» записывает явный список значений; пустой список означает «все».
export default function MultiSelect({ options, value, placeholder, onChange }: Props) {
    const selectedCount = options.filter(option => value.includes(option)).length
    const allSelected = options.length > 0 && selectedCount === options.length

    return (
        <CheckPicker
            data={options.map(option => ({ value: option, label: option }))}
            placeholder={placeholder}
            style={{width: 224}}
            value={[...value]}
            onChange={onChange}
            renderExtraFooter={() => (
                <div style={footerStyles}>
                    <Checkbox
                        inline
                        indeterminate={selectedCount > 0 && !allSelected}
                        checked={allSelected}
                        onChange={(_, checked) => onChange(checked ? options : [])}
                    >
                        Выбрать все
                    </Checkbox>
                </div>
            )}
        />
    )
}
