import axios, { AxiosRequestConfig } from 'axios'
import { Filter } from './components/filters/Filter'

const api = axios.create({
    baseURL: '/api'
})

export function    getAges() {
    const start = 16
    const end = 50
    return api
        .get('/cities')
        .then(response => new Array(end - start + 1).fill(undefined).map((_, i) => i + start).map(String))
}

export function getCities() {
    return api
        .get('/cities')
        .then(response => response.data)
}

export function getCommunitySources() {
    return api
        .get('/communitySources')
        .then(response => response.data)
}

export function getCompanySources() {
    return api
        .get('/companySources')
        .then(response => response.data)
}

export function getEducations() {
    return api
        .get('/educations')
        .then(response => response.data)
}

export function getExperienceLevels() {
    return api
        .get('/experienceLevels')
        .then(response => response.data)
}

export function getProfessions() {
    return api
        .get('/professions')
        .then(response => response.data)
}

export function getProgrammingLanguages() {
    return api
        .get('/programmingLanguages')
        .then(response => response.data)
}

export type MetaData = {
    count: number
}

export function getMeta(filter: Filter): Promise<MetaData> {
    return api
        .get('/meta', getConfig(filter))
        .then(response => response.data)
}

export type KnownAndWantedData = {
    [company: string]: {
        knownLevel: number,
        wantedLevel: number,
        error: number
    }
}

export function getKnownAndWantedData(filter: Filter): Promise<KnownAndWantedData> {
    return api
        .get('/known-and-wanted', getConfig(filter))
        .then(response => response.data)
}

export type FactorData = {
    [group: number]: {
        [factor: string]: number
    }
}

export function getFactorData(filter: Filter): Promise<FactorData> {
    return api
        .get('/factors', getConfig(filter))
        .then(response => response.data)
}

function getConfig(filter: Filter): AxiosRequestConfig {
    return {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: getParams(filter)
    }
}

function getParams(filter: Filter): URLSearchParams {
    const params = Object
        .keys(filter)
        .map(x => [
            x,
            JSON.stringify(filter[x])
        ])

    return new URLSearchParams(params)
}