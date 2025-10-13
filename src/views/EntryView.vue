<template>
  <div class="lg:w-4xl" v-if="isLoggedIn">
    <h1>Sooo... how much time have you wasted?</h1>
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
        <h3 class="text-lg font-semibold text-indigo-300">Search Results:</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-128 overflow-y-auto mb-4 items-center cursor-pointer">
          <div v-for="item in currentSearchResults" :key="item.id" class="grid" @click="selectItem(item)">
            <img class="w-full h-auto aspect-2/3 rounded" v-if="item.image" :src="item.image" :alt="item.title || item.name" />
            <div class="text-center w-full aspect-2/3 bg-gray-200 rounded flex items-center justify-center" v-else >No Image</div>
            <h4 class="text-center">{{ item.title || item.name }}</h4>
            <p v-if="item.year" class="text-center">{{ item.year }}</p>
          </div>
        </div>
      </div>

      <!-- Unified Media Details -->
      <div v-if="currentSelected" >
        <div class="!mb-4">
          <button @click="clearCurrentSelection" class="bg-indigo-300 hover:bg-indigo-500 text-white rounded py-2 px-4">← Back to Results</button>
          <div v-if="currentLoadingDetails">Loading {{ searchType }} details...</div>
        </div>

        <div v-if="!currentLoadingDetails" class="flex gap-4 !mb-4">
          <img v-if="currentSelected.image" :src="currentSelected.image"
               :alt="currentSelected.title || currentSelected.name" class="w-48 h-full" />
          <div class="text-sm">
            <h3 class="text-3xl">{{ currentSelected.title || currentSelected.name }}
                <span v-if="searchType === 'movie' && currentSelected.year">({{ currentSelected.year }})</span>
            </h3>

            <!-- Movie specific details -->
            <template v-if="searchType === 'movie'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p class="flex items-center gap-2 p-2 border border-gray-300 rounded">Runtime: {{ currentSelected.runtime }} minutes</p>
              <p class="flex items-center gap-2 p-2 border border-gray-300 rounded">Genre: {{ currentSelected.genre }}</p>
              <p class="flex items-center gap-2 p-2 border border-gray-300 rounded">Director: {{ currentSelected.director }}</p>
              <p class="flex items-center gap-2 p-2 border border-gray-300 rounded" v-if="currentSelected.imdbRating">IMDB Rating: {{ currentSelected.imdbRating }}/10</p>
              <div class="col-span-2">{{ currentSelected.plot }}</div>
              </div>
            </template>

            <!-- TV Show specific details -->
            <template v-if="searchType === 'tv'">
              <div v-html="currentSelected.summary"></div>
            </template>
          </div>
        </div>

        <!-- Season selection for TV shows -->
        <div v-if="!currentLoadingDetails && searchType === 'tv' && currentSelected.seasons" class="season-selection border p-4 !mb-4 border-indigo-300 rounded">
          <h4 class="text-lg font-semibold text-indigo-300 !mb-4">Select Seasons:</h4>
          <button @click="toggleAllSeasons" class="border px-6 py-2 bg-indigo-300 hover:bg-indigo-500 text-white rounded text-center cursor-pointer !mb-4">
            {{ selectedSeasons.length === currentSelected.seasons.length ? 'Deselect All' : 'Select All' }}
          </button>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div v-for="season in currentSelected.seasons" :key="season.seasonNumber" class="season-item">
              <label class="cursor-pointer flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-gray-50">
                <input type="checkbox" :checked="selectedSeasons.includes(season.seasonNumber)"
                  @change="toggleSeason(season.seasonNumber)" class="cursor-pointer" />
                <span>Season {{ season.seasonNumber }}</span>
                <span class="text-gray-400 text-sm">({{ season.episodes.length }} episodes, {{ season.totalRuntime }} minutes)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Watch count and add button -->
        <div v-if="!currentLoadingDetails" class="flex flex-col md:flex-row md:items-center gap-4 place-content-between">
          <div class="">
            <label class="!font-semibold !mb-2 flex items-center gap-2">
              Times watched:
              <input class="border border-gray-300 rounded p-1" type="number" v-model="currentWatchCount" min="1" max="100" />
            </label>
          </div>

          <button class="border px-6 py-2 bg-indigo-300 hover:bg-indigo-500 text-white rounded text-center cursor-pointer !mb-4" @click="addCurrentEntry"
                  :disabled="searchType === 'tv' && selectedSeasons.length === 0">
            Add {{ searchType === 'tv' ? 'Show' : 'Movie' }} to Entries
          </button>
        </div>
      </div>
    </div>

    <div class="border p-4 !mb-4 border-indigo-300 rounded">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-indigo-300">Add Manual Entry</h2>
        <button @click="showManual = !showManual"
                class="border px-4 py-1 bg-indigo-300 hover:bg-indigo-500 text-white rounded text-center cursor-pointer">
          {{ showManual ? 'Hide' : 'Show' }}
        </button>
      </div>

      <div>
        <div v-show="showManual" class="mt-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input class="border border-indigo-300 rounded p-2 !mb-2" type="text" v-model="newEntryTitle" placeholder="Entry title"
              @keyup.enter="addEntry" />
            <input class="border border-indigo-300 rounded p-2 !mb-2" type="time" v-model="newEntryStartTime" placeholder="Entry time"
              @keyup.enter="addEntry" />
            <input class="border border-indigo-300 rounded p-2 !mb-2" type="time" v-model="newEntryEndTime" placeholder="Entry time"
              @keyup.enter="addEntry" />
          </div>
          <button class="border px-6 py-2 bg-indigo-300 hover:bg-indigo-500 text-white rounded text-center cursor-pointer" @click="addEntry">Add Entry</button>
        </div>
      </div>
    </div>

    <!-- Existing entries list -->
    <div class="border p-4 !mb-4 border-indigo-300 rounded">
      <h3 class="text-lg font-semibold text-indigo-300 !mb-4">Your Entries</h3>
      <ul class="space-y-2 grid md:grid-cols-4 grid-cols-1 gap-4">
        <li class="flex md:grid items-center p-2 border border-gray-300 rounded" v-for="entry in entries" :key="entry.id">
          <img :src="entry.showData.cover" alt="Cover Image" class="w-full aspect-[9/12] object-cover rounded hidden md:block" />
          <span>{{ entry.entryName }}</span>
          <button class="px-4 py-1 border border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded cursor-pointer transition-colors" @click="deleteEntry(entry.id)">Remove</button>
        </li>
      </ul>
    </div>

    <div class="border p-4 !mb-4 border-indigo-300 rounded">
      <h3 class="text-lg font-semibold text-indigo-300 !mb-4">Total time spent on activities:</h3> <h3 class="text-2xl !font-semibold text-red-500 !mb-4">{{ totalTime }}</h3>

      <h4 class="text-md font-semibold text-indigo-300 !mb-4">Using that time differently, you could've:</h4>
      <ul class="grid md:grid-cols-3 grid-cols-1 gap-4">
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">🥪</h5>
          <p>Made {{ (totalHours / 0.1).toFixed(2) }} sandwiches and fed them to homeless people</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">✈️</h5>
          <p>Traveled to New Zealand by plane and back about {{ (totalHours / 40).toFixed(2) }} times</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">🌍</h5>
          <p>Learned about {{ (totalHours / 600).toFixed(2) }} languages</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">💼</h5>
          <p>Worked for {{ totalHours.toFixed(2) }} hours and made at least {{ (totalHours * 130).toFixed(2) }} DKK (if not more!)</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">📞</h5>
          <p>Called your mum about {{ (totalHours / 0.5).toFixed(2) }} times and told her you love her for once!</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">📚</h5>
          <p>Read about {{ ((totalHours / 500000) * 100).toFixed(2) }}% of all English Wikipedia articles</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">😴</h5>
          <p>Slept for {{ (totalHours / 8).toFixed(2) }} days straight. Ah, the life of a cat... 🐱</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">🎧</h5>
          <p>Listened to about {{ (totalHours / 3).toFixed(2) }} albums on repeat</p>
        </li>
        <li class=" p-2 border border-gray-300 rounded text-center">
          <h5 class="text-3xl">📺</h5>
          <p>Binged all of Breaking Bad about {{ (totalHours / 46).toFixed(2) }} times (why wouldn't you?)</p>
        </li>
        <li class="md:col-span-3 p-2 border border-gray-300 rounded bg-red-100 text-red-700 !font-semibold text-center">You could've change your life for the better at least 1 time, but you didn't. Sucks to suck!</li>
      </ul>
      <div class="text-center !mt-4">
        <p class="text-[18px]">Share your time spent on activities on the website for others to see!</p>
        <button class="border px-6 py-2 bg-indigo-300 hover:bg-indigo-500 text-white rounded text-center cursor-pointer !mb-4" @click="handleShare">
          {{ shareButtonLabel }}
        </button>
        <div v-if="shareError" class="text-red-500 mt-2">{{ shareError }}</div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Log in, pwetty pwease 🥺</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEntries } from '../composables/useEntries.js'
import { useTotalTime } from '../composables/useTotalTime.js'
import { useAuth } from '../composables/useAuth.js'
import { useTVMaze } from '../composables/useTVMaze.js'
import { useOMDB } from '../composables/useOMDB.js'
import { useShareTime } from '../composables/useShareTime.js'

const { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry } = useEntries()
// include raw total minutes
const { totalTime, totalHours, totalDurationMinutes } = useTotalTime(entries)
const { isLoggedIn, currentUser } = useAuth()

// Share time composable
const { shareTime, loadSharedTime, sharedExists, error: shareError } = useShareTime()

// load existing shared time when currentUser available
onMounted(() => {
  if (currentUser?.value?.uid) {
    loadSharedTime(currentUser.value.uid)
  }
})
watch(currentUser, (u) => {
  if (u?.uid) loadSharedTime(u.uid)
})

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

const currentLoadingDetails = computed(() =>
  searchType.value === 'tv' ? loadingShow.value : loadingMovie.value
)

const currentWatchCount = computed({
  get: () => searchType.value === 'tv' ? watchCount.value : movieWatchCount.value,
  set: (value) => {
    if (searchType.value === 'tv') {
      watchCount.value = value
    } else {
      movieWatchCount.value = value
    }
  }
})

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

const addCurrentEntry = () => {
  if (searchType.value === 'tv') {
    addShowEntry()
  } else {
    addMovieEntry()
  }
}

// Share button handling
const shareButtonLabel = computed(() => sharedExists.value ? 'Update my time!' : 'Share my time!')

const handleShare = async () => {
  if (!currentUser?.value?.uid) return
  const displayName = currentUser.value.displayName || currentUser.value.email || 'Anonymous'
  await shareTime(currentUser.value.uid, displayName, totalTime.value, totalDurationMinutes.value)
  // reload shared status after share
  await loadSharedTime(currentUser.value.uid)
}

// Manual entry dropdown control
const showManual = ref(false)
</script>

<style></style>
