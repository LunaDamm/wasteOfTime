<template>
  <div v-if="isLoggedIn" class="entry-view">
    <h1>entries</h1>

    <!-- Regular entry form -->
    <div class="entry-form">
      <input type="text" v-model="newEntryTitle" placeholder="Entry title" @keyup.enter="addEntry" />
      <input type="time" v-model="newEntryStartTime" placeholder="Entry time" @keyup.enter="addEntry" />
      <input type="time" v-model="newEntryEndTime" placeholder="Entry time" @keyup.enter="addEntry" />
      <button @click="addEntry">Add Entry</button>
    </div>

    <!-- Media search and add -->
    <div class="tv-show-form">
      <h2>Add Media Time</h2>

      <!-- Search type toggle -->
      <div class="search-type-toggle">
        <label>
          <input type="radio" v-model="searchType" value="tv" />
          TV Shows
        </label>
        <label>
          <input type="radio" v-model="searchType" value="movie" />
          Movies
        </label>
      </div>

      <div>
        <input
          type="text"
          v-model="currentSearchQuery"
          :placeholder="`Search for ${searchType === 'tv' ? 'TV shows' : 'movies'}...`"
          @keyup.enter="performSearch"
        />
        <button @click="performSearch" :disabled="currentLoading">
          {{ currentLoading ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <div v-if="currentError" class="error">{{ currentError }}</div>

      <!-- Search Results -->
      <div v-if="currentSearchResults.length > 0 && !currentSelected" class="search-results">
        <h3>Search Results:</h3>
        <div class="show-grid">
          <div
            v-for="item in currentSearchResults"
            :key="item.id"
            class="show-card"
            @click="selectItem(item)"
          >
            <img v-if="item.image" :src="item.image" :alt="item.title || item.name" />
            <div v-else class="no-image">No Image</div>
            <h4>{{ item.title || item.name }}</h4>
            <p v-if="item.year" class="year">{{ item.year }}</p>
          </div>
        </div>
      </div>

      <!-- Selected TV Show Details -->
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
              <input
                type="checkbox"
                :checked="selectedSeasons.includes(season.seasonNumber)"
                @change="toggleSeason(season.seasonNumber)"
              />
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

          <button
            @click="addShowEntry"
            :disabled="selectedSeasons.length === 0"
            class="add-show-button"
          >
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
      <li>Worked for {{ totalHours }} hours and made at least {{ (totalHours * 150).toFixed(2) }} DKK</li>
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

<style>
.entry-form, .tv-show-form {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
}

.search-type-toggle {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}

.search-type-toggle label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.search-results {
  margin-top: 1rem;
}

.show-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.show-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
}

.show-card:hover {
  transform: scale(1.05);
  border-color: #007bff;
}

.show-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #666;
}

.show-card h4 {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
}

.year {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: #666;
}

.show-details {
  margin-top: 1rem;
}

.show-header {
  margin-bottom: 1rem;
}

.back-button {
  background: none;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.back-button:hover {
  background-color: #007bff;
  color: white;
}

.show-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.season-item {
  margin: 0.5rem 0;
}

.watch-count {
  margin: 1rem 0;
}

.movie-selection {
  margin-top: 1rem;
}

.add-show-button {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.add-show-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin: 0.5rem 0;
}

.loading {
  color: #666;
  font-style: italic;
}
</style>
