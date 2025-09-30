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

    <!-- TV Show search and add -->
    <div class="tv-show-form">
      <h2>Add TV Show Time</h2>
      <div>
        <input class="border p-2 mb-4 w-64" type="text" v-model="searchQuery" placeholder="Search for a TV show..." @keyup.enter="searchShows"
        />
        <button @click="searchShows" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0 && !selectedShow" class="search-results">
        <h3>Search Results:</h3>
        <div class="show-grid">
          <div
            v-for="show in searchResults"
            :key="show.id"
            class="show-card"
            @click="selectShow(show)"
          >
            <img v-if="show.image" :src="show.image" :alt="show.name" />
            <div v-else class="no-image">No Image</div>
            <h4>{{ show.name }}</h4>
          </div>
        </div>
      </div>

      <!-- Selected Show Details -->
      <div v-if="selectedShow" class="show-details">
        <div class="show-header">
          <button @click="clearSelection" class="back-button">← Back to Results</button>
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
    </div>

    <!-- Existing entries list -->
    <ul>
      <li v-for="entry in entries" :key="entry.id">
        {{ entry.entryName }} // {{ entry.entryStartTime }} // {{ entry.entryEndTime }} // Duration: {{ entry.durationMinutes }} // {{ entry.id }}
        <button @click="deleteEntry(entry.id)">Remove</button>
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
import { useEntries } from '../composables/useEntries.js'
import { useTotalTime } from '../composables/useTotalTime.js'
import { useAuth } from '../composables/useAuth.js'
import { useTVMaze } from '../composables/useTVMaze.js'

const { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry } = useEntries()
const { totalTime, totalHours } = useTotalTime(entries)
const { isLoggedIn } = useAuth()
const {
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
} = useTVMaze()
</script>

<style>
.entry-form, .tv-show-form {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
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
