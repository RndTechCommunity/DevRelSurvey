import type { Page, Request, Route } from '@playwright/test'
import {
    audienceMatrixFixture,
    companyResults,
    denseCompanyResults,
    emptyCompanyResults,
    emptyMeta,
    filterOptions,
    singleYearCompanyResults,
    singleYearMeta,
    surveyMeta
} from '../src/test/fixtures'

// Подмена /api/** синтетическими ответами: тесты не обращаются к backend и production.

export type ApiCall = {
    method: string,
    path: string,
    body: string | null,
    // Завершается, когда запрос получил ответ или был отменён браузером.
    done: Promise<void>
}

// HTTP-статус, сетевая ошибка или promise, до выполнения которого ответ задерживается.
type Reply = number | 'abort' | Promise<void>

type Override = {
    match: (call: ApiCall) => boolean,
    reply: Reply
}

type FilterOptions = { readonly [K in keyof typeof filterOptions]: readonly string[] }

const TRACKERS = /mc\.yandex\.ru/

// Исходная группа: Ростов-на-Дону, 20–44 года.
export const INITIAL_FILTER = {
    cities: ['Ростов-на-Дону'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: ['20 - 24 лет', '25 - 29 лет', '30 - 34 лет', '35 - 39 лет', '40 - 44 лет'],
    isCommunity: null
}

export const isMatrix = (call: ApiCall) => call.path === '/api/results/audience-matrix'
export const isCompanies = (call: ApiCall) => call.path === '/api/results/known-and-wanted'
export const isMeta = (call: ApiCall) => call.path === '/api/results/meta'
export const isFilterOptions = (call: ApiCall) => call.path.startsWith('/api/filters/')
export const forCity = (city: string) => (call: ApiCall) => call.body?.includes(`"${city}"`) ?? false

function responseFor(call: ApiCall, options: FilterOptions): unknown {
    if (isMatrix(call)) return audienceMatrixFixture(JSON.parse(call.body ?? '{}'))
    if (isFilterOptions(call)) {
        return options[call.path.slice('/api/filters/'.length) as keyof FilterOptions]
    }
    if (forCity('Нет-такого')(call)) {
        return isMeta(call) ? emptyMeta : emptyCompanyResults
    }
    if (forCity('Плотный')(call)) {
        return isMeta(call) ? surveyMeta : denseCompanyResults
    }
    if (forCity('Тбилиси')(call)) {
        return isMeta(call) ? singleYearMeta : singleYearCompanyResults
    }
    return isMeta(call) ? surveyMeta : companyResults
}

async function reply(route: Route, call: ApiCall, overrides: Override[], options: FilterOptions) {
    const override = overrides.find(o => o.match(call))
    if (override?.reply === 'abort') {
        return route.abort('failed')
    }
    if (typeof override?.reply === 'number') {
        return route.fulfill({ status: override.reply, body: '' })
    }
    await override?.reply
    return route.fulfill({ json: responseFor(call, options) })
}

export async function mockApi(page: Page, options: FilterOptions = filterOptions) {
    const calls: ApiCall[] = []
    const overrides: Override[] = []

    await page.route(TRACKERS, route => route.abort())
    await page.route('**/api/**', async (route: Route) => {
        const request: Request = route.request()
        let finish = () => {}
        const call = {
            method: request.method(),
            path: new URL(request.url()).pathname,
            body: request.postData(),
            done: new Promise<void>(resolve => { finish = resolve })
        }
        calls.push(call)
        // Браузер мог отменить запрос (AbortController), пока ответ задерживался.
        await reply(route, call, overrides, options).catch(() => {})
        finish()
    })

    return {
        calls,
        posts: (match: (call: ApiCall) => boolean = () => true) =>
            calls.filter(call => call.method === 'POST' && match(call)),
        // Действует до вызова возвращённой функции.
        override(match: (call: ApiCall) => boolean, reply: Reply) {
            const item = { match, reply }
            overrides.push(item)
            return () => {
                overrides.splice(overrides.indexOf(item), 1)
            }
        }
    }
}
