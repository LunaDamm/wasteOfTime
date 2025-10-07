<template>
  <div class="register-view pt-10 flex flex-col gap-4">
    <h1 class="text-3xl font-bold text-indigo-300 text-center">Create an account</h1>
    <form class="flex flex-col" @submit.prevent="registerUser">
      <input class="border border-indigo-300 p-2 !mb-4 rounded" type="email" v-model="email" placeholder="Email" required />
      <input class="border border-indigo-300 p-2 !mb-4 rounded" type="password" v-model="password" placeholder="Password" required />
      <input class="border border-indigo-300 p-2 !mb-4 rounded" type="text" v-model="displayName" placeholder="Display Name" required />
      <button class="bg-indigo-300 text-white p-2 rounded" type="submit" :disabled="loading">Register</button>
      <router-link to="/login" class="!text-indigo-300 !text-center">Login</router-link>
    </form>
    <div class="error text-red-500 mt-2" v-if="authError">
      {{ authError }}
    </div>
  </div>
</template>

<script setup>
import { useRegister } from '@/composables/useRegister'

const { email, password, displayName, loading, authError, registerUser } = useRegister()
</script>

<style scoped>
</style>
