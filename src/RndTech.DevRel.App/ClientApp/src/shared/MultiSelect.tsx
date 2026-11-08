import { useRef, useState } from 'react'
import { CheckPicker, Input } from 'rsuite'
import { usePickerFocusReturn } from './usePickerFocusReturn'
import styles from './MultiSelect.module.css'

type Props = {
    options: readonly string[],
    value: readonly string[],
    placeholder: string,
    labelledBy?: string,
    onChange: (value: readonly string[]) => void
}

const ALL = -1

// «Выбрать все» записывает явный список значений; пустой список означает «все».
export default function MultiSelect({ options, value, placeholder, labelledBy, onChange }: Props) {
    const [query, setQuery] = useState('')
    const searchRef = useRef<HTMLInputElement>(null)
    const { ref, wrapperProps, pickerProps } = usePickerFocusReturn(() => searchRef.current?.focus({ preventScroll: true }))
    const choices = [...new Set([...options, ...value])]
    const allSelected = choices.length > 0 && choices.every(option => value.includes(option))
    const items = choices.map((label, index) => ({ value: index + 1, label }))
    const selected = items.filter(item => value.includes(item.label)).map(item => item.value)
    const shown = items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))

    return (
        <div {...wrapperProps}>
            <CheckPicker
                ref={ref}
                {...pickerProps}
                data={[{ value: ALL, label: 'Выбрать все' }, ...shown]}
                placeholder={placeholder}
                aria-labelledby={labelledBy}
                block
                searchable={false}
                value={allSelected ? [ALL, ...selected] : selected}
                renderValue={() => value.join(', ')}
                onClose={() => {
                    pickerProps.onClose()
                    setQuery('')
                }}
                onChange={next => {
                    const nextAll = next.includes(ALL)
                    onChange(nextAll !== allSelected
                        ? (nextAll ? choices : [])
                        : next.filter(index => index !== ALL).map(index => choices[index - 1]))
                }}
                renderListbox={listbox => (
                    <>
                        <div className={styles.search}>
                            <Input
                                ref={searchRef}
                                aria-label='Поиск'
                                placeholder='Поиск'
                                value={query}
                                onChange={setQuery}
                                onKeyDown={event => {
                                    if (event.key === 'Backspace' || event.key === 'Enter') event.stopPropagation()
                                }}
                            />
                        </div>
                        {listbox}
                    </>
                )}
            />
        </div>
    )
}
