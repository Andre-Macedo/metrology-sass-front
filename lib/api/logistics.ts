import { apiClient } from './client'
import { Instrument } from '../types'

export const logisticsApi = {
    scan: async (tagId: string, toStationId?: string) => {
        return await apiClient.post<{ message: string, instrument: Instrument }>('/instruments/scan', {
            tag_id: tagId,
            to_station_id: toStationId
        })
    }
}
