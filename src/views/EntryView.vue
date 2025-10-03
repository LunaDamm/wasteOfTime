<template>
  <div class="lg:w-4xl" v-if="isLoggedIn">
    <h1>Sooo... how much time have you wasted?</h1>
    <div class="border p-4 !mb-4 border-indigo-300 rounded">
      <h2 class="text-lg font-semibold text-indigo-300">Add Manual Entry</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <input class="border border-indigo-300 rounded p-2 !mb-2 " type="text" v-model="newEntryTitle" placeholder="Entry title"
          @keyup.enter="addEntry" />
        <input class="border border-indigo-300 rounded p-2 !mb-2" type="time" v-model="newEntryStartTime" placeholder="Entry time"
          @keyup.enter="addEntry" />
        <input class="border border-indigo-300 rounded p-2 !mb-2" type="time" v-model="newEntryEndTime" placeholder="Entry time"
          @keyup.enter="addEntry" />
      </div>
      <button class="border px-6 py-2 bg-indigo-300 hover:bg-indigo-500 text-white rounded text-center cursor-pointer" @click="addEntry">Add Entry</button>
    </div>

    <!-- Media search and add -->
    <div class="border p-4 !mb-4 border-indigo-300 rounded">
      <h2 class="text-lg font-semibold text-indigo-300">Add Media Time</h2>

      <!-- Search type toggle -->
      <div class="!mb-4">
        <label class="!mr-4 !font-semibold cursor-pointer">
          <input type="radio" v-model="searchType" value="tv" />
          TV Shows
        </label>
        <label class="!font-semibold cursor-pointer">
          <input type="radio" v-model="searchType" value="movie" />
          Movies
        </label>
      </div>

      <div class="!mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input class="border border-indigo-300 rounded p-2 col-span-3" type="text" v-model="currentSearchQuery"
          :placeholder="`Search for ${searchType === 'tv' ? 'TV shows' : 'movies'}...`" @keyup.enter="performSearch" />
        <button class="border px-6 py-2 bg-indigo-300 text-white rounded cursor-pointer hover:bg-indigo-500" @click="performSearch" :disabled="currentLoading">
          {{ currentLoading ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <div v-if="currentError" class="error">{{ currentError }}</div>

      <!-- Search Results -->
      <div v-if="currentSearchResults.length > 0 && !currentSelected" class="">
        <h3>Search Results:</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-128 overflow-y-auto mb-4 items-center cursor-pointer">
          <div v-for="item in currentSearchResults" :key="item.id" class="grid" @click="selectItem(item)">
            <img class="w-full h-auto aspect-2/3 rounded" v-if="item.image" :src="item.image" :alt="item.title || item.name" />
            <div class="text-center w-full aspect-2/3 bg-gray-200 rounded flex items-center justify-center" v-else >No Image</div>
            <h4 class="text-center">{{ item.title || item.name }}</h4>
            <p v-if="item.year" class="text-center">{{ item.year }}</p>
          </div>
        </div>
      </div>

      <!-- Selected Show Details -->
      <div v-if="searchType === 'tv' && selectedShow" class="show-details">
        <div class="show-header">
          <button @click="clearCurrentSelection" class="back-button">← Back to Results</button>
          <div v-if="loadingShow" class="loading">Loading show details...</div>
        </div>

        <div v-if="!loadingShow" class="show-info">
          <img v-if="selectedShow.image" :src="selectedShow.image" :alt="selectedShow.name" style="width: 100px;" />
          <div>
            <h3>{{ selectedShow.name }}</h3>
            <div v-html="selectedShow.summary"></div>
          </div>
        </div>

        <div v-if="!loadingShow && selectedShow.seasons" class="season-selection">
          <h4>Select Seasons:</h4>
          <button @click="toggleAllSeasons">
            {{ selectedSeasons.length === selectedShow.seasons.length ? 'Deselect All' : 'Select All' }}
          </button>

          <div v-for="season in selectedShow.seasons" :key="season.seasonNumber" class="season-item">
            <label>
              <input type="checkbox" :checked="selectedSeasons.includes(season.seasonNumber)"
                @change="toggleSeason(season.seasonNumber)" />
              Season {{ season.seasonNumber }}
              ({{ season.episodes.length }} episodes, {{ season.totalRuntime }} minutes)
            </label>
          </div>

          <div class="watch-count">
            <label>
              Times watched:
              <input type="number" v-model="watchCount" min="1" max="100" />
            </label>
          </div>

          <button @click="addShowEntry" :disabled="selectedSeasons.length === 0" class="add-show-button">
            Add Show to Entries
          </button>
        </div>
      </div>

      <!-- Selected Movie Details -->
      <div v-if="searchType === 'movie' && selectedMovie" class="show-details">
        <div class="show-header">
          <button @click="clearCurrentSelection" class="back-button">← Back to Results</button>
          <div v-if="loadingMovie" class="loading">Loading movie details...</div>
        </div>

        <div v-if="!loadingMovie" class="show-info">
          <img v-if="selectedMovie.image" :src="selectedMovie.image" :alt="selectedMovie.title" style="width: 100px;" />
          <div>
            <h3>{{ selectedMovie.title }} ({{ selectedMovie.year }})</h3>
            <p><strong>Runtime:</strong> {{ selectedMovie.runtime }} minutes</p>
            <p><strong>Genre:</strong> {{ selectedMovie.genre }}</p>
            <p><strong>Director:</strong> {{ selectedMovie.director }}</p>
            <p v-if="selectedMovie.imdbRating"><strong>IMDB Rating:</strong> {{ selectedMovie.imdbRating }}/10</p>
            <div>{{ selectedMovie.plot }}</div>
          </div>
        </div>

        <div v-if="!loadingMovie" class="movie-selection">
          <div class="watch-count">
            <label>
              Times watched:
              <input type="number" v-model="movieWatchCount" min="1" max="100" />
            </label>
          </div>

          <button @click="addMovieEntry" class="add-show-button">
            Add Movie to Entries
          </button>
        </div>
      </div>
    </div>

    <!-- Existing entries list -->
    <ul>
      <li class="border" v-for="entry in entries" :key="entry.id">
        {{ entry.entryName }}
        <button class="border text-red-400" @click="deleteEntry(entry.id)">Remove</button>
      </li>
    </ul>

    <h3>Total time spent on activities: {{ totalTime }}</h3>

    <h4>Using that time differently, you could've:</h4>
    <ul>
      <li>Made {{ (totalHours / 0.1).toFixed(2) }} sandwiches and fed them to homeless people</li>
      <li>Traveled to New Zealand by plane and back about {{ (totalHours / 40).toFixed(2) }} times</li>
      <li>Learned about {{ (totalHours / 600).toFixed(2) }} languages</li>
      <li>Worked for {{ totalHours.toFixed(2) }} hours and made at least {{ (totalHours * 150).toFixed(2) }} DKK</li>
      <li>Called your mum about {{ (totalHours / 0.5).toFixed(2) }} times and told her you love her for once!</li>
      <li>Read about {{ ((totalHours / 500000) * 100).toFixed(2) }}% of all English Wikipedia articles</li>
      <li>You could've change your life for the better at least 1 time, but you didn't. Sucks to suck!</li>
    </ul>
  </div>
  <div v-else>
    <p>Log in, pwetty pwease</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEntries } from '../composables/useEntries.js'
import { useTotalTime } from '../composables/useTotalTime.js'
import { useAuth } from '../composables/useAuth.js'
import { useTVMaze } from '../composables/useTVMaze.js'
import { useOMDB } from '../composables/useOMDB.js'

const { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry } = useEntries()
const { totalTime, totalHours } = useTotalTime(entries)
const { isLoggedIn } = useAuth()

// TV Shows composable
const {
  searchQuery: tvSearchQuery,
  searchResults: tvSearchResults,
  selectedShow,
  loading: tvLoading,
  loadingShow,
  error: tvError,
  selectedSeasons,
  watchCount,
  searchShows,
  selectShow,
  toggleSeason,
  toggleAllSeasons,
  addShowEntry,
  clearSelection: clearTVSelection
} = useTVMaze()

// Movies composable
const {
  searchQuery: movieSearchQuery,
  searchResults: movieSearchResults,
  selectedMovie,
  loading: movieLoading,
  loadingMovie,
  error: movieError,
  watchCount: movieWatchCount,
  searchMovies,
  selectMovie,
  addMovieEntry,
  clearSelection: clearMovieSelection
} = useOMDB()

// Search type toggle
const searchType = ref('tv')

// Computed properties to unify the interfaces
const currentSearchQuery = computed({
  get: () => searchType.value === 'tv' ? tvSearchQuery.value : movieSearchQuery.value,
  set: (value) => {
    if (searchType.value === 'tv') {
      tvSearchQuery.value = value
    } else {
      movieSearchQuery.value = value
    }
  }
})

const currentSearchResults = computed(() =>
  searchType.value === 'tv' ? tvSearchResults.value : movieSearchResults.value
)

const currentSelected = computed(() =>
  searchType.value === 'tv' ? selectedShow.value : selectedMovie.value
)

const currentLoading = computed(() =>
  searchType.value === 'tv' ? tvLoading.value : movieLoading.value
)

const currentError = computed(() =>
  searchType.value === 'tv' ? tvError.value : movieError.value
)

// Unified methods
const performSearch = () => {
  if (searchType.value === 'tv') {
    searchShows()
  } else {
    searchMovies()
  }
}

const selectItem = (item) => {
  if (searchType.value === 'tv') {
    selectShow(item)
  } else {
    selectMovie(item)
  }
}

const clearCurrentSelection = () => {
  if (searchType.value === 'tv') {
    clearTVSelection()
  } else {
    clearMovieSelection()
  }
}
</script>

<style></style>
