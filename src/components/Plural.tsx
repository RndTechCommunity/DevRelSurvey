import * as React from 'react'

interface Plural {
    n: number,
    one: string,
    few: string,
    many: string,
    other?: string
}

type Props = Plural

export function chooseVariant(n: number): string {
    let i = Math.floor(Math.abs(n)),
        v = n.toString().replace(/^[^.]*\.?/, '').length

    n = Math.floor(n)

    if (v === 0 && i % 10 === 1 && i % 100 !== 11) {
        return 'one'
    }
    if (
        v === 0 &&
        i % 10 === Math.floor(i % 10) &&
        i % 10 >= 2 &&
        i % 10 <= 4 &&
        !(i % 100 >= 12 && i % 100 <= 14)
    ) {
        return 'few'
    }
    if (
        v === 0 &&
        (i % 10 === 0 ||
            (v === 0 &&
                ((i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9) ||
                    (v === 0 &&
                        i % 100 === Math.floor(i % 100) &&
                        i % 100 >= 11 &&
                        i % 100 <= 14))))
    ) {
        return 'many'
    }

    return 'other'
}

export function plural(n: number, one: string, few: string, many: string, other?: string) {
    const variant = chooseVariant(n)

    return variant === 'one'
        ? one
        : variant === 'few'
            ? (few !== undefined ? few : many)
            : (variant === 'many' ? many : other)
}

const Plural = (props: Props) => {
    return <span>{plural(props.n, props.one, props.few, props.many, props.other)}</span>
}

export default Plural
