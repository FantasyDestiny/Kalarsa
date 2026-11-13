import React, { useState } from 'react'
import { Megaphone, Plus, Edit2, Trash2, Pin, Image as ImageIcon, Video as VideoIcon, FileText, ExternalLink, Calendar, Sparkles, X } from 'lucide-react'

// Helper to extract YouTube embed URL
function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : null
}

export default function InformationView({ announcements, onAdd, onUpdate, onDelete, isAdmin }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAnn, setEditingAnn] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    media_type: 'text', // 'text', 'image', 'video'
    media_url: '',
    pinned: false
  })

  const handleOpenAdd = () => {
    setEditingAnn(null)
    setFormData({
      title: '',
      content: '',
      media_type: 'text',
      media_url: '',
      pinned: false
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (ann) => {
    setEditingAnn(ann)
    setFormData({
      title: ann.title,
      content: ann.content,
      media_type: ann.media_type || 'text',
      media_url: ann.media_url || '',
      pinned: Boolean(ann.pinned)
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    if (editingAnn) {
      onUpdate(editingAnn.id, formData)
    } else {
      onAdd(formData)
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Colorful Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 p-6 sm:p-8 text-white shadow-lg shadow-pink-500/15">
        <div className="absolute -right-6 -bottom-8 opacity-20 transform rotate-12">
          <Megaphone className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Papan Informasi Kampus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Informasi & Pengumuman
            </h2>
            <p className="text-sm text-pink-100 max-w-xl">
              Pusat edaran resmi kelas dalam format teks, gambar pamflet, dan materi video kuliah.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-fuchsia-700 hover:bg-pink-50 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat Pengumuman</span>
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum ada pengumuman kelas</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? 'Klik tombol "Buat Pengumuman" di atas untuk menambahkan informasi baru.' : 'Semua informasi terbaru dari dosen dan pengurus kelas akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((item) => {
            const ytEmbed = item.media_type === 'video' ? getYouTubeEmbedUrl(item.media_url) : null
            const isDirectVideo = item.media_type === 'video' && item.media_url && !ytEmbed
            const dateFormatted = new Date(item.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <div
                key={item.id}
                className={`group relative flex flex-col justify-between rounded-3xl bg-white/95 backdrop-blur-md border transition-all duration-300 hover:shadow-xl overflow-hidden ${
                  item.pinned
                    ? 'border-fuchsia-300 ring-2 ring-fuchsia-400/20 shadow-md'
                    : 'border-slate-200/80 shadow-sm hover:border-purple-300'
                }`}
              >
                {/* Colorful top border strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${
                  item.pinned
                    ? 'from-amber-400 via-pink-500 to-purple-600'
                    : item.media_type === 'video'
                    ? 'from-rose-500 to-amber-500'
                    : item.media_type === 'image'
                    ? 'from-cyan-500 to-blue-600'
                    : 'from-emerald-400 to-teal-500'
                }`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Badges & Pin */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {item.pinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Pin className="w-3 h-3 fill-amber-600" />
                          Disematkan
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        item.media_type === 'video'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.media_type === 'image'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.media_type === 'video' && <VideoIcon className="w-3 h-3" />}
                        {item.media_type === 'image' && <ImageIcon className="w-3 h-3" />}
                        {item.media_type === 'text' && <FileText className="w-3 h-3" />}
                        {item.media_type === 'video' ? 'Video' : item.media_type === 'image' ? 'Gambar' : 'Teks'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{dateFormatted}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-fuchsia-600 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Content */}
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4 flex-1">
                    {item.content}
                  </p>

                  {/* Media Display Area */}
                  {item.media_type === 'image' && item.media_url && (
                    <div
                      onClick={() => setSelectedImage(item.media_url)}
                      className="cursor-pointer overflow-hidden rounded-2xl border border-slate-100 relative group/img max-h-56 mb-2"
                    >
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-2xl transform group-hover/img:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                        <ExternalLink className="w-4 h-4" /> Klik untuk perbesar
                      </div>
                    </div>
                  )}

                  {item.media_type === 'video' && item.media_url && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black mb-2 shadow-inner">
                      {ytEmbed ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={ytEmbed}
                            title={item.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          ></iframe>
                        </div>
                      ) : isDirectVideo ? (
                        <video controls className="w-full max-h-56 bg-black">
                          <source src={item.media_url} type="video/mp4" />
                          Browser tidak mendukung tag video.
                        </video>
                      ) : (
                        <div className="p-4 bg-slate-900 text-center">
                          <a
                            href={item.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            <VideoIcon className="w-4 h-4" />
                            <span>Buka Video di Tab Baru</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Action Buttons */}
                {isAdmin && (
                  <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Kelola Pengumuman:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition"
                        title="Edit Informasi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus pengumuman "${item.title}"?`)) {
                            onDelete(item.id)
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Informasi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Add / Edit Announcement */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingAnn ? 'Edit Informasi Pengumuman' : 'Buat Pengumuman Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informasi akan langsung terlihat oleh seluruh mahasiswa di portal Kalarsa.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Informasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Responsi Praktikum"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Format Media Informasi *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'text', label: 'Teks Saja', icon: FileText, color: 'text-emerald-600' },
                    { id: 'image', label: 'Foto / Gambar', icon: ImageIcon, color: 'text-sky-600' },
                    { id: 'video', label: 'Video (YouTube)', icon: VideoIcon, color: 'text-rose-600' },
                  ].map(tab => {
                    const Icon = tab.icon
                    const isSelected = formData.media_type === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, media_type: tab.id })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                          isSelected
                            ? 'bg-fuchsia-50 border-fuchsia-400 text-fuchsia-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-fuchsia-600' : tab.color}`} />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {formData.media_type !== 'text' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {formData.media_type === 'image' ? 'Tautan URL Gambar *' : 'Tautan URL Video (YouTube / MP4) *'}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={
                      formData.media_type === 'image'
                        ? 'https://example.com/poster.jpg atau link gambar'
                        : 'https://www.youtube.com/watch?v=... atau https://youtu.be/...'
                    }
                    value={formData.media_url}
                    onChange={e => setFormData({ ...formData, media_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formData.media_type === 'video'
                      ? 'Tip: Masukkan link YouTube reguler atau short link (youtu.be), otomatis akan disematkan di web.'
                      : 'Tip: Masukkan link gambar online dari Google Drive publik, Imgur, atau hosting foto.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pengumuman / Instruksi Lengkap *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tuliskan detail pengumuman secara jelas untuk rekan-rekan mahasiswa..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-fuchsia-500 focus:outline-none leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <input
                  type="checkbox"
                  id="pinned-checkbox"
                  checked={formData.pinned}
                  onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded accent-amber-500"
                />
                <label htmlFor="pinned-checkbox" className="text-xs font-bold text-amber-900 cursor-pointer">
                  Sematkan pengumuman ini di bagian paling atas (Pin)
                </label>
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
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-fuchsia-500/20"
                >
                  {editingAnn ? 'Simpan Perubahan' : 'Terbitkan Informasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[82vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
