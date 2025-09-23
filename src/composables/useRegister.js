import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'

export function useRegister() {
  const router = useRouter()
  const { register, loading, authError } = useAuth()

  const email = ref('')
  const password = ref('')

  const registerUser = async () => {
    await register(email.value, password.value)

    // Redirect on successful registration
    if (!authError.value) {
      router.push('/login')
    }
  }

  return {
    email,
    password,
    loading,
    authError,
    registerUser
  }
}
