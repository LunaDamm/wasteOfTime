<template>
  <button v-if="isLoggedIn" @click="handleLogout" class="!px-4 !py-2 text-base bg-indigo-300 !text-white border-none rounded cursor-pointer inline-block transition duration-200">Logout</button>
  <router-link v-else to="/login" class="!px-4 !py-2 text-base bg-indigo-300 !text-white border-none rounded cursor-pointer no-underline inline-block transition duration-200">Login</router-link>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
const { isLoggedIn, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout(router)
}

</script>

<style scoped>
</style>
