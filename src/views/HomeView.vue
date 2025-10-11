<template>
  <div class="lg:w-4xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Shared times</h1>

    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-600">See what others have shared</p>
    </div>

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <div v-if="!sharedTimes.length && !loading" class="text-gray-500">
      No shared times yet — be the first!
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in sharedTimes"
        :key="item.id"
        class="border p-4 !mb-4 border-indigo-300 rounded bg-white shadow-sm"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold text-indigo-600">{{ item.displayName || 'Anonymous' }}</h3>
          <span class="text-xs text-gray-500">{{ formatTimestamp(item.timestamp) }}</span>
        </div>

        <div class="text-2xl font-extrabold text-indigo-300 mb-2">
          {{ item.finalTime }} wasted
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../composables/firebase.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const sharedTimes = ref([])
const loading = ref(false)
const error = ref(null)

const loadSharedTimes = async () => {
  loading.value = true
  error.value = null
  try {
    const col = collection(db, 'sharedTime')
    const q = query(col, orderBy('timestamp', 'desc'))
    const snap = await getDocs(q)
    sharedTimes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    error.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}

const formatTimestamp = (ts) => {
  if (!ts) return ''
  // Firestore Timestamp object (has seconds) or a plain Date/string
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString()
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

onMounted(loadSharedTimes)
</script>

<style></style>
