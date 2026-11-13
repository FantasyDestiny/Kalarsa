import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const STORAGE_KEY = 'kalarsa_user_session'

function toAdminUser(authUser) {
  return {
    id: authUser.id,
    name: authUser.user_metadata?.name || 'Pengurus Kelas (Admin)',
    email: authUser.email,
    role: 'admin',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    provider: 'supabase'
  }
}

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

  // Admin login diverifikasi oleh Supabase Auth.
  // Role admin hanya ada di JWT app_metadata, yang tidak bisa ditulis klien.
  async loginAdmin(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase belum dikonfigurasi. Login admin tidak tersedia.' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error || !data?.user) {
        return { user: null, error: 'Email atau password admin salah!' }
      }

      if (data.user.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut()
        return { user: null, error: 'Akun ini tidak memiliki akses admin.' }
      }

      const adminUser = toAdminUser(data.user)
      this.setCurrentUser(adminUser)
      return { user: adminUser, error: null }
    } catch (err) {
      console.warn('Admin login error:', err)
      return { user: null, error: 'Gagal terhubung ke server autentikasi.' }
    }
  },

  // Dipanggil saat aplikasi dimuat. Memastikan sesi admin di localStorage
  // masih didukung sesi Supabase yang valid (mencegah admin palsu di UI).
  async restoreSession() {
    const stored = this.getCurrentUser()

    if (!isSupabaseConfigured || !supabase) return stored

    try {
      const { data } = await supabase.auth.getSession()
      const authUser = data?.session?.user

      if (authUser?.app_metadata?.role === 'admin') {
        const adminUser = toAdminUser(authUser)
        this.setCurrentUser(adminUser)
        return adminUser
      }

      // Ada flag admin di localStorage tapi tidak ada sesi Supabase yang sah.
      if (stored?.role === 'admin') {
        this.setCurrentUser(null)
        return null
      }

      return stored
    } catch (err) {
      console.warn('Restore session error:', err)
      return stored
    }
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
