<template>
  <div class="login-view">
    <h1>Hello 👋🏻</h1>
    <form class="flex flex-col" @submit.prevent="loginUser">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">Login</button>
      <router-link to="/register">Register</router-link>
    </form>
    <div class="error" v-if="authError">
      {{ authError }}
    </div>
    <div v-if="isLoggedIn">
      Logged in as: {{ currentUser?.email }}
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { login, authError, loading, isLoggedIn, currentUser } = useAuth()

const email = ref('')
const password = ref('')

const loginUser = async () => {
  await login(email.value, password.value)
}

</script>

<style scoped>


</style>
