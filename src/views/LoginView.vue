<template>
  <div class="login-view">
    <h1>Hello 👋🏻</h1>
    <form @submit.prevent="loginUser">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">Login</button>
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

.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    input {
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem;
      font-size: 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }
  }

  .error {
    margin-top: 1rem;
    color: red;
  }
}

</style>
