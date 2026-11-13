import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Clock, Calendar, CheckCircle2, ListFilter, Users, User, Sparkles, FolderUp, ExternalLink, Check, AlertCircle } from 'lucide-react'

export default function AssignmentView({
  assignments,
  courses,
  onAdd,
  onUpdate,
  onDelete,
  isAdmin,
  currentUser,
  userCompletedTaskIds = [],
  onToggleUserTaskCompletion,
  onOpenAuth
}) {
  const [subTab, setSubTab] = useState('list') // 'list' | 'submissions'
  const [filterStatus, setFilterStatus] = useState('active') // 'all', 'active', 'completed'
  const [filterCourse, setFilterCourse] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    course_name: '',
    title: '',
    description: '',
    assigned_date: new Date().toISOString().split('T')[0],
    deadline: '',
    type: 'individual',
    drive_link: '',
    class_type: 'all',   // 'all' | 'theory' | 'practice'
    class_target: 'all'  // 'all' | 'A' | 'B' | 'C'
  })

  // Check if a task is marked completed by current user
  const isTaskCompletedByUser = (taskId) => {
    return userCompletedTaskIds.includes(taskId)
  }

  // Format countdown & urgency helper
  const getDeadlineMeta = (deadlineStr, taskId) => {
    const isCompleted = isTaskCompletedByUser(taskId)

    if (isCompleted) {
      return {
        label: '✓ Selesai',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        cardBorder: 'border-emerald-300 bg-emerald-50/20'
      }
    }

    const now = new Date()
    const deadline = new Date(deadlineStr)
    const diffMs = deadline - now

    if (diffMs <= 0) {
      return {
        label: '⚠️ Tenggat Terlewat',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        cardBorder: 'border-rose-300 ring-2 ring-rose-200'
      }
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 24) {
      return {
        label: `🔥 Sisa ${diffHours} jam lagi!`,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-extrabold',
        cardBorder: 'border-rose-400 ring-2 ring-rose-300/30'
      }
    } else if (diffDays <= 3) {
      return {
        label: `⏳ Sisa ${diffDays} hari lagi`,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        cardBorder: 'border-amber-300'
      }
    } else {
      return {
        label: `📅 Sisa ${diffDays} hari`,
        badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 font-medium',
        cardBorder: 'border-slate-200'
      }
    }
  }

  // Filter assignments based on user-specific completion
  const filteredAssignments = assignments.filter(a => {
    const isCompleted = isTaskCompletedByUser(a.id)
    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'completed' ? isCompleted :
      !isCompleted // 'active'

    const matchesCourse = filterCourse === 'all' ? true : a.course_name === filterCourse

    return matchesStatus && matchesCourse
  })

  // Calculation for user progress bar
  const totalTasks = assignments.length
  const completedCount = assignments.filter(a => isTaskCompletedByUser(a.id)).length
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const handleOpenAdd = () => {
    setEditingAssignment(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 3)
    tomorrow.setHours(23, 59, 0, 0)
    const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

    setFormData({
      course_name: courses.length > 0 ? courses[0].name : '',
      title: '',
      description: '',
      assigned_date: new Date().toISOString().split('T')[0],
      deadline: localIso,
      type: 'individual',
      drive_link: '',
      class_type: 'all',
      class_target: 'all'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment)
    let deadlineIso = ''
    try {
      const d = new Date(assignment.deadline)
      deadlineIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    } catch {
      deadlineIso = ''
    }

    setFormData({
      course_name: assignment.course_name,
      title: assignment.title,
      description: assignment.description || '',
      assigned_date: assignment.assigned_date || new Date().toISOString().split('T')[0],
      deadline: deadlineIso,
      type: assignment.type || 'individual',
      drive_link: assignment.drive_link || '',
      class_type: assignment.class_type || 'all',
      class_target: assignment.class_target || 'all'
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.deadline) return

    const payload = {
      ...formData,
      deadline: new Date(formData.deadline).toISOString()
    }

    if (editingAssignment) {
      onUpdate(editingAssignment.id, payload)
    } else {
      onAdd(payload)
    }
    setModalOpen(false)
  }

  const handleToggleChecklist = (assignmentId) => {
    if (!currentUser) {
      onOpenAuth()
      return
    }
    onToggleUserTaskCompletion(assignmentId)
  }

  const totalDriveLinks = assignments.filter(a => Boolean(a.drive_link)).length

  return (
    <div className="space-y-6">
      {/* Colorful Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 p-6 sm:p-8 text-white shadow-lg shadow-rose-500/15">
        <div className="absolute -right-6 -bottom-8 opacity-20 transform -rotate-12">
          <CheckCircle2 className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Tugas & Pengumpulan Drive
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Daftar Tugas & Pengumpulan
            </h2>
            <p className="text-sm text-rose-100 max-w-xl">
              Ceklis tugas selesai tersimpan khusus di akun Anda dan kumpulkan tugas langsung via Google Drive.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Tugas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar Akun Mahasiswa */}
      {currentUser && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-purple-100 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>Progress Akun Anda ({currentUser.name})</span>
            </span>
            <span className="font-black text-fuchsia-600">
              {completedCount} dari {totalTasks} Tugas Selesai ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Mode Sub-Tab: Daftar Tugas vs Pengumpulan Tugas (Google Drive) */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-xs max-w-fit">
        <button
          onClick={() => setSubTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'list'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Daftar Tugas</span>
        </button>

        <button
          onClick={() => setSubTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'submissions'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderUp className="w-4 h-4" />
          <span>Pengumpulan Tugas (Drive)</span>
          {totalDriveLinks > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              subTab === 'submissions' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {totalDriveLinks}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================= */}
      {/* SUB-VIEW 1: PENGUMPULAN TUGAS (GOOGLE DRIVE HUB) */}
      {/* ======================================================= */}
      {subTab === 'submissions' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 rounded-2xl border border-blue-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FolderUp className="w-4 h-4" />
            </div>
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong className="font-bold">Hub Pengumpulan Tugas ke Google Drive:</strong> Klik tombol tugas di bawah ini untuk langsung menuju folder Google Drive pengumpulan tugas yang telah dibagikan oleh pengurus kelas / admin.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(assignment => {
              const hasLink = Boolean(assignment.drive_link && assignment.drive_link.trim())
              const meta = getDeadlineMeta(assignment.deadline, assignment.id)

              return (
                <div
                  key={assignment.id}
                  className={`bg-white/95 backdrop-blur-md rounded-3xl border p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${
                    hasLink ? 'border-blue-200/90 hover:shadow-md hover:border-blue-300' : 'border-slate-200/70 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {assignment.course_name}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {assignment.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Deadline: <strong className="text-slate-800">{new Date(assignment.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB</strong></span>
                    </div>
                  </div>

                  {/* Submission Link Action Button */}
                  <div className="pt-4 mt-3 border-t border-slate-100">
                    {hasLink ? (
                      <a
                        href={assignment.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5"
                      >
                        <FolderUp className="w-4 h-4" />
                        <span>Kumpulkan di Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    ) : (
                      <div className="text-center py-2 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 font-medium">
                        {isAdmin ? 'Link Drive belum diatur. Klik "Edit" untuk menambahkan.' : 'Link Drive belum dibagikan admin.'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* SUB-VIEW 2: DAFTAR TUGAS LENGKAP */}
      {/* ======================================================= */}
      {subTab === 'list' && (
        <>
          {/* Filter Tabs & Course Select */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'active'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 Belum Selesai ({assignments.filter(a => !isTaskCompletedByUser(a.id)).length})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({assignments.length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✓ Selesai ({completedCount})
              </button>
            </div>

            {/* Filter by Course */}
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-rose-500" />
              <select
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="all">Semua Mata Kuliah</option>
                {Array.from(new Set(assignments.map(a => a.course_name))).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignment Cards */}
          {filteredAssignments.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-dashed border-rose-200 p-12 text-center shadow-xs">
              <CheckCircle2 className="w-14 h-14 text-rose-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                {filterStatus === 'completed' ? 'Belum ada tugas yang Anda selesaikan' : 'Tidak ada tugas dalam kategori ini'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {filterStatus === 'completed'
                  ? 'Centang checklist tugas yang telah Anda kerjakan untuk menandai selesai.'
                  : 'Semua tugas telah diselesaikan atau belum ada tugas aktif!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map(assignment => {
                const isCompleted = isTaskCompletedByUser(assignment.id)
                const meta = getDeadlineMeta(assignment.deadline, assignment.id)

                const deadlineFormatted = new Date(assignment.deadline).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                const assignedFormatted = new Date(assignment.assigned_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })

                return (
                  <div
                    key={assignment.id}
                    className={`bg-white/95 backdrop-blur-md rounded-3xl border p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md ${meta.cardBorder} ${
                      isCompleted ? 'opacity-85 bg-slate-50/70' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {assignment.course_name}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                            assignment.type === 'group'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {assignment.type === 'group' ? <Users className="w-3 h-3 text-purple-600" /> : <User className="w-3 h-3 text-sky-600" />}
                            {assignment.type === 'group' ? 'Tugas Kelompok' : 'Tugas Individu'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                        </div>

                        <h3 className={`text-base sm:text-lg font-extrabold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {assignment.title}
                        </h3>

                        {assignment.description && (
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/90 p-3 rounded-2xl border border-slate-100">
                            {assignment.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-500 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Diberikan: <strong className="text-slate-800">{assignedFormatted}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            <span>Deadline: <strong className="text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">{deadlineFormatted} WIB</strong></span>
                          </div>
                        </div>

                        {/* Google Drive Link Button directly on Card */}
                        {assignment.drive_link && (
                          <div className="pt-2">
                            <a
                              href={assignment.drive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow"
                            >
                              <FolderUp className="w-3.5 h-3.5" />
                              <span>Kumpulkan di Google Drive ↗</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Per-User Checklist Controls & Admin Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        {/* Checkbox Checklist (Personal per User Account) */}
                        <button
                          onClick={() => handleToggleChecklist(assignment.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition shadow-xs ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                          }`}
                          title={currentUser ? 'Klik untuk mengubah status centang tugas Anda' : 'Login untuk menyimpan checklist di akun Anda'}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isCompleted ? 'bg-white border-white text-emerald-600' : 'border-slate-400 bg-white'
                          }`}>
                            {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{isCompleted ? 'Selesai (Di Akun Anda)' : 'Tandai Selesai'}</span>
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(assignment)}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Edit Tugas"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus tugas "${assignment.title}"?`)) {
                                  onDelete(assignment.id)
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                              title="Hapus Tugas"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modal Add / Edit Assignment */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingAssignment ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cantumkan judul tugas, tenggat waktu, dan link folder Google Drive untuk pengumpulan tugas mahasiswa.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Kuliah *
                </label>
                {courses.length > 0 ? (
                  <select
                    value={formData.course_name}
                    onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemrograman Web"
                    value={formData.course_name}
                    onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tugas 1: Slicing UI & Responsivitas"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Link Google Drive Pengumpulan Tugas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FolderUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Link Google Drive Pengumpulan (Dishare Admin)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={formData.drive_link}
                  onChange={e => setFormData({ ...formData, drive_link: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tautan Google Drive ini akan langsung dibuka mahasiswa ketika mereka menekan tombol "Kumpulkan di Google Drive".
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Instruksi Pengerjaan
                </label>
                <textarea
                  rows="3"
                  placeholder="Instruksi pengerjaan, format berkas pengumpulan, dan referensi..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Diberikan *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.assigned_date}
                    onChange={e => setFormData({ ...formData, assigned_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tenggat Waktu (Deadline) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipe Tugas
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="individual">Individu</option>
                  <option value="group">Kelompok</option>
                </select>
              </div>

              {/* Kelas Target */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipe Kelas *
                  </label>
                  <select
                    value={formData.class_type}
                    onChange={e => setFormData({ ...formData, class_type: e.target.value, class_target: 'all' })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="all">Semua Kelas</option>
                    <option value="theory">Teori</option>
                    <option value="practice">Praktek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Target *
                  </label>
                  <select
                    value={formData.class_target}
                    onChange={e => setFormData({ ...formData, class_target: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="all">Semua</option>
                    <option value="A">Kelas A</option>
                    <option value="B">Kelas B</option>
                    {formData.class_type === 'practice' && <option value="C">Kelas C</option>}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-rose-500/20"
                >
                  {editingAssignment ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
