import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || '',
  password: import.meta.env.VITE_ADMIN_PASSWORD || ''
}

const STORAGE_KEY = 'kalarsa_user_session'

export const AuthService = {
  getCurrentUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  // Admin Login with specific credentials
  async loginAdmin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminUser = {
        id: 'admin_kalarsa_root',
        name: 'Pengurus Kelas (Admin)',
        email: 'admin@kalarsa.local',
        role: 'admin',
        avatar_url: null,
        provider: 'admin'
      }
      this.setCurrentUser(adminUser)
      return { user: adminUser, error: null }
    }
    return { user: null, error: 'Username atau Password Admin salah!' }
  },

  // Google Login (Supabase OAuth with seamless fallback)
  async loginWithGoogle() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        })
        if (!error && data?.url) {
          window.location.href = data.url
          return { success: true }
        }
      } catch (err) {
        console.warn('Supabase Google OAuth initiation error:', err)
      }
    }

    // Interactive Google Profile Generator (fallback when Google OAuth is not yet enabled in Supabase console)
    const emailPrompt = window.prompt(
      'Masuk dengan Akun Google:\nMasukkan alamat email Google / kampus Anda (misal: nama@gmail.com):',
      'mahasiswa@kampus.ac.id'
    )
    if (!emailPrompt) return { error: 'Login dibatalkan' }

    const defaultName = emailPrompt.split('@')[0].replace(/[._]/g, ' ')
    const nameFormatted = defaultName.charAt(0).toUpperCase() + defaultName.slice(1)

    const googleUser = {
      id: `google_${emailPrompt.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: nameFormatted,
      email: emailPrompt.toLowerCase().trim(),
      role: 'student',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameFormatted)}&backgroundColor=6366f1,ec4899,f59e0b`,
      provider: 'google'
    }

    this.setCurrentUser(googleUser)
    return { user: googleUser, error: null }
  },

  // Custom Quick Google Login helper
  quickGoogleLogin(name, email) {
    const googleUser = {
      id: `google_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: name,
      email: email.toLowerCase().trim(),
      role: 'student',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1,ec4899,f59e0b`,
      provider: 'google'
    }
    this.setCurrentUser(googleUser)
    return googleUser
  },

  async logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Supabase signOut error:', e)
      }
    }
    this.setCurrentUser(null)
    return true
  }
}
