import axios from 'axios'
import { Filter } from './components/filters/Filter'

const api = axios.create({
    baseURL: '/api'
})

export function getAges() {
    const start = 3
    const end = 11
    return new Promise<string[]>((resolve) => {
        resolve(new Array(end - start + 1)
            .fill(undefined)
            .map((_, i) => (i + start) * 5)
            .map(_ => String(_) + ' - ' + String(_ + 4) + ' лет'))
    });
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
    count: number,
    total: number,
    sources: any
}

export function getMeta(filter: Filter): Promise<MetaData> {
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    return api
        .post('/meta', filter)
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
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    return api
        .post('/known-and-wanted', filter)
        .then(response => response.data)
}