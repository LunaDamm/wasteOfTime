<template>
  <div class="about">
    <h1>Firebase fuckery</h1>
    <h3>entries</h3>
    <input type="text" v-model="newEntryTitle" placeholder="Entry title" @keyup.enter="addEntry" />
    <button @click="addEntry">Add Entry</button>
    <ul>
      <li v-for="entry in entries" :key="entry.id">
        {{ entry.entryName }} // {{ entry.id }}
        <button @click="deleteEntry(entry.id)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useEntries } from '../composables/useEntries.js'
const { entries, newEntryTitle, addEntry, deleteEntry } = useEntries()
</script>


<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>
