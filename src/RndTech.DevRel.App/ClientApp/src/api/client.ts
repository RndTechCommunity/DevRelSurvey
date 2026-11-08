import axios from 'axios'
import { RespondentFilter } from '../features/filters/model'
import { AudienceMatrixRequest, AudienceMatrixResponse, CompanyResult, FilterOptions, SurveyMeta } from './types'

const api = axios.create({
    baseURL: '/api'
})

function getList(path: string, signal?: AbortSignal): Promise<string[]> {
    return api
        .get<string[]>(`filters/${path}`, { signal })
        .then(response => response.data.filter(x => x !== ''))
}

export async function getFilterOptions(signal?: AbortSignal): Promise<FilterOptions> {
    const [cities, educations, experienceLevels, professions, programmingLanguages] = await Promise.all([
        getList('cities', signal),
        getList('educations', signal),
        getList('experienceLevels', signal),
        getList('professions', signal),
        getList('programmingLanguages', signal)
    ])
    return { cities, educations, experienceLevels, professions, programmingLanguages }
}

export function getCompanyResults(filter: RespondentFilter, signal?: AbortSignal): Promise<readonly CompanyResult[]> {
    return api
        .post<CompanyResult[]>('results/known-and-wanted', filter, { signal })
        .then(response => response.data)
}

export function getSurveyMeta(filter: RespondentFilter, signal?: AbortSignal): Promise<SurveyMeta> {
    return api
        .post<SurveyMeta>('results/meta', filter, { signal })
        .then(response => response.data)
}

export function getAudienceMatrix(request: AudienceMatrixRequest, signal: AbortSignal): Promise<AudienceMatrixResponse> {
    return api.post<AudienceMatrixResponse>('results/audience-matrix', request, { signal })
        .then(response => response.data)
}
