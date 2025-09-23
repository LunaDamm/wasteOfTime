<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="registerUser">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">Register</button>
      <router-link to="/login">Login</router-link>
    </form>
    <div class="error" v-if="authError">
      {{ authError }}
    </div>
  </div>
</template>

<script setup>
import { useRegister } from '@/composables/useRegister'

const { email, password, loading, authError, registerUser } = useRegister()
</script>

<style lang="scss" scoped>



</style>
