import React, { useState, useRef, useEffect } from 'react'
import { Calendar, CheckSquare, Users, Shield, ShieldCheck, Megaphone, LogIn, LogOut, User as UserIcon } from 'lucide-react'

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  assignmentCount,
  announcementCount
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const tabs = [
    { id: 'info', label: 'Informasi', icon: Megaphone, badge: announcementCount, badgeColor: 'bg-fuchsia-100 text-fuchsia-700' },
    { id: 'schedule', label: 'Jadwal', fullLabel: 'Jadwal Kuliah', icon: Calendar },
    { id: 'assignments', label: 'Tugas', fullLabel: 'Daftar Tugas', icon: CheckSquare, badge: assignmentCount, badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'spinner', label: 'Spin', fullLabel: 'Spin Kelompok', icon: Users },
  ]

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = currentUser?.role === 'admin'

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-purple-100/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Wordmark Logo: KALARSA */}
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl font-display font-black tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent select-none">
                KALARSA
              </span>
            </div>

            {/* Navigation Tabs (Desktop & Tablet) */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.fullLabel || tab.label}</span>
                    {tab.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-white/25 text-white' : tab.badgeColor
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Auth / Profile Area */}
            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
              {currentUser ? (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs transition"
                  >
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${
                        isAdmin ? 'bg-indigo-600' : 'bg-fuchsia-600'
                      }`}>
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                        {currentUser.name}
                      </div>
                      <div className={`text-[10px] font-bold ${isAdmin ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {isAdmin ? 'Admin' : 'Mahasiswa'}
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                      <div className="p-3 border-b border-slate-100">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200'
                        }`}>
                          {isAdmin ? '🛡️ Administrator' : '🎓 Mahasiswa'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          onLogout()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-2xl text-xs font-bold transition shadow-sm hover:shadow"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-purple-100 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-fuchsia-600 font-extrabold bg-gradient-to-b from-fuchsia-50/80 to-purple-50/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {/* Active Indicator Bar on top */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full" />
                )}

                <div className="relative mt-0.5">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-fuchsia-600' : 'text-slate-400'}`} />

                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-[9px] flex items-center justify-center font-black shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-black text-fuchsia-900' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
