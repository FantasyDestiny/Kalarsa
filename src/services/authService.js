import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const STORAGE_KEY = 'kalarsa_user_session'

function supabaseReady() {
  return Boolean(isSupabaseConfigured && supabase)
}

// Terjemahkan pesan Supabase menjadi pesan yang bisa dipahami pengguna.
function mapAuthError(message) {
  const m = String(message || '').toLowerCase()
  if (m.includes('rate limit')) {
    return 'Pengiriman email konfirmasi sedang dibatasi Supabase. Matikan "Confirm email" di dashboard Supabase, lalu coba lagi.'
  }
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already exists')) {
    return 'Email ini sudah terdaftar. Silakan masuk.'
  }
  if (m.includes('password should be') || m.includes('weak password')) {
    return 'Password terlalu lemah. Gunakan minimal 6 karakter.'
  }
  if (m.includes('invalid email')) {
    return 'Format email tidak valid.'
  }
  if (m.includes('signups not allowed')) {
    return 'Pendaftaran akun sedang dinonaktifkan.'
  }
  return message || 'Terjadi kesalahan. Coba lagi.'
}

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

function toStudentUser(authUser, profile) {
  const meta = authUser.user_metadata || {}
  return {
    id: authUser.id,
    name: profile?.name || meta.name || meta.full_name || (authUser.email || '').split('@')[0],
    email: profile?.email || authUser.email,
    role: 'student',
    nim: profile?.nim || meta.nim || '',
    theory_class: profile?.theory_class || meta.theory_class || 'A',
    practice_class: profile?.practice_class || meta.practice_class || 'A',
    avatar_url: meta.avatar_url || null,
    provider: authUser.app_metadata?.provider || 'email'
  }
}

async function fetchProfile(userId) {
  if (!supabaseReady() || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('Fetch profile error:', error.message)
    return null
  }
  return data
}

async function saveProfileRow(profile) {
  if (!supabaseReady() || !profile?.user_id) return null
  const { data, error } = await supabase
    .from('profiles')
    .upsert([{ ...profile, updated_at: new Date().toISOString() }], { onConflict: 'user_id' })
    .select()
    .single()
  if (error) {
    console.warn('Save profile error:', error.message)
    return null
  }
  return data
}

// Profil dibuat otomatis saat login pertama jika datanya sudah dikirim saat daftar.
async function ensureProfile(authUser) {
  const existing = await fetchProfile(authUser.id)
  if (existing) return existing

  const meta = authUser.user_metadata || {}
  if (!meta.nim) return null

  return saveProfileRow({
    user_id: authUser.id,
    name: meta.name || meta.full_name || (authUser.email || '').split('@')[0],
    nim: meta.nim,
    email: authUser.email,
    theory_class: meta.theory_class || 'A',
    practice_class: meta.practice_class || 'A'
  })
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

  // ── ADMIN ───────────────────────────────────────────────
  async loginAdmin(email, password) {
    if (!supabaseReady()) {
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

  // ── MAHASISWA: DAFTAR (email + password) ────────────────
  async signUpStudent({ name, nim, email, password, theoryClass, practiceClass }) {
    if (!supabaseReady()) {
      return { error: 'Supabase belum dikonfigurasi.' }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            nim: nim.trim(),
            theory_class: theoryClass,
            practice_class: practiceClass
          }
        }
      })

      if (error) {
        return { error: mapAuthError(error.message) }
      }

      // Supabase sengaja mengembalikan user tanpa identity jika email sudah dipakai.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { error: 'Email ini sudah terdaftar. Silakan masuk.' }
      }

      if (!data.user) {
        return { error: 'Pendaftaran gagal. Coba lagi.' }
      }

      // Konfirmasi email dimatikan -> sesi langsung ada, profil langsung disimpan.
      if (data.session) {
        const profile = await saveProfileRow({
          user_id: data.user.id,
          name: name.trim(),
          nim: nim.trim(),
          email: email.trim(),
          theory_class: theoryClass,
          practice_class: practiceClass
        })
        const user = toStudentUser(data.user, profile)
        this.setCurrentUser(user)
        return { user }
      }

      // Konfirmasi email aktif -> belum ada sesi. Profil dibuat otomatis saat login pertama.
      return { user: null, needsEmailConfirm: true, email: email.trim() }
    } catch (err) {
      console.warn('Sign up error:', err)
      return { error: 'Gagal mendaftar. Periksa koneksi Anda.' }
    }
  },

  // ── MAHASISWA: MASUK (email + password) ─────────────────
  async loginStudent(email, password) {
    if (!supabaseReady()) {
      return { user: null, error: 'Supabase belum dikonfigurasi.' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error || !data?.user) {
        const notConfirmed = /confirm|verified/i.test(error?.message || '')
        return {
          user: null,
          error: notConfirmed
            ? 'Email belum dikonfirmasi. Cek kotak masuk email Anda.'
            : 'Email atau password salah!'
        }
      }

      if (data.user.app_metadata?.role === 'admin') {
        await supabase.auth.signOut()
        return { user: null, error: 'Akun ini admin. Silakan masuk lewat tab Admin.' }
      }

      const profile = await ensureProfile(data.user)

      if (!profile) {
        // Belum punya data kelas -> minta lengkapi profil.
        return {
          user: null,
          needsProfile: true,
          pendingUser: toStudentUser(data.user, null)
        }
      }

      const user = toStudentUser(data.user, profile)
      this.setCurrentUser(user)
      return { user }
    } catch (err) {
      console.warn('Student login error:', err)
      return { user: null, error: 'Gagal terhubung ke server autentikasi.' }
    }
  },

  // ── MAHASISWA: MASUK DENGAN GOOGLE ──────────────────────
  async loginWithGoogle() {
    if (!supabaseReady()) {
      return { error: 'Supabase belum dikonfigurasi.' }
    }

    try {
      const redirectTo = window.location.origin + (import.meta.env.BASE_URL || '/')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })

      if (error || !data?.url) {
        return {
          error: 'Login Google belum tersedia. Aktifkan provider Google di dashboard Supabase.'
        }
      }

      window.location.assign(data.url)
      return { redirecting: true }
    } catch (err) {
      console.warn('Google login error:', err)
      return { error: 'Gagal memulai login Google.' }
    }
  },

  // ── LENGKAPI PROFIL (setelah Google / email tanpa data) ─
  async completeProfile({ name, nim, theoryClass, practiceClass }) {
    if (!supabaseReady()) return { error: 'Supabase belum dikonfigurasi.' }

    try {
      const { data } = await supabase.auth.getUser()
      const authUser = data?.user

      if (!authUser) {
        return { error: 'Sesi login tidak ditemukan. Silakan masuk ulang.' }
      }

      const profile = await saveProfileRow({
        user_id: authUser.id,
        name: name.trim(),
        nim: nim.trim(),
        email: authUser.email,
        theory_class: theoryClass,
        practice_class: practiceClass
      })

      if (!profile) {
        return { error: 'Gagal menyimpan profil. Coba lagi.' }
      }

      const user = toStudentUser(authUser, profile)
      this.setCurrentUser(user)
      return { user }
    } catch (err) {
      console.warn('Complete profile error:', err)
      return { error: 'Gagal menyimpan profil.' }
    }
  },

  // ── SESI ────────────────────────────────────────────────
  // Dipanggil saat aplikasi dimuat. Mengembalikan user, { needsProfile: true },
  // atau null jika tidak ada sesi Supabase yang sah.
  async restoreSession() {
    const stored = this.getCurrentUser()

    if (!supabaseReady()) return stored

    try {
      const { data } = await supabase.auth.getSession()
      const authUser = data?.session?.user

      if (!authUser) {
        // Sesi lama (mis. login palsu berbasis localStorage) tidak berlaku lagi.
        if (stored) this.setCurrentUser(null)
        return null
      }

      if (authUser.app_metadata?.role === 'admin') {
        const adminUser = toAdminUser(authUser)
        this.setCurrentUser(adminUser)
        return adminUser
      }

      const profile = await fetchProfile(authUser.id)

      if (!profile) {
        return { ...toStudentUser(authUser, null), needsProfile: true }
      }

      const user = toStudentUser(authUser, profile)
      this.setCurrentUser(user)
      return user
    } catch (err) {
      console.warn('Restore session error:', err)
      return stored
    }
  },

  async logout() {
    if (supabaseReady()) {
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
