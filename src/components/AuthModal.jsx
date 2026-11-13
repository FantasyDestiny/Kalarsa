import React, { useState, useEffect } from 'react'
import { X, Shield, Lock, User, KeyRound, AlertCircle, Sparkles, GraduationCap, Hash, BookOpen, Mail, CheckCircle2 } from 'lucide-react'
import { AuthService } from '../services/authService'

export default function AuthModal({ isOpen, onClose, onLoginSuccess, pendingProfile, onNeedsProfile }) {
  const [activeTab, setActiveTab] = useState('student') // 'student' | 'register' | 'admin'
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  // Login (email + password)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Admin
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  // Register
  const [regName, setRegName] = useState('')
  const [regNim, setRegNim] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regTheoryClass, setRegTheoryClass] = useState('A')
  const [regPracticeClass, setRegPracticeClass] = useState('A')

  // Lengkapi profil (Google / akun lama tanpa data kelas)
  const [profileName, setProfileName] = useState('')
  const [profileNim, setProfileNim] = useState('')
  const [profileTheoryClass, setProfileTheoryClass] = useState('A')
  const [profilePracticeClass, setProfilePracticeClass] = useState('A')

  const completingProfile = Boolean(pendingProfile)

  useEffect(() => {
    if (!pendingProfile) return
    setProfileName(pendingProfile.name || '')
    setProfileNim(pendingProfile.nim || '')
    setProfileTheoryClass(pendingProfile.theory_class || 'A')
    setProfilePracticeClass(pendingProfile.practice_class || 'A')
    setError('')
    setInfo('')
  }, [pendingProfile])

  if (!isOpen) return null

  const resetForm = () => {
    setError('')
    setInfo('')
    setActiveTab('student')
    setLoginEmail('')
    setLoginPassword('')
    setAdminEmail('')
    setAdminPassword('')
    setRegName('')
    setRegNim('')
    setRegEmail('')
    setRegPassword('')
    setRegPasswordConfirm('')
    setRegTheoryClass('A')
    setRegPracticeClass('A')
    setProfileName('')
    setProfileNim('')
    setProfileTheoryClass('A')
    setProfilePracticeClass('A')
  }

  const closeModal = () => {
    onClose()
    resetForm()
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setError('')
    setInfo('')
  }

  // ── Masuk: email + password ─────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const result = await AuthService.loginStudent(loginEmail, loginPassword)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.needsProfile) {
      onNeedsProfile?.(result.pendingUser)
      return
    }

    onLoginSuccess(result.user)
    closeModal()
  }

  // ── Masuk: Google ───────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('')
    setInfo('')
    setLoading(true)
    const result = await AuthService.loginWithGoogle()
    if (result.error) {
      setError(result.error)
      setLoading(false)
    }
    // Jika berhasil, browser diarahkan ke Google (loading dibiarkan aktif).
  }

  // ── Daftar: email + password ────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (regPassword !== regPasswordConfirm) {
      setError('Konfirmasi password tidak sama.')
      return
    }

    setLoading(true)
    const result = await AuthService.signUpStudent({
      name: regName,
      nim: regNim,
      email: regEmail,
      password: regPassword,
      theoryClass: regTheoryClass,
      practiceClass: regPracticeClass
    })
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.needsEmailConfirm) {
      setInfo(
        `Pendaftaran berhasil! Cek email ${result.email} untuk konfirmasi, lalu masuk dengan email & password Anda.`
      )
      setLoginEmail(result.email)
      setRegPassword('')
      setRegPasswordConfirm('')
      setActiveTab('student')
      return
    }

    onLoginSuccess(result.user)
    closeModal()
  }

  // ── Lengkapi profil ─────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!profileNim.trim()) {
      setError('NIM wajib diisi.')
      return
    }

    setLoading(true)
    const result = await AuthService.completeProfile({
      name: profileName,
      nim: profileNim,
      theoryClass: profileTheoryClass,
      practiceClass: profilePracticeClass
    })
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onLoginSuccess(result.user)
    closeModal()
  }

  // ── Admin ───────────────────────────────────────────────
  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await AuthService.loginAdmin(adminEmail, adminPassword)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onLoginSuccess(result.user)
      closeModal()
    }
  }

  const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-fuchsia-500 focus:outline-none'
  const selectCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-fuchsia-500 focus:outline-none bg-white'

  const headerTitle = completingProfile
    ? 'Lengkapi Profil Kelas'
    : activeTab === 'register'
    ? 'Buat Akun Baru'
    : activeTab === 'admin'
    ? 'Masuk sebagai Admin'
    : 'Masuk ke Akun Anda'

  const headerSubtitle = completingProfile
    ? 'Sekali lagi saja — isi data berikut agar jadwal & tugas sesuai kelasmu.'
    : activeTab === 'register'
    ? 'Daftar dengan email & password, atau lanjut dengan Google.'
    : 'Kelola jadwal, informasi kelas, dan simpan progress checklist tugas.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-purple-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-fuchsia-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={closeModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 pt-1">
          <span className="text-2xl font-display font-black tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent select-none">
            KALARSA
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-1">{headerTitle}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{headerSubtitle}</p>
        </div>

        {/* Tab Buttons — disembunyikan saat melengkapi profil */}
        {!completingProfile && (
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl mb-5">
            {[
              { key: 'student', label: 'Masuk', icon: <User className="w-3.5 h-3.5 text-fuchsia-600" /> },
              { key: 'register', label: 'Daftar', icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> },
              { key: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5 text-indigo-600" /> }
            ].map(tab => (
              <button key={tab.key} type="button" onClick={() => handleTabSwitch(tab.key)}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}>
                {tab.icon}<span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{info}</span>
          </div>
        )}

        {/* ─── LENGKAPI PROFIL ─── */}
        {completingProfile && (
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed">
              Akun Anda sudah terhubung. Data ini dipakai untuk menyesuaikan jadwal, tugas, dan daftar kelompok.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </label>
              <input type="email" value={pendingProfile?.email || ''} disabled
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-2xl text-xs font-medium text-slate-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-fuchsia-600" /> Nama Lengkap *
              </label>
              <input type="text" required placeholder="Contoh: Budi Santoso"
                value={profileName} onChange={e => setProfileName(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-fuchsia-600" /> NIM *
              </label>
              <input type="text" required placeholder="Contoh: 2301234567"
                value={profileNim} onChange={e => setProfileNim(e.target.value)} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Kelas Teori *
                </label>
                <select value={profileTheoryClass} onChange={e => setProfileTheoryClass(e.target.value)} className={selectCls}>
                  <option value="A">Kelas A</option>
                  <option value="B">Kelas B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Kelas Praktek *
                </label>
                <select value={profilePracticeClass} onChange={e => setProfilePracticeClass(e.target.value)} className={selectCls}>
                  <option value="A">Kelas A</option>
                  <option value="B">Kelas B</option>
                  <option value="C">Kelas C</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-500/20">
              {loading ? 'Menyimpan...' : 'Simpan & Masuk'}
            </button>
          </form>
        )}

        {/* ─── MASUK (MAHASISWA) ─── */}
        {!completingProfile && activeTab === 'student' && (
          <div className="space-y-3">
            <div className="p-3 bg-fuchsia-50 border border-fuchsia-100 rounded-2xl text-[11px] text-fuchsia-900 leading-relaxed">
              Masuk untuk menyimpan checklist tugas dan data kelas Anda.
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-2xl text-xs font-bold text-slate-700 transition shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Mengalihkan...' : 'Masuk dengan Google'}
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">atau email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <input type="email" required autoComplete="email" placeholder="nama@gmail.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <input type="password" required autoComplete="current-password" placeholder="Password"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                {loading ? 'Memeriksa...' : 'Masuk'}
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-400 pt-1">
              Belum punya akun?{' '}
              <button onClick={() => handleTabSwitch('register')} className="font-bold text-fuchsia-600 hover:underline">
                Daftar Sekarang
              </button>
            </p>
          </div>
        )}

        {/* ─── DAFTAR ─── */}
        {!completingProfile && activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] text-emerald-900 leading-relaxed">
              Buat akun dengan email & password, lalu lengkapi data kelas. Bisa juga langsung pakai Google.
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border-2 border-slate-200 bg-white hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 transition shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Daftar dengan Google
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">atau email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-fuchsia-600" /> Nama Lengkap *
              </label>
              <input type="text" required placeholder="Contoh: Budi Santoso"
                value={regName} onChange={e => setRegName(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-fuchsia-600" /> NIM *
              </label>
              <input type="text" required placeholder="Contoh: 2301234567"
                value={regNim} onChange={e => setRegNim(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-fuchsia-600" /> Email *
              </label>
              <input type="email" required autoComplete="email" placeholder="nama@gmail.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-fuchsia-600" /> Password *
                </label>
                <input type="password" required minLength={6} autoComplete="new-password" placeholder="Min. 6 karakter"
                  value={regPassword} onChange={e => setRegPassword(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-fuchsia-600" /> Ulangi Password *
                </label>
                <input type="password" required minLength={6} autoComplete="new-password" placeholder="Ulangi password"
                  value={regPasswordConfirm} onChange={e => setRegPasswordConfirm(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Kelas Teori *
                </label>
                <select value={regTheoryClass} onChange={e => setRegTheoryClass(e.target.value)} className={selectCls}>
                  <option value="A">Kelas A</option>
                  <option value="B">Kelas B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Kelas Praktek *
                </label>
                <select value={regPracticeClass} onChange={e => setRegPracticeClass(e.target.value)} className={selectCls}>
                  <option value="A">Kelas A</option>
                  <option value="B">Kelas B</option>
                  <option value="C">Kelas C</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Kelas Teori</strong> (A/B): jadwal & tugas mata kuliah teori.<br />
              <strong className="text-slate-700">Kelas Praktek</strong> (A/B/C): jadwal & tugas praktikum.
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-500/20">
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Sudah punya akun?{' '}
              <button type="button" onClick={() => handleTabSwitch('student')} className="font-bold text-fuchsia-600 hover:underline">
                Masuk
              </button>
            </p>
          </form>
        )}

        {/* ─── ADMIN ─── */}
        {!completingProfile && activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-[11px] text-indigo-900 leading-relaxed">
              Khusus pengurus kelas untuk mengelola jadwal, gedung, pengumuman, dan link Google Drive. Login diverifikasi oleh Supabase Auth.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Admin</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input type="email" required placeholder="admin@kalarsa.app" value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password Admin</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input type="password" required placeholder="Password Admin" value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-500/20">
              {loading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
