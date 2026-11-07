import type { Page, Request, Route } from '@playwright/test'
import { companyResults, filterOptions, surveyMeta } from '../src/test/fixtures'

// Подмена /api/** синтетическими ответами: тесты не обращаются к backend и production.

export type ApiCall = {
    method: string,
    path: string,
    body: string | null
}

type FilterOptions = { readonly [K in keyof typeof filterOptions]: readonly string[] }

const TRACKERS = /(mc\.yandex\.ru|vk\.com|userapi\.com)/

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

export const isCompanies = (call: ApiCall) => call.path === '/api/results/known-and-wanted'
export const isMeta = (call: ApiCall) => call.path === '/api/results/meta'
export const isFilterOptions = (call: ApiCall) => call.path.startsWith('/api/filters/')

function toCall(request: Request): ApiCall {
    return {
        method: request.method(),
        path: new URL(request.url()).pathname,
        body: request.postData()
    }
}

function responseFor(call: ApiCall, options: FilterOptions): unknown {
    if (isFilterOptions(call)) {
        return options[call.path.slice('/api/filters/'.length) as keyof FilterOptions]
    }
    return isMeta(call) ? surveyMeta : companyResults
}

export async function mockApi(page: Page, options: FilterOptions = filterOptions) {
    const calls: ApiCall[] = []

    await page.route(TRACKERS, route => route.abort())
    await page.route('**/api/**', async (route: Route) => {
        const call = toCall(route.request())
        calls.push(call)
        await route.fulfill({ json: responseFor(call, options) })
    })

    return {
        calls,
        posts: (match: (call: ApiCall) => boolean = () => true) =>
            calls.filter(call => call.method === 'POST' && match(call))
    }
}
