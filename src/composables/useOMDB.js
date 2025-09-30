import { ref } from 'vue'
import { addDoc } from 'firebase/firestore'
import { entryFirebaseCollectionRef } from './firebase.js'
import { useAuth } from './useAuth.js'

export function useOMDB() {
  const { currentUser } = useAuth()

  const API_KEY = '935e443e' // Replace with your actual API key

  const searchQuery = ref('')
  const searchResults = ref([])
  const selectedMovie = ref(null)
  const loading = ref(false)
  const loadingMovie = ref(false)
  const error = ref(null)
  const watchCount = ref(1)

  const searchMovies = async () => {
    if (!searchQuery.value.trim()) return

    loading.value = true
    error.value = null
    searchResults.value = []
    selectedMovie.value = null

    try {
      const response = await fetch(
        `http://www.omdbapi.com/?s=${encodeURIComponent(searchQuery.value)}&type=movie&apikey=${API_KEY}`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      if (data.Response === 'False') {
        throw new Error(data.Error || 'No movies found')
      }

      searchResults.value = data.Search.map(movie => ({
        id: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        image: movie.Poster !== 'N/A' ? movie.Poster : null,
        type: movie.Type
      }))

    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const selectMovie = async (movie) => {
    loadingMovie.value = true
    error.value = null

    try {
      const response = await fetch(
        `http://www.omdbapi.com/?i=${movie.id}&plot=full&apikey=${API_KEY}`
      )

      if (!response.ok) {
        throw new Error('Failed to load movie details')
      }

      const data = await response.json()

      if (data.Response === 'False') {
        throw new Error(data.Error || 'Movie not found')
      }

      // Convert runtime to minutes
      let runtimeMinutes = 0
      if (data.Runtime && data.Runtime !== 'N/A') {
        const runtimeMatch = data.Runtime.match(/(\d+)/)
        if (runtimeMatch) {
          runtimeMinutes = parseInt(runtimeMatch[1])
        }
      }

      selectedMovie.value = {
        id: data.imdbID,
        title: data.Title,
        year: data.Year,
        image: data.Poster !== 'N/A' ? data.Poster : null,
        plot: data.Plot !== 'N/A' ? data.Plot : 'No plot available',
        runtime: runtimeMinutes,
        genre: data.Genre !== 'N/A' ? data.Genre : '',
        director: data.Director !== 'N/A' ? data.Director : '',
        actors: data.Actors !== 'N/A' ? data.Actors : '',
        imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null
      }

    } catch (err) {
      error.value = err.message
    } finally {
      loadingMovie.value = false
    }
  }

  const addMovieEntry = async () => {
    if (!currentUser.value) {
      console.error('User must be logged in to add entries')
      return
    }

    if (!selectedMovie.value) {
      console.error('No movie selected')
      return
    }

    const totalMinutes = selectedMovie.value.runtime * watchCount.value
    const entryName = `${selectedMovie.value.title} (${selectedMovie.value.year})${watchCount.value > 1 ? ` (${watchCount.value}x)` : ''}`

    await addDoc(entryFirebaseCollectionRef, {
      entryName: entryName,
      entryStartTime: '00:00',
      entryEndTime: '00:00',
      durationMinutes: totalMinutes,
      userId: currentUser.value.uid,
      type: 'movie',
      movieData: {
        title: selectedMovie.value.title,
        year: selectedMovie.value.year,
        runtime: selectedMovie.value.runtime,
        watchCount: watchCount.value
      }
    })

    console.log('Movie entry added')

    // Reset selection
    watchCount.value = 1
    selectedMovie.value = null
    searchResults.value = []
  }

  const clearSelection = () => {
    selectedMovie.value = null
    watchCount.value = 1
  }

  return {
    searchQuery,
    searchResults,
    selectedMovie,
    loading,
    loadingMovie,
    error,
    watchCount,
    searchMovies,
    selectMovie,
    addMovieEntry,
    clearSelection
  }
}
