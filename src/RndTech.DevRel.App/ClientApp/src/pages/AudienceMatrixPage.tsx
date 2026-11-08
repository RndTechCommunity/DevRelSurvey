import { useEffect, useState } from 'react'
import { Button } from 'rsuite'
import { getAudienceMatrix } from '../api/client'
import { AudienceGroupBy, MatrixValue } from '../api/types'
import { LEGACY_COMPANIES, MatrixMetric, MatrixSort, SurveyState } from '../app/surveyState'
import { useRequest } from '../app/useSurveyData'
import { UpdateSurveyState } from '../app/useSurveyState'
import { effectiveMatrixMetric, GROUP_LABELS, MATRIX_METRICS, matrixValueLabel, MAX_MATRIX_COLUMNS } from '../features/audience-matrix/audienceMatrix'
import AudienceMatrixTable from '../features/audience-matrix/AudienceMatrixTable'
import styles from '../features/audience-matrix/AudienceMatrix.module.css'
import { AsyncState } from '../shared/AsyncState'
import MultiSelect from '../shared/MultiSelect'

type Props = { state: SurveyState, update: UpdateSurveyState, theme: 'light' | 'dark' }
const NAME_SORT: MatrixSort = { by: 'name', direction: 'asc' }

export default function AudienceMatrixPage({ state, update, theme }: Props) {
    const { matrix } = state
    const request = useRequest(getAudienceMatrix, {
        year: state.year, filter: state.filter, groupBy: matrix.groupBy, groupValues: matrix.groupValues
    })
    const data = request.status === 'ready' ? request.data : undefined
    const catalog = request.data?.groupBy === matrix.groupBy ? request.data : undefined
    const [selectionError, setSelectionError] = useState('')
    const missingSort = data && matrix.groupValues === null && matrix.sort.by === 'column'
        && !data.columns.some(column => matrix.sort.by === 'column' && column.value === matrix.sort.value)
    const sort = missingSort ? NAME_SORT : matrix.sort
    useEffect(() => {
        if (missingSort) update({ matrix: { ...matrix, sort: NAME_SORT } })
    }, [missingSort, matrix, update])
    const selectValues = (groupValues: readonly MatrixValue[] | null) => {
        if (groupValues && groupValues.length > MAX_MATRIX_COLUMNS) {
            setSelectionError(`Можно выбрать не более ${MAX_MATRIX_COLUMNS} колонок. Прежний выбор сохранён.`)
            return
        }
        setSelectionError('')
        const removed = matrix.sort.by === 'column' && groupValues !== null && !groupValues.includes(matrix.sort.value)
        update({ matrix: { ...matrix, groupValues, sort: removed ? NAME_SORT : matrix.sort } })
    }
    const selected = matrix.groupValues ?? data?.columns.map(column => column.value) ?? []
    const options = [...new Set([...(catalog?.availableValues.map(option => option.value) ?? []), ...selected])]
    const label = (encoded: string) => {
        const value: MatrixValue = JSON.parse(encoded)
        const option = catalog?.availableValues.find(option => option.value === value)
        return option ? option.label : `${matrixValueLabel(matrix.groupBy, value)}${catalog ? ' (нет в справочнике)' : ''}`
    }
    const columnSorts = data?.columns.map(column => ({ by: 'column' as const, value: column.value, direction: sort.direction })) ?? []
    const metric = effectiveMatrixMetric(matrix.metric, state.year)
    const restriction = matrix.groupBy === 'communitySources' ? null : state.filter[matrix.groupBy]
    const hasRestriction = Array.isArray(restriction) ? restriction.length > 0 : restriction !== null
    return (
        <div className={styles.page}>
            <h1>Матрица аудиторий</h1>
            <p>Каждая колонка — общая группа по фильтру и выбранное значение признака. Общий фильтр продолжает действовать, включая этот признак.</p>
            <div className={styles.controls}>
                <div className={styles.field}>
                    <span id='matrix-companies'>Компании</span>
                    <MultiSelect options={catalog?.companyNames ?? []} value={state.companies} labelledBy='matrix-companies'
                        placeholder='Все компании' preset={{ label: 'Популярные', values: LEGACY_COMPANIES }}
                        onChange={companies => update({ companies })} />
                </div>
                <div className={styles.field}>
                    <label htmlFor='matrix-group'>Группировать по</label>
                    <select id='matrix-group' value={matrix.groupBy} onChange={event => {
                        setSelectionError('')
                        update({ matrix: { ...matrix, groupBy: event.target.value as AudienceGroupBy, groupValues: null, sort: { by: 'base', direction: 'desc' } } })
                    }}>
                        {Object.entries(GROUP_LABELS).map(([value, title]) => <option key={value} value={value}>{title}</option>)}
                    </select>
                </div>
                <div className={styles.field}>
                    <span id='matrix-columns'>Колонки</span>
                    <MultiSelect options={options.map(value => JSON.stringify(value))} value={selected.map(value => JSON.stringify(value))}
                        getLabel={label} labelledBy='matrix-columns' placeholder='Выберите колонки'
                        onChange={values => selectValues(values.map(value => JSON.parse(value) as MatrixValue))} />
                    <div className={styles.actions}>
                        <Button size='sm' onClick={() => selectValues([])}>Очистить колонки</Button>
                        <Button size='sm' onClick={() => selectValues(null)}>Начальные группы</Button>
                    </div>
                </div>
                <div className={styles.field}>
                    <label htmlFor='matrix-metric'>Показатель</label>
                    <select id='matrix-metric' value={metric} onChange={event => update({ matrix: { ...matrix, metric: event.target.value as MatrixMetric } })}>
                        {Object.entries(MATRIX_METRICS).filter(([value]) => state.year !== 2019 || value !== 'good')
                            .map(([value, title]) => <option key={value} value={value}>{title}</option>)}
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor='matrix-sort'>Сортировка строк</label>
                    <select id='matrix-sort' value={sort.by === 'column' ? `column:${JSON.stringify(sort.value)}` : sort.by}
                        onChange={event => {
                            const value = event.target.value
                            const next = columnSorts.find(item => `column:${JSON.stringify(item.value)}` === value)
                            update({ matrix: { ...matrix, sort: next ?? { by: value === 'base' ? 'base' : 'name', direction: sort.direction } } })
                        }}>
                        <option value='name'>По имени</option><option value='base'>По показателю общей группы</option>
                        {data?.columns.map(column => <option key={JSON.stringify(column.value)} value={`column:${JSON.stringify(column.value)}`}>Колонка: {column.label}</option>)}
                        {!data && sort.by === 'column' && <option value={`column:${JSON.stringify(sort.value)}`}>Колонка: {matrixValueLabel(matrix.groupBy, sort.value)}</option>}
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor='matrix-direction'>Направление</label>
                    <select id='matrix-direction' value={sort.direction} onChange={event => update({ matrix: { ...matrix, sort: { ...sort, direction: event.target.value === 'asc' ? 'asc' : 'desc' } } })}>
                        <option value='desc'>По убыванию ↓</option><option value='asc'>По возрастанию ↑</option>
                    </select>
                </div>
            </div>
            {selectionError && <p role='alert'>{selectionError}</p>}
            <p>Каталог значений — все годы, без ограничения общим фильтром. {matrix.groupValues === null ? 'Начальные группы: до 6 самых многочисленных в текущей группе и году.' : 'Выбранные колонки сохраняются при смене года и фильтра.'}</p>
            {sort.by === 'name' && <p role='status'>Сортировка по имени. Если колонка сортировки исчезла, применяется «По имени» по возрастанию.</p>}
            {matrix.metric === 'good' && state.year === 2019 && <p role='status'>Для 2019 года вместо рекомендаций показано желание работать.</p>}
            {(matrix.groupBy === 'languages' || matrix.groupBy === 'communitySources') && <p>Один человек может входить в несколько колонок: их N нельзя суммировать. {matrix.groupBy === 'languages' && 'JavaScript и TypeScript включают исторический вариант «JavaScript / TypeScript», поэтому эти группы тоже пересекаются.'}</p>}
            {hasRestriction && data?.columns.some(column => column.respondentCount === 0) && <p>Есть колонки с N = 0. Общий фильтр по этому признаку продолжает действовать. Чтобы снять его, нажмите соответствующую метку «Убрать ограничение» над матрицей или измените поле в фильтрах.</p>}
            <AsyncState state={{ ...request, data }}>{result => <AudienceMatrixTable data={result} companies={state.companies} metric={metric} sort={sort} theme={theme} />}</AsyncState>
        </div>
    )
}
