import axios from 'axios'
import { RespondentFilter } from '../features/filters/model'
import { CompanyResult, SurveyMeta } from './types'

const api = axios.create({
    baseURL: '/api'
})

function getList(path: string): Promise<string[]> {
    return api
        .get<string[]>(path)
        .then(response => response.data)
}

export const getCities = () => getList('filters/cities')
export const getEducations = () => getList('filters/educations')
export const getExperienceLevels = () => getList('filters/experienceLevels')
export const getProfessions = () => getList('filters/professions')
export const getProgrammingLanguages = () => getList('filters/programmingLanguages')

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
