import React, { useState, useRef, useEffect } from 'react'
import { Users, Shuffle, Copy, Check, Sparkles, RefreshCw, Layers } from 'lucide-react'
import confetti from 'canvas-confetti'

const SAMPLE_STUDENTS = `Ahmad Fauzi
Budi Santoso
Citra Lestari
Dwi Cahyo
Eka Rahmawati
Fajar Nugraha
Gita Savitri
Hendra Wijaya
Intan Permata
Joko Prasetyo
Kurnia Sari
Lukman Hakim`

export default function GroupSpinnerView() {
  const [inputText, setInputText] = useState(SAMPLE_STUDENTS)
  const [splitMode, setSplitMode] = useState('byGroups') // 'byGroups' | 'bySize'
  const [groupCount, setGroupCount] = useState(3)
  const [memberPerGroup, setMemberPerGroup] = useState(4)
  const [taskTopic, setTaskTopic] = useState('Tugas Kelompok')

  const [isSpinning, setIsSpinning] = useState(false)
  const [groupsResult, setGroupsResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // Canvas Wheel
  const canvasRef = useRef(null)
  const rotationRef = useRef(0)
  const animFrameRef = useRef(null)

  // Parse student names
  const parsedStudents = inputText
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const colors = [
    '#6366F1', '#EC4899', '#F59E0B', '#10B981',
    '#8B5CF6', '#EF4444', '#06B6D4', '#14B8A6'
  ]

  // Draw wheel on canvas
  const drawWheel = (angle = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const center = size / 2
    const radius = center - 10

    ctx.clearRect(0, 0, size, size)

    const items = parsedStudents.length > 0 ? parsedStudents.slice(0, 16) : ['Mhs 1', 'Mhs 2', 'Mhs 3', 'Mhs 4']
    const arc = (2 * Math.PI) / items.length

    ctx.save()
    ctx.translate(center, center)
    ctx.rotate(angle)

    items.forEach((item, i) => {
      ctx.beginPath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, i * arc, (i + 1) * arc)
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()

      // Text label
      ctx.save()
      ctx.rotate(i * arc + arc / 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(item.length > 12 ? item.slice(0, 11) + '..' : item, radius - 15, 4)
      ctx.restore()
    })

    ctx.restore()

    // Draw Center Circle
    ctx.beginPath()
    ctx.arc(center, center, 24, 0, 2 * Math.PI)
    ctx.fillStyle = '#1E1B4B'
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 4
    ctx.stroke()

    // Inner center dot
    ctx.beginPath()
    ctx.arc(center, center, 8, 0, 2 * Math.PI)
    ctx.fillStyle = '#EC4899'
    ctx.fill()

    // Draw Pointer on Top
    ctx.beginPath()
    ctx.moveTo(center - 12, 6)
    ctx.lineTo(center + 12, 6)
    ctx.lineTo(center, 26)
    ctx.closePath()
    ctx.fillStyle = '#EF4444'
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  useEffect(() => {
    drawWheel(rotationRef.current)
  }, [inputText])

  // Split Logic
  const calculateGroups = () => {
    const list = [...parsedStudents]
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }

    let numGroups = 1
    if (splitMode === 'byGroups') {
      numGroups = Math.max(1, Math.min(groupCount, list.length))
    } else {
      numGroups = Math.max(1, Math.ceil(list.length / Math.max(1, memberPerGroup)))
    }

    const groups = Array.from({ length: numGroups }, () => [])
    list.forEach((name, index) => {
      groups[index % numGroups].push(name)
    })

    return groups
  }

  const triggerSpin = (isInstant = false) => {
    if (parsedStudents.length === 0) return

    if (isInstant) {
      const result = calculateGroups()
      setGroupsResult(result)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } })
      return
    }

    if (isSpinning) return
    setIsSpinning(true)

    let start = null
    const totalSpin = 12 * Math.PI + Math.random() * 8 * Math.PI
    const duration = 2800
    const initialRotation = rotationRef.current

    const step = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)

      const ease = 1 - Math.pow(1 - progress, 3)
      const currentAngle = initialRotation + totalSpin * ease

      drawWheel(currentAngle)
      rotationRef.current = currentAngle

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        setIsSpinning(false)
        const result = calculateGroups()
        setGroupsResult(result)
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        })
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }

  const handleCopyWhatsApp = () => {
    if (!groupsResult) return

    let text = `📋 *PEMBAGIAN KELOMPOK: ${taskTopic.toUpperCase()}*\n`
    text += `Total: ${parsedStudents.length} Mahasiswa | ${groupsResult.length} Kelompok\n`
    text += `------------------------------------\n\n`

    groupsResult.forEach((group, idx) => {
      text += `*Kelompok ${idx + 1} (${group.length} Anggota):*\n`
      group.forEach((member, mIdx) => {
        text += `  ${mIdx + 1}. ${member}\n`
      })
      text += `\n`
    })

    text += `Dibuat melalui Kalarsa 🎓✨`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Colorful Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-6 sm:p-8 text-white shadow-lg shadow-teal-500/15">
        <div className="absolute -right-6 -bottom-8 opacity-20 transform rotate-12">
          <Users className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Generator & Wheel Spinner
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Spin & Pembagian Kelompok
            </h2>
            <p className="text-sm text-teal-100 max-w-xl">
              Bagi kelompok tugas kelas secara adil, cepat, dan seru dengan animasi putaran roda.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => triggerSpin(true)}
              disabled={isSpinning || parsedStudents.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl text-xs font-bold transition border border-white/30"
            >
              <Shuffle className="w-4 h-4" />
              <span>Acak Langsung</span>
            </button>
            <button
              onClick={() => triggerSpin(false)}
              disabled={isSpinning || parsedStudents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 hover:bg-teal-50 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Sedang Memutar...' : 'Putar Roda Kelompok!'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Names & Settings */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                Daftar Mahasiswa ({parsedStudents.length} Terdeteksi)
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition"
              >
                Hapus Semua
              </button>
            </div>
            <textarea
              rows="8"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ketik atau tempel nama mahasiswa di sini (satu nama per baris)..."
              className="w-full p-3.5 border border-slate-300 rounded-2xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
            ></textarea>
            <p className="text-[11px] text-slate-400 mt-1">
              Tips: Salin daftar nama dari WhatsApp kelas langsung ke kotak di atas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Topik / Nama Tugas
            </label>
            <input
              type="text"
              value={taskTopic}
              onChange={e => setTaskTopic(e.target.value)}
              placeholder="Contoh: Tugas Besar Basis Data"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Metode Pembagian
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitMode('byGroups')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                  splitMode === 'byGroups'
                    ? 'bg-teal-50 border-teal-400 text-teal-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Jumlah Kelompok
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('bySize')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                  splitMode === 'bySize'
                    ? 'bg-teal-50 border-teal-400 text-teal-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Kuota per Kelompok
              </button>
            </div>

            {splitMode === 'byGroups' ? (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Bagi menjadi berapa kelompok?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max={Math.max(2, parsedStudents.length)}
                    value={groupCount}
                    onChange={e => setGroupCount(parseInt(e.target.value) || 2)}
                    className="flex-1 accent-teal-600"
                  />
                  <span className="w-10 text-center font-bold text-sm bg-teal-50 text-teal-900 border border-teal-200 py-1 rounded-xl">
                    {groupCount}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Maksimal mahasiswa per kelompok:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max={Math.max(2, parsedStudents.length)}
                    value={memberPerGroup}
                    onChange={e => setMemberPerGroup(parseInt(e.target.value) || 2)}
                    className="flex-1 accent-teal-600"
                  />
                  <span className="w-10 text-center font-bold text-sm bg-teal-50 text-teal-900 border border-teal-200 py-1 rounded-xl">
                    {memberPerGroup}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Wheel Column */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 flex flex-col items-center justify-center shadow-sm">
          <div className="relative mb-4">
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="drop-shadow-lg rounded-full"
            />
          </div>

          <div className="text-center space-y-1 mb-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Roda Pengacakan Kalarsa
            </h4>
            <p className="text-[11px] text-slate-400">
              Animasi putaran seru dengan warna-warni dinamis.
            </p>
          </div>

          <button
            onClick={() => triggerSpin(false)}
            disabled={isSpinning || parsedStudents.length === 0}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-extrabold transition shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            {isSpinning ? 'Sedang Memutar Roda...' : 'Putar Roda Sekarang!'}
          </button>
        </div>

        {/* Right Column: Result Groups */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-teal-600" />
              Hasil Kelompok {groupsResult && `(${groupsResult.length})`}
            </h3>

            {groupsResult && (
              <button
                onClick={handleCopyWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{copied ? 'Tersalin!' : 'Salin WA'}</span>
              </button>
            )}
          </div>

          {!groupsResult ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Users className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">Belum ada kelompok yang diacak</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tekan tombol "Putar Roda" atau "Acak Langsung" untuk melihat hasil.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px] pr-1">
              {groupsResult.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-xs">
                      Kelompok {gIdx + 1}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
                      {group.length} Orang
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {group.map((member, mIdx) => (
                      <li key={mIdx} className="flex items-center gap-2 text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">
                          {mIdx + 1}
                        </span>
                        <span className="truncate font-medium">{member}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
