<template>
  <button v-if="isLoggedIn" @click="handleLogout" class="auth-button">Logout</button>
  <router-link v-else to="/login" class="auth-button">Login</router-link>
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

.auth-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

</style>
