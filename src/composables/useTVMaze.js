import { ref } from 'vue'
import { addDoc } from 'firebase/firestore'
import { entryFirebaseCollectionRef } from './firebase.js'
import { useAuth } from './useAuth.js'

export function useTVMaze() {
  const { currentUser } = useAuth()

  const searchQuery = ref('')
  const searchResults = ref([])
  const selectedShow = ref(null)
  const loading = ref(false)
  const loadingShow = ref(false)
  const error = ref(null)
  const selectedSeasons = ref([])
  const watchCount = ref(1)

  const searchShows = async () => {
    if (!searchQuery.value.trim()) return

    loading.value = true
    error.value = null
    searchResults.value = []
    selectedShow.value = null

    try {
      const response = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchQuery.value)}`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      searchResults.value = data.map(item => ({
        id: item.show.id,
        name: item.show.name,
        image: item.show.image?.medium || item.show.image?.original || null,
        summary: item.show.summary
      }))

    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const selectShow = async (show) => {
    loadingShow.value = true
    error.value = null
    selectedSeasons.value = []

    try {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${show.id}?embed=episodes`
      )

      if (!response.ok) {
        throw new Error('Failed to load show details')
      }

      const data = await response.json()

      // Group episodes by season
      const seasonData = {}
      if (data._embedded && data._embedded.episodes) {
        data._embedded.episodes.forEach(episode => {
          const season = episode.season
          if (!seasonData[season]) {
            seasonData[season] = {
              seasonNumber: season,
              episodes: [],
              totalRuntime: 0
            }
          }
          seasonData[season].episodes.push(episode)
          seasonData[season].totalRuntime += episode.runtime || 0
        })
      }

      selectedShow.value = {
        id: data.id,
        name: data.name,
        image: data.image?.medium || data.image?.original || null,
        summary: data.summary,
        seasons: Object.values(seasonData).sort((a, b) => a.seasonNumber - b.seasonNumber)
      }

    } catch (err) {
      error.value = err.message
    } finally {
      loadingShow.value = false
    }
  }

  const toggleSeason = (seasonNumber) => {
    const index = selectedSeasons.value.indexOf(seasonNumber)
    if (index > -1) {
      selectedSeasons.value.splice(index, 1)
    } else {
      selectedSeasons.value.push(seasonNumber)
    }
  }

  const toggleAllSeasons = () => {
    if (selectedSeasons.value.length === selectedShow.value.seasons.length) {
      selectedSeasons.value = []
    } else {
      selectedSeasons.value = selectedShow.value.seasons.map(season => season.seasonNumber)
    }
  }

  const addShowEntry = async () => {
    if (!currentUser.value) {
      console.error('User must be logged in to add entries')
      return
    }

    if (!selectedShow.value || selectedSeasons.value.length === 0) {
      console.error('No show selected or no seasons selected')
      return
    }

    const selectedSeasonsData = selectedShow.value.seasons.filter(
      season => selectedSeasons.value.includes(season.seasonNumber)
    )

    const totalMinutes = selectedSeasonsData.reduce(
      (total, season) => total + season.totalRuntime, 0
    ) * watchCount.value

    const seasonNumbers = selectedSeasonsData.map(s => s.seasonNumber).join(', ')
    const entryName = `${selectedShow.value.name} - Season${selectedSeasonsData.length > 1 ? 's' : ''} ${seasonNumbers}${watchCount.value > 1 ? ` (${watchCount.value}x)` : ''}`

    await addDoc(entryFirebaseCollectionRef, {
      entryName: entryName,
      entryStartTime: '00:00',
      entryEndTime: '00:00',
      durationMinutes: totalMinutes,
      userId: currentUser.value.uid,
      type: 'tv_show',
      showData: {
        name: selectedShow.value.name,
        watchCount: watchCount.value,
        cover: selectedShow.value.image,
      }
    })

    console.log('Show entry added')

    // Reset selection
    selectedSeasons.value = []
    watchCount.value = 1
    selectedShow.value = null
    searchResults.value = []
  }

  const clearSelection = () => {
    selectedShow.value = null
    selectedSeasons.value = []
    watchCount.value = 1
  }

  return {
    searchQuery,
    searchResults,
    selectedShow,
    loading,
    loadingShow,
    error,
    selectedSeasons,
    watchCount,
    searchShows,
    selectShow,
    toggleSeason,
    toggleAllSeasons,
    addShowEntry,
    clearSelection
  }
}

