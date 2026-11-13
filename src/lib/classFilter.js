// Filter konten berdasarkan kelas mahasiswa.
//
// Aturan:
// - class_type 'all'  -> tampil untuk semua orang (termasuk yang belum login)
// - class_type 'theory' / 'practice' -> hanya untuk kelas yang sesuai
// - Admin selalu melihat semuanya (agar bisa mengelola data)
// - Pengunjung yang belum login hanya melihat konten umum ('all')
export function matchesUserClass(item, user) {
  const type = item?.class_type || 'all'
  if (type === 'all') return true
  if (!user) return false
  if (user.role === 'admin') return true

  const target = item?.class_target || 'all'
  if (target === 'all') return true

  if (type === 'theory') {
    return Boolean(user.theory_class) && target === user.theory_class
  }
  if (type === 'practice') {
    return Boolean(user.practice_class) && target === user.practice_class
  }

  return true
}

export function filterByClass(items, user) {
  if (!Array.isArray(items)) return []
  return items.filter(item => matchesUserClass(item, user))
}

// Label kelas untuk ditampilkan di UI.
export function classLabel(item) {
  const type = item?.class_type || 'all'
  if (type === 'all') return 'Semua Kelas'
  const target = item?.class_target || 'all'
  const name = type === 'theory' ? 'Teori' : 'Praktek'
  return target === 'all' ? name : `${name} ${target}`
}
