<template>
  <div class="max-w-5xl mx-auto p-6">
    <!-- Hero / Frontpage -->
    <section class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8 !mb-8 shadow-lg">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="max-w-2xl">
          <h1 class="text-4xl lg:text-5xl font-extrabold leading-tight">WasteOfTime</h1>
          <p class="!mt-3 text-indigo-100/90">Show the world the most delightfully unproductive moments. Browse shared times, feature your own, and celebrate the glorious waste.</p>
          <div class="!mt-6 flex flex-wrap gap-3">
            <router-link to="/login" class="inline-block bg-white text-indigo-700 font-semibold !px-4 !py-2 rounded shadow hover:opacity-95">
              Login!
            </router-link>
            <router-link to="/register" class="inline-block bg-indigo-200 text-indigo-900 font-medium !px-4 !py-2 rounded hover:opacity-95">
              Register!
            </router-link>
          </div>
        </div>

        <div class="bg-white/10 p-4 rounded-lg text-right min-w-[220px]">
          <div class="text-xl text-white/70 mt-3">Collective wasted:</div>
          <div class=" font-medium text-indigo-100">{{ collectiveFormattedTime }}</div>
        </div>
      </div>
    </section>

    <!-- Features / quick info -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 !mb-8">
      <div class="bg-white rounded p-4 shadow">
        <h3 class="font-semibold mb-1">Fast & Simple</h3>
        <p class="text-sm text-gray-600">Share a time in a few clicks</p>
      </div>
      <div class="bg-white rounded p-4 shadow">
        <h3 class="font-semibold mb-1">Community</h3>
        <p class="text-sm text-gray-600">See what others are proudly wasting right now.</p>
      </div>
      <div class="bg-white rounded p-4 shadow">
        <h3 class="font-semibold mb-1">Lightweight</h3>
        <p class="text-sm text-gray-600">Minimal UI, quick loading and mobile friendly.</p>
      </div>
    </section>

    <!-- Error / empty states -->
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <!-- Recent shared times (main list) -->
    <section ref="listRef">
      <h2 class="text-2xl font-bold mb-4">Recent shared times</h2>

      <div v-if="!sharedTimes.length && !loading" class="text-gray-500 mb-6">
        No shared times yet — be the first!
      </div>

      <div v-if="loading" class="text-gray-500 mb-6">Loading…</div>

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

          <div v-if="item.note" class="text-sm text-gray-600 mt-2">{{ item.note }}</div>
        </div>
      </div>
    </section>

    <footer class="mt-10 text-center text-sm text-gray-500">
      Ⓝ 2025 WasteOfTime — made with wasted time by Luna
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../composables/firebase.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const sharedTimes = ref([])
const loading = ref(false)
const error = ref(null)
const listRef = ref(null)

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

// utility: same logic as useTotalTime.formatDuration -> returns formatted string
function formatDurationString(totalMinutes) {
  let minutes = totalMinutes;

  const minutesInHour = 60;
  const minutesInDay = 24 * minutesInHour;
  const minutesInWeek = 7 * minutesInDay;
  const minutesInMonth = 30 * minutesInDay; // Approximation
  const minutesInYear = 365 * minutesInDay; // Approximation

  const years = Math.floor(minutes / minutesInYear);
  minutes %= minutesInYear;

  const months = Math.floor(minutes / minutesInMonth);
  minutes %= minutesInMonth;

  const weeks = Math.floor(minutes / minutesInWeek);
  minutes %= minutesInWeek;

  const days = Math.floor(minutes / minutesInDay);
  minutes %= minutesInDay;

  const hours = Math.floor(minutes / minutesInHour);
  minutes %= minutesInHour;

  let parts = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

const collectiveRawMinutes = computed(() =>
  sharedTimes.value.reduce((sum, item) => sum + (Number(item.rawMinutes) || 0), 0)
)

const collectiveFormattedTime = computed(() =>
  formatDurationString(Math.floor(collectiveRawMinutes.value))
)

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
