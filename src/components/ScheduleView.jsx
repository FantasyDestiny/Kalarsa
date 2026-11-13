import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Clock, BookOpen, MapPin, User, Calendar, Building2, Sparkles, GraduationCap } from 'lucide-react'
import { classLabel } from '../lib/classFilter'

const DAYS = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function ScheduleView({ courses, onAdd, onUpdate, onDelete, isAdmin, currentUser }) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const today = dayNames[new Date().getDay()]
    return DAYS.includes(today) ? today : 'Semua'
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    day: 'Senin',
    start_time: '08:00',
    end_time: '09:40',
    credits: 2,
    building: '',
    room: '',
    lecturer: '',
    class_type: 'all',   // 'all' | 'theory' | 'practice'
    class_target: 'all'  // 'all' | 'A' | 'B' | 'C'
  })

  // Filter courses
  const filteredCourses = selectedDay === 'Semua'
    ? courses
    : courses.filter(c => c.day === selectedDay)

  // Calculate total SKS
  const totalSKS = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)

  const handleOpenAdd = () => {
    setEditingCourse(null)
    setFormData({
      name: '',
      day: selectedDay !== 'Semua' ? selectedDay : 'Senin',
      start_time: '08:00',
      end_time: '09:40',
      credits: 2,
      building: '',
      room: '',
      lecturer: '',
      class_type: 'all',
      class_target: 'all'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      day: course.day,
      start_time: course.start_time,
      end_time: course.end_time,
      credits: course.credits,
      building: course.building || '',
      room: course.room || '',
      lecturer: course.lecturer || '',
      class_type: course.class_type || 'all',
      class_target: course.class_target || 'all'
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name) return

    if (editingCourse) {
      onUpdate(editingCourse.id, formData)
    } else {
      onAdd(formData)
    }
    setModalOpen(false)
  }

  // Day color badges
  const dayColors = {
    'Senin': 'from-blue-500 to-indigo-600 text-white',
    'Selasa': 'from-purple-500 to-pink-600 text-white',
    'Rabu': 'from-rose-500 to-amber-500 text-white',
    'Kamis': 'from-emerald-500 to-teal-600 text-white',
    'Jumat': 'from-cyan-500 to-blue-600 text-white',
    'Sabtu': 'from-amber-500 to-orange-600 text-white'
  }

  return (
    <div className="space-y-6">
      {/* Colorful Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/15">
        <div className="absolute -right-4 -bottom-6 opacity-20 transform rotate-6">
          <Calendar className="w-52 h-52" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Jadwal Semester Aktif
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Jadwal Kuliah & Lokasi
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl">
              Informasi lengkap ruang, jam perkuliahan, beban SKS, dan letak gedung kelas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {currentUser && currentUser.role !== 'admin' && (
              <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-white text-xs font-bold flex items-center gap-2 border border-white/30">
                <GraduationCap className="w-4 h-4 text-emerald-200" />
                <span>Teori {currentUser.theory_class || '-'} · Praktek {currentUser.practice_class || '-'}</span>
              </div>
            )}

            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-white text-xs font-bold flex items-center gap-2 border border-white/30">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Total Beban: <strong className="text-sm text-white">{totalSKS} SKS</strong></span>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Matkul</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map(day => {
          const isSelected = selectedDay === day
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-dashed border-indigo-200 p-12 text-center shadow-xs">
          <Clock className="w-14 h-14 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada jadwal kuliah untuk hari ini</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? 'Klik tombol "Tambah Matkul" di atas untuk menambahkan jadwal baru.' : 'Pilih hari lain atau tunggu info dari pengurus kelas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between overflow-hidden"
            >
              {/* Colorful gradient accent top bar */}
              <div className={`h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r ${dayColors[course.day] || 'from-blue-500 to-indigo-600'}`} />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3 mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r ${dayColors[course.day] || 'from-blue-500 to-indigo-600'} shadow-xs`}>
                    {course.day}
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    ⭐ {course.credits} SKS
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {course.name}
                </h3>

                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
                  🎓 {classLabel(course)}
                </span>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5 p-2 bg-indigo-50/60 rounded-xl border border-indigo-100/80">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-indigo-950">
                      {course.start_time} - {course.end_time} WIB
                    </span>
                  </div>

                  {/* Nama Gedung */}
                  {course.building && (
                    <div className="flex items-center gap-2.5 px-2 py-1 text-slate-700">
                      <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-semibold text-purple-900">{course.building}</span>
                    </div>
                  )}

                  {/* Ruang Kelas */}
                  {course.room && (
                    <div className="flex items-center gap-2.5 px-2 py-1 text-slate-600">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{course.room}</span>
                    </div>
                  )}

                  {/* Dosen Pengampu */}
                  {course.lecturer && (
                    <div className="flex items-center gap-2.5 px-2 py-1 text-slate-500">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{course.lecturer}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Edit Jadwal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus jadwal mata kuliah ${course.name}?`)) {
                        onDelete(course.id)
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Course */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingCourse ? 'Edit Jadwal Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi detail matkul, jam kuliah, serta nama gedung tempat kelas diadakan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hari *
                  </label>
                  <select
                    value={formData.day}
                    onChange={e => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {DAYS.filter(d => d !== 'Semua').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Beban SKS *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Input Nama Gedung */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nama Gedung *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung C (Fakultas Teknik) atau Gedung Rektorat"
                  value={formData.building}
                  onChange={e => setFormData({ ...formData, building: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruangan / Tautan Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lab Komputer 3 (Lt. 2) atau Zoom Link"
                  value={formData.room}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dosen Pengampu
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso, M.Kom."
                  value={formData.lecturer}
                  onChange={e => setFormData({ ...formData, lecturer: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-500/20"
                >
                  {editingCourse ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
