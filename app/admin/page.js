'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import './admin.css'

function AdminContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user?.is_admin) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, usersRes, reportsRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/users'),
          api.get('/api/admin/reports')
        ])

        if (statsRes?.ok) setStats(await statsRes.json())
        if (usersRes?.ok) setUsers((await usersRes.json()).users || [])
        if (reportsRes?.ok) setReports((await reportsRes.json()).reports || [])
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.is_admin])

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}" and all their reports?`)) return
    try {
      const res = await api.delete(`/api/admin/users/${userId}`)
      if (res?.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user')
      }
    } catch (err) {
      alert('Error deleting user')
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Delete this report?')) return
    try {
      const res = await api.delete(`/api/admin/reports/${reportId}`)
      if (res?.ok) {
        setReports(reports.filter(r => r.id !== reportId))
        alert('Report deleted successfully')
      } else {
        alert('Failed to delete report')
      }
    } catch (err) {
      alert('Error deleting report')
    }
  }

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/api/admin/export/${type}`)
      if (res?.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      alert('Error exporting data')
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isWithinDateRange = (date, range) => {
    const d = new Date(date)
    const now = new Date()
    const day = 24 * 60 * 60 * 1000
    switch (range) {
      case '7d': return now - d <= 7 * day
      case '30d': return now - d <= 30 * day
      case '90d': return now - d <= 90 * day
      default: return true
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.label?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || r.calculation_type === filterType
    const matchesDate = filterDateRange === 'all' || isWithinDateRange(r.created_at, filterDateRange)
    return matchesSearch && matchesType && matchesDate
  })

  if (authLoading || loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user?.is_admin) return null

  return (
    <div className="admin-page">
      <Nav />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header"><h2>Admin</h2></div>
          <nav className="admin-nav">
            <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
            <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users ({users.length})</button>
            <button className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>📄 Reports ({reports.length})</button>
          </nav>
        </aside>

        <main className="admin-main">
          {activeTab === 'dashboard' && stats && (
            <section className="admin-section">
              <h1>Dashboard</h1>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value">{stats.totalUsers}</div></div>
                <div className="stat-card"><div className="stat-label">Total Calculations</div><div className="stat-value">{stats.totalReports}</div></div>
                <div className="stat-card"><div className="stat-label">Avg Calc/User</div><div className="stat-value">{(stats.totalReports / stats.totalUsers).toFixed(1)}</div></div>
                <div className="stat-card"><div className="stat-label">With Child</div><div className="stat-value">{stats.withChild}</div></div>
                <div className="stat-card"><div className="stat-label">Without Child</div><div className="stat-value">{stats.withoutChild}</div></div>
                <div className="stat-card"><div className="stat-label">Active This Month</div><div className="stat-value">{stats.activeThisMonth}</div></div>
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="admin-section">
              <div className="section-header"><h1>Users</h1><button className="btn btn-outline btn-sm" onClick={() => handleExport('users')}>📥 Export CSV</button></div>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
              <div className="users-table">
                <div className="table-head">
                  <div className="col-email">Email</div>
                  <div className="col-name">Name</div>
                  <div className="col-joined">Joined</div>
                  <div className="col-last-login">Last Login</div>
                  <div className="col-calcs">Calcs</div>
                  <div className="col-actions">Actions</div>
                </div>
                {filteredUsers.map(u => (
                  <div key={u.id} className="table-row">
                    <div className="col-email">{u.email}</div>
                    <div className="col-name">{u.first_name} {u.last_name}</div>
                    <div className="col-joined">{new Date(u.created_at).toLocaleDateString('en-CA')}</div>
                    <div className="col-last-login">{u.last_login ? new Date(u.last_login).toLocaleDateString('en-CA') : '—'}</div>
                    <div className="col-calcs">{u.calculation_count || 0}</div>
                    <div className="col-actions"><button className="btn btn-danger btn-xs" onClick={() => handleDeleteUser(u.id, u.email)}>Delete</button></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'reports' && (
            <section className="admin-section">
              <div className="section-header"><h1>Reports</h1><button className="btn btn-outline btn-sm" onClick={() => handleExport('reports')}>📥 Export CSV</button></div>
              <div className="filters-row">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                  <option value="all">All Types</option>
                  <option value="with_child">With Child</option>
                  <option value="without_child">Without Child</option>
                </select>
                <select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)} className="filter-select">
                  <option value="all">All Dates</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <div className="reports-table">
                <div className="table-head">
                  <div className="col-label">Calculation</div>
                  <div className="col-user-email">User</div>
                  <div className="col-type">Type</div>
                  <div className="col-created">Created</div>
                  <div className="col-actions">Actions</div>
                </div>
                {filteredReports.map(r => (
                  <div key={r.id} className="table-row">
                    <div className="col-label"><Link href={`/calculations/${r.id}`}>{r.label || `Calc ${new Date(r.created_at).toLocaleDateString('en-CA')}`}</Link></div>
                    <div className="col-user-email">{r.user_email}</div>
                    <div className="col-type"><span className={`badge ${r.calculation_type === 'with_child' ? 'badge-violet' : 'badge-soft'}`}>{r.calculation_type === 'with_child' ? 'With' : 'Without'}</span></div>
                    <div className="col-created">{new Date(r.created_at).toLocaleDateString('en-CA')}</div>
                    <div className="col-actions"><button className="btn btn-danger btn-xs" onClick={() => handleDeleteReport(r.id)}>Delete</button></div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return <AuthProvider><AdminContent /></AuthProvider>
}
