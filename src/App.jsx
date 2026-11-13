import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import InformationView from './components/InformationView'
import ScheduleView from './components/ScheduleView'
import AssignmentView from './components/AssignmentView'
import GroupSpinnerView from './components/GroupSpinnerView'
import AuthModal from './components/AuthModal'
import { DataService } from './services/dataService'
import { AuthService } from './services/authService'
import { CheckCircle } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'schedule' | 'assignments' | 'spinner'
  const [currentUser, setCurrentUser] = useState(() => AuthService.getCurrentUser())
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingProfile, setPendingProfile] = useState(null)

  const [announcements, setAnnouncements] = useState([])
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [userCompletedTaskIds, setUserCompletedTaskIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const isAdmin = currentUser?.role === 'admin'

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [loadedAnnouncements, loadedCourses, loadedAssignments] = await Promise.all([
          DataService.getAnnouncements(),
          DataService.getCourses(),
          DataService.getAssignments()
        ])
        setAnnouncements(loadedAnnouncements || [])
        setCourses(loadedCourses || [])
        setAssignments(loadedAssignments || [])
      } catch (err) {
        console.error('Failed to load initial data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Verify stored admin session against Supabase on load
  useEffect(() => {
    let active = true
    AuthService.restoreSession().then(user => {
      if (!active) return
      if (user?.needsProfile) {
        setPendingProfile(user)
        setCurrentUser(null)
        setIsAuthModalOpen(true)
      } else {
        setCurrentUser(user)
      }
    })
    return () => { active = false }
  }, [])

  // Tangkap sesi baru (mis. setelah user klik link verifikasi email)
  useEffect(() => {
    const subscription = AuthService.onAuthChange(async () => {
      const user = await AuthService.restoreSession()
      if (user?.needsProfile) {
        setPendingProfile(user)
        setCurrentUser(null)
        setIsAuthModalOpen(true)
      } else if (user) {
        setPendingProfile(null)
        setCurrentUser(user)
      }
    })
    return () => subscription?.unsubscribe()
  }, [])

  // Load User-Specific Completed Tasks when currentUser changes
  useEffect(() => {
    async function loadUserTasks() {
      if (currentUser?.id) {
        try {
          const completedIds = await DataService.getUserCompletedTasks(currentUser.id)
          setUserCompletedTaskIds(completedIds || [])
        } catch (e) {
          console.warn('Failed to load user task completions:', e)
        }
      } else {
        setUserCompletedTaskIds([])
      }
    }
    loadUserTasks()
  }, [currentUser])

  // AUTH HANDLERS
  const handleLoginSuccess = (user) => {
    setPendingProfile(null)
    setCurrentUser(user)
    setIsAuthModalOpen(false)
    showToast(
      user.role === 'admin'
        ? `Selamat datang Admin! Mode Pengurus diaktifkan.`
        : `Berhasil masuk sebagai ${user.name}! Checklist tugas siap disimpan.`
    )
  }

  const handleLogout = async () => {
    await AuthService.logout()
    setCurrentUser(null)
    setPendingProfile(null)
    showToast('Anda telah keluar dari akun.', 'info')
  }

  // USER TASK COMPLETION TOGGLE
  const handleToggleUserTaskCompletion = async (assignmentId) => {
    if (!currentUser?.id) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      const updatedIds = await DataService.toggleUserTaskCompletion(currentUser.id, assignmentId)
      setUserCompletedTaskIds(updatedIds)
      const isNowCompleted = updatedIds.includes(assignmentId)
      showToast(
        isNowCompleted ? 'Tugas ditandai selesai di akun Anda!' : 'Tugas dikembalikan ke daftar belum selesai.',
        isNowCompleted ? 'success' : 'info'
      )
    } catch {
      showToast('Gagal memperbarui status checklist tugas', 'error')
    }
  }

  // ANNOUNCEMENTS HANDLERS
  const handleAddAnnouncement = async (annData) => {
    try {
      const added = await DataService.addAnnouncement(annData)
      setAnnouncements(prev => [added, ...prev])
      showToast('Informasi baru berhasil diterbitkan!')
    } catch {
      showToast('Gagal menerbitkan informasi', 'error')
    }
  }

  const handleUpdateAnnouncement = async (id, updates) => {
    try {
      const updated = await DataService.updateAnnouncement(id, updates)
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a))
      showToast('Informasi berhasil diperbarui!')
    } catch {
      showToast('Gagal memperbarui informasi', 'error')
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    try {
      await DataService.deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      showToast('Informasi berhasil dihapus!')
    } catch {
      showToast('Gagal menghapus informasi', 'error')
    }
  }

  // COURSE HANDLERS
  const handleAddCourse = async (courseData) => {
    try {
      const added = await DataService.addCourse(courseData)
      setCourses(prev => [...prev, added])
      showToast('Jadwal mata kuliah berhasil ditambahkan!')
    } catch {
      showToast('Gagal menambahkan jadwal', 'error')
    }
  }

  const handleUpdateCourse = async (id, updates) => {
    try {
      const updated = await DataService.updateCourse(id, updates)
      setCourses(prev => prev.map(c => c.id === id ? updated : c))
      showToast('Jadwal mata kuliah berhasil diperbarui!')
    } catch {
      showToast('Gagal memperbarui jadwal', 'error')
    }
  }

  const handleDeleteCourse = async (id) => {
    try {
      await DataService.deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
      showToast('Jadwal berhasil dihapus!')
    } catch {
      showToast('Gagal menghapus jadwal', 'error')
    }
  }

  // ASSIGNMENT HANDLERS (Admin CRUD)
  const handleAddAssignment = async (assignmentData) => {
    try {
      const added = await DataService.addAssignment(assignmentData)
      setAssignments(prev => [...prev, added])
      showToast('Tugas baru berhasil ditambahkan!')
    } catch {
      showToast('Gagal menambahkan tugas', 'error')
    }
  }

  const handleUpdateAssignment = async (id, updates) => {
    try {
      const updated = await DataService.updateAssignment(id, updates)
      setAssignments(prev => prev.map(a => a.id === id ? updated : a))
      showToast('Tugas berhasil diperbarui!')
    } catch {
      showToast('Gagal memperbarui tugas', 'error')
    }
  }

  const handleDeleteAssignment = async (id) => {
    try {
      await DataService.deleteAssignment(id)
      setAssignments(prev => prev.filter(a => a.id !== id))
      showToast('Tugas berhasil dihapus!')
    } catch {
      showToast('Gagal menghapus tugas', 'error')
    }
  }

  // Count active assignments & announcements for navbar badges
  const activeAssignmentCount = assignments.filter(a => !userCompletedTaskIds.includes(a.id)).length
  const totalAnnouncementCount = announcements.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/60 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        assignmentCount={activeAssignmentCount}
        announcementCount={totalAnnouncementCount}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-slate-500">Memuat data KALARSA...</p>
          </div>
        ) : (
          <>
            {activeTab === 'info' && (
              <InformationView
                announcements={announcements}
                onAdd={handleAddAnnouncement}
                onUpdate={handleUpdateAnnouncement}
                onDelete={handleDeleteAnnouncement}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleView
                courses={courses}
                onAdd={handleAddCourse}
                onUpdate={handleUpdateCourse}
                onDelete={handleDeleteCourse}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'assignments' && (
              <AssignmentView
                assignments={assignments}
                courses={courses}
                onAdd={handleAddAssignment}
                onUpdate={handleUpdateAssignment}
                onDelete={handleDeleteAssignment}
                isAdmin={isAdmin}
                currentUser={currentUser}
                userCompletedTaskIds={userCompletedTaskIds}
                onToggleUserTaskCompletion={handleToggleUserTaskCompletion}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'spinner' && (
              <GroupSpinnerView />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/70 backdrop-blur-md py-6 mb-16 md:mb-0 text-center text-xs text-slate-500">
        <p className="font-medium">
          <span className="font-display font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">KALARSA</span> &bull; Portal Akademik, Jadwal & Informasi Kegiatan ✨
        </p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => { setIsAuthModalOpen(false); setPendingProfile(null) }}
        onLoginSuccess={handleLoginSuccess}
        pendingProfile={pendingProfile}
        onNeedsProfile={(user) => { setPendingProfile(user); setIsAuthModalOpen(true) }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 animate-bounce-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold shadow-xl text-white ${
            toast.type === 'error'
              ? 'bg-gradient-to-r from-rose-600 to-red-600'
              : toast.type === 'info'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
