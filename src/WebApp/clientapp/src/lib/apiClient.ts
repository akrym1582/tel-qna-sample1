import api from '@/api/$api'
import { aspidaClient, aspidaClientNoThrow } from '@/lib/aspida'

export const apiClient = api(aspidaClient).api
export const apiClientNoThrow = api(aspidaClientNoThrow).api
