import { KeyboardEvent, useRef } from 'react'
import type { PickerHandle } from 'rsuite'

// RSuite 6 переводит фокус на пункт открытого списка и после Escape или Tab не возвращает его в поле.
// wrapperProps — для обёртки пикера: нажатия в списке доходят до неё по дереву React, а display: contents
// не меняет раскладку.
export function usePickerFocusReturn() {
    const ref = useRef<PickerHandle>()
    const wrapperProps = {
        style: { display: 'contents' },
        onKeyDown: (event: KeyboardEvent) => {
            if (event.key === 'Escape' || event.key === 'Tab') {
                ref.current?.target?.focus()
            }
        }
    }
    return { ref, wrapperProps }
}
