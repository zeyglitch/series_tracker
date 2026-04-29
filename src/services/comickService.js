import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_COMICK_API_BASE_URL || import.meta.env.VITE_COMICK_API_URL || ''

const http = apiBaseUrl
  ? axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  : null

export const comickService = {
  isConfigured() {
    return Boolean(apiBaseUrl)
  },

  async searchSeries(query) {
    if (!http || !query?.trim()) {
      return []
    }

    const { data } = await http.get('/search', {
      params: { q: query.trim() }
    })

    return Array.isArray(data?.results) ? data.results : []
  },

  async getSeriesDetails(seriesId) {
    if (!http || !seriesId) {
      return null
    }

    const { data } = await http.get(`/series/${encodeURIComponent(seriesId)}`)
    return data || null
  },

  async getLatestChapters(seriesId) {
    if (!http || !seriesId) {
      return []
    }

    const { data } = await http.get(`/series/${encodeURIComponent(seriesId)}/chapters`)
    return Array.isArray(data?.chapters) ? data.chapters : []
  }
}
