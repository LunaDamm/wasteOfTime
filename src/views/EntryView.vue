<template>
  <div v-if="isLoggedIn" class="entry-view">
    <h1>entries</h1>
    <input type="text" class="border" v-model="newEntryTitle" placeholder="Entry title" @keyup.enter="addEntry" />
    <input type="time" class="border" v-model="newEntryStartTime" placeholder="Entry time" @keyup.enter="addEntry" />
    <input type="time" class="border" v-model="newEntryEndTime" placeholder="Entry time" @keyup.enter="addEntry" />
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

const { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry } = useEntries()

const { totalTime, totalHours } = useTotalTime(entries)

const { isLoggedIn } = useAuth()
</script>


<style>
</style>
