import { useRef, useState } from 'react'
import { CheckPicker, Input } from 'rsuite'
import { usePickerFocusReturn } from './usePickerFocusReturn'
import styles from './MultiSelect.module.css'

type Props = {
    options: readonly string[],
    value: readonly string[],
    placeholder: string,
    labelledBy?: string,
    getLabel?: (value: string) => string,
    preset?: { label: string, values: readonly string[] },
    onChange: (value: readonly string[]) => void
}

const ALL = -1
const PRESET = -2

// «Выбрать все» записывает явный список; смысл пустого списка задаёт владелец.
export default function MultiSelect({ options, value, placeholder, labelledBy, preset, getLabel = value => value, onChange }: Props) {
    const [query, setQuery] = useState('')
    const searchRef = useRef<HTMLInputElement>(null)
    const { ref, wrapperProps, pickerProps } = usePickerFocusReturn(() => searchRef.current?.focus({ preventScroll: true }))
    const choices = [...new Set([...options, ...value])]
    const allSelected = choices.length > 0 && choices.every(option => value.includes(option))
    const presetSelected = !!preset && value.length === preset.values.length
        && preset.values.every(option => value.includes(option))
    const items = choices.map((choice, index) => ({ value: index + 1, label: getLabel(choice) }))
    const selected = items.filter(item => value.includes(choices[item.value - 1])).map(item => item.value)
    const shown = items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))

    return (
        <div {...wrapperProps}>
            <CheckPicker
                ref={ref}
                {...pickerProps}
                data={[{ value: ALL, label: 'Выбрать все' },
                    ...(preset ? [{ value: PRESET, label: preset.label }] : []), ...shown]}
                placeholder={placeholder}
                aria-labelledby={labelledBy}
                block
                searchable={false}
                value={[...(allSelected ? [ALL] : []), ...(presetSelected ? [PRESET] : []), ...selected]}
                renderValue={() => presetSelected ? preset?.label : value.map(getLabel).join(', ')}
                onClose={() => {
                    pickerProps.onClose()
                    setQuery('')
                }}
                onChange={next => {
                    const nextAll = next.includes(ALL)
                    const nextPreset = next.includes(PRESET)
                    if (nextAll !== allSelected) onChange(nextAll ? choices : [])
                    else if (preset && nextPreset !== presetSelected) onChange(nextPreset ? preset.values : [])
                    else onChange(next.filter(index => index > 0).map(index => choices[index - 1]))
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
