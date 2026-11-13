import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Initial courses data with building field
const INITIAL_COURSES = [
  {
    id: 'c1',
    name: 'Pemrograman Web',
    day: 'Senin',
    start_time: '08:00',
    end_time: '10:30',
    credits: 3,
    building: 'Gedung C (Fakultas Teknik)',
    room: 'Lab Komputer 3 (Lt. 2)',
    lecturer: 'Budi Santoso, M.Kom.'
  },
  {
    id: 'c2',
    name: 'Basis Data Lanjut',
    day: 'Selasa',
    start_time: '10:00',
    end_time: '11:40',
    credits: 2,
    building: 'Gedung B (Sains Terpadu)',
    room: 'Ruang Teori 402',
    lecturer: 'Dr. Sri Wahyuni'
  },
  {
    id: 'c3',
    name: 'Rekayasa Perangkat Lunak',
    day: 'Rabu',
    start_time: '13:00',
    end_time: '15:30',
    credits: 3,
    building: 'Gedung A (Rektorat Lama)',
    room: 'Ruang Seminar 205',
    lecturer: 'Ahmad Fauzi, S.T., M.T.'
  },
  {
    id: 'c4',
    name: 'Kecerdasan Buatan',
    day: 'Kamis',
    start_time: '08:00',
    end_time: '10:30',
    credits: 3,
    building: 'Gedung C (Fakultas Teknik)',
    room: 'Lab AI & Robotika (Lt. 3)',
    lecturer: 'Prof. Hendra Wijaya'
  }
]

// Initial announcements (Text, Image, Video)
const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: '📢 Ketentuan & Kisi-Kisi Ujian Tengah Semester (UTS)',
    content: 'Diberitahukan kepada seluruh rekan mahasiswa, pelaksanaan UTS akan dimulai minggu depan. Harap membawa Kartu Ujian fisik, mengenakan kemeja rapi berkerah, dan hadir 15 menit sebelum bel berbunyi di ruangan masing-masing.',
    media_type: 'text',
    media_url: '',
    pinned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'ann-2',
    title: '🎨 Workshop UI/UX & Web Development Komunitas Kampus',
    content: 'Pendaftaran bootcamp gratis bertema "Modern Web Design with Tailwind & React" telah dibuka! Tersedia sertifikat resmi dan portofolio proyek kolaborasi.',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'ann-3',
    title: '🎥 Rekaman Kuliah Pengantar Algoritma & Struktur Data',
    content: 'Bagi yang berhalangan hadir pada sesi Zoom hari Selasa lalu, berikut rekaman materi dasar algoritma dan alur logika pemrograman yang wajib dipelajari sebelum kuis.',
    media_type: 'video',
    media_url: 'https://www.youtube.com/watch?v=8hly31xKli0',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
]

// Initial assignments with Google Drive submission links
const INITIAL_ASSIGNMENTS = [
  {
    id: 'a1',
    course_name: 'Pemrograman Web',
    title: 'Tugas 1: Slice UI Kalarsa & Responsive Navbar',
    description: 'Membuat antarmuka web responsive menggunakan React dan Tailwind CSS. Kumpulkan file ZIP atau dokumen tautan GitHub ke Google Drive yang disediakan.',
    assigned_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    type: 'individual',
    status: 'in_progress',
    drive_link: 'https://drive.google.com'
  },
  {
    id: 'a2',
    course_name: 'Basis Data Lanjut',
    title: 'Desain ERD & Normalisasi Database Sistem Kampus',
    description: 'Buat diagram ERD lengkap dengan kardinalitas 1:N dan M:N serta bentuk normalisasi hingga 3NF dalam format PDF.',
    assigned_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    type: 'group',
    status: 'pending',
    drive_link: 'https://drive.google.com'
  }
]

function getLocal(key, defaultVal) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultVal
  } catch {
    return defaultVal
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {
    console.error('LocalStorage write failed:', e)
  }
}

export const DataService = {
  // COURSES
  async getCourses() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('start_time', { ascending: true })
      if (!error && data) return data
      console.warn('Supabase fetch courses failed, falling back to local:', error)
    }
    return getLocal('wk_courses', INITIAL_COURSES)
  },

  async addCourse(course) {
    const newCourse = { ...course, id: crypto.randomUUID() }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('courses')
        .insert([newCourse])
        .select()
        .single()
      if (!error && data) return data
      console.error('Supabase addCourse error:', error)
    }
    const current = getLocal('wk_courses', INITIAL_COURSES)
    const updated = [...current, newCourse]
    setLocal('wk_courses', updated)
    return newCourse
  },

  async updateCourse(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data
      console.error('Supabase updateCourse error:', error)
    }
    const current = getLocal('wk_courses', INITIAL_COURSES)
    const updated = current.map(c => c.id === id ? { ...c, ...updates } : c)
    setLocal('wk_courses', updated)
    return updated.find(c => c.id === id)
  },

  async deleteCourse(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) console.error('Supabase deleteCourse error:', error)
    }
    const current = getLocal('wk_courses', INITIAL_COURSES)
    const updated = current.filter(c => c.id !== id)
    setLocal('wk_courses', updated)
    return true
  },

  // ANNOUNCEMENTS
  async getAnnouncements() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
      if (!error && data) return data
      console.warn('Supabase fetch announcements failed, falling back to local:', error)
    }
    return getLocal('wk_announcements', INITIAL_ANNOUNCEMENTS)
  },

  async addAnnouncement(announcement) {
    const newAnn = {
      ...announcement,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('announcements')
        .insert([newAnn])
        .select()
        .single()
      if (!error && data) return data
      console.error('Supabase addAnnouncement error:', error)
    }
    const current = getLocal('wk_announcements', INITIAL_ANNOUNCEMENTS)
    const updated = [newAnn, ...current]
    setLocal('wk_announcements', updated)
    return newAnn
  },

  async updateAnnouncement(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data
      console.error('Supabase updateAnnouncement error:', error)
    }
    const current = getLocal('wk_announcements', INITIAL_ANNOUNCEMENTS)
    const updated = current.map(a => a.id === id ? { ...a, ...updates } : a)
    setLocal('wk_announcements', updated)
    return updated.find(a => a.id === id)
  },

  async deleteAnnouncement(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) console.error('Supabase deleteAnnouncement error:', error)
    }
    const current = getLocal('wk_announcements', INITIAL_ANNOUNCEMENTS)
    const updated = current.filter(a => a.id !== id)
    setLocal('wk_announcements', updated)
    return true
  },

  // ASSIGNMENTS
  async getAssignments() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('deadline', { ascending: true })
      if (!error && data) return data
      console.warn('Supabase fetch assignments failed, falling back to local:', error)
    }
    return getLocal('wk_assignments', INITIAL_ASSIGNMENTS)
  },

  async addAssignment(assignment) {
    const newAssignment = { ...assignment, id: crypto.randomUUID() }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .insert([newAssignment])
        .select()
        .single()
      if (!error && data) return data
      console.error('Supabase addAssignment error:', error)
    }
    const current = getLocal('wk_assignments', INITIAL_ASSIGNMENTS)
    const updated = [...current, newAssignment]
    setLocal('wk_assignments', updated)
    return newAssignment
  },

  async updateAssignment(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data
      console.error('Supabase updateAssignment error:', error)
    }
    const current = getLocal('wk_assignments', INITIAL_ASSIGNMENTS)
    const updated = current.map(a => a.id === id ? { ...a, ...updates } : a)
    setLocal('wk_assignments', updated)
    return updated.find(a => a.id === id)
  },

  async deleteAssignment(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('assignments').delete().eq('id', id)
      if (error) console.error('Supabase deleteAssignment error:', error)
    }
    const current = getLocal('wk_assignments', INITIAL_ASSIGNMENTS)
    const updated = current.filter(a => a.id !== id)
    setLocal('wk_assignments', updated)
    return true
  },

  // USER TASK COMPLETIONS (PER-AKUN)
  async getUserCompletedTasks(userId) {
    if (!userId) return []
    const localKey = `kalarsa_completions_${userId}`

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_task_completions')
          .select('assignment_id')
          .eq('user_id', userId)
        if (!error && data) {
          const ids = data.map(row => row.assignment_id)
          setLocal(localKey, ids)
          return ids
        }
      } catch (e) {
        console.warn('Supabase fetch completions error:', e)
      }
    }
    return getLocal(localKey, [])
  },

  async toggleUserTaskCompletion(userId, assignmentId) {
    if (!userId || !assignmentId) return []
    const localKey = `kalarsa_completions_${userId}`
    const current = getLocal(localKey, [])
    const isCompleted = current.includes(assignmentId)

    const updated = isCompleted
      ? current.filter(id => id !== assignmentId)
      : [...current, assignmentId]

    setLocal(localKey, updated)

    if (isSupabaseConfigured && supabase) {
      try {
        if (isCompleted) {
          await supabase
            .from('user_task_completions')
            .delete()
            .eq('user_id', userId)
            .eq('assignment_id', assignmentId)
        } else {
          await supabase
            .from('user_task_completions')
            .insert([{ user_id: userId, assignment_id: assignmentId }])
        }
      } catch (e) {
        console.warn('Supabase toggle completion error:', e)
      }
    }

    return updated
  },

  // USER PROFILES (Nama, NIM, Kelas Teori, Kelas Praktek)
  async saveProfile(profile) {
    const { user_id } = profile
    if (!user_id) return null
    const localKey = `kalarsa_profile_${user_id}`
    setLocal(localKey, profile)

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert([{ ...profile, updated_at: new Date().toISOString() }], { onConflict: 'user_id' })
          .select()
          .single()
        if (!error && data) return data
        console.warn('Supabase saveProfile error:', error)
      } catch (e) {
        console.warn('Supabase saveProfile exception:', e)
      }
    }
    return profile
  },

  async getProfile(userId) {
    if (!userId) return null
    const localKey = `kalarsa_profile_${userId}`

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        if (!error && data) {
          setLocal(localKey, data)
          return data
        }
      } catch (e) {
        console.warn('Supabase getProfile exception:', e)
      }
    }
    return getLocal(localKey, null)
  }
}
