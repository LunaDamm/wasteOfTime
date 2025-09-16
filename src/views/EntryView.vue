<template>
  <div class="about">
    <h1>Firebase fuckery</h1>
    <h3>entries</h3>
    <input type="text" v-model="newEntryTitle" placeholder="Entry title" @keyup.enter="addEntry" />
    <input type="time" v-model="newEntryStartTime" placeholder="Entry time" @keyup.enter="addEntry" />
    <input type="time" v-model="newEntryEndTime" placeholder="Entry time" @keyup.enter="addEntry" />
    <button @click="addEntry">Add Entry</button>
    <ul>
      <li v-for="entry in entries" :key="entry.id">
        {{ entry.entryName }} // {{ entry.entryStartTime }} // {{ entry.entryEndTime }} // Duration: {{ entry.durationMinutes }} // {{ entry.id }}
        <button @click="deleteEntry(entry.id)">Remove</button>
      </li>
    </ul>
    <h3>Total time spent on activities: {{ totalTime }}</h3>

    <h4>Using that time differently, you could've:</h4>
    <ul>
      <li>Traveled to New Sealand by plane and back about {{ (totalHours / 48).toFixed(0) }} times</li>
      <li>Learned about {{ (totalHours / 600).toFixed(2) }} languages</li>
      <li>You could've change your life for the better, but you didn't. Sucks to suck!</li>
    </ul>
  </div>
</template>

<script setup>
import { useEntries } from '../composables/useEntries.js'
import { useTotalTime } from '../composables/useTotalTime.js'

const { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry } = useEntries()

const { totalTime, totalHours } = useTotalTime(entries)
</script>


<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>
