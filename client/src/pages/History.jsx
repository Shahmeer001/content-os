import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function History() {
    const [history, setHistory] = useState([])
    const [expanded, setExpanded] = useState(null)
    const [activeTab, setActiveTab] = useState('blog')
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            setUser(data.user)
            if (data.user) {
                const res = await fetch(`${API}/history/${data.user.id}`)
                const json = await res.json()
                setHistory(json.history || [])
            }
        })
    }, [])

    const remove = async (id) => {
        await fetch(`${API}/history/${id}`, { method: 'DELETE' })
        setHistory(h => h.filter(item => item.id !== id))
    }

    const tabs = ['blog', 'linkedin', 'twitter', 'email', 'instagram']
    const tabKey = { blog: 'blog', linkedin: 'linkedin', twitter: 'twitter', email: 'email', instagram: 'instagram' }

    return (
        <div style={styles.wrap}>
            <nav style={styles.nav}>
                <span style={styles.navLogo} onClick={() => navigate('/dashboard')}>ContentOS</span>
                <span style={styles.back} onClick={() => navigate('/dashboard')}>← Dashboard</span>
            </nav>
            <div style={styles.main}>
                <h2 style={styles.heading}>Content history</h2>
                {history.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>No content generated yet. Go to the dashboard to create your first piece.</p>}
                {history.map(item => (
                    <div key={item.id} style={styles.card}>
                        <div style={styles.cardTop}>
                            <div>
                                <div style={styles.keyword}>{item.keyword}</div>
                                <div style={styles.date}>{new Date(item.created_at).toLocaleDateString()} · SEO score: {item.seo_score}/100</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={styles.expandBtn} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                                    {expanded === item.id ? 'Collapse' : 'View content'}
                                </button>
                                <button style={styles.deleteBtn} onClick={() => remove(item.id)}>Delete</button>
                            </div>
                        </div>
                        {expanded === item.id && (
                            <div style={styles.detail}>
                                <div style={styles.tabs}>
                                    {tabs.map(t => (
                                        <button key={t} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}
                                            onClick={() => setActiveTab(t)}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <textarea style={styles.output} readOnly value={item[tabKey[activeTab]] || ''} rows={12} />
                                <button style={styles.copyBtn} onClick={() => navigator.clipboard.writeText(item[tabKey[activeTab]] || '')}>
                                    Copy {activeTab}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const styles = {
    wrap: { minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif' },
    nav: { background: '#fff', borderBottom: '1px solid #eee', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    navLogo: { fontWeight: 800, fontSize: 18, color: '#7F77DD', cursor: 'pointer' },
    back: { fontSize: 13, color: '#888', cursor: 'pointer' },
    main: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
    heading: { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 20 },
    card: { background: '#fff', borderRadius: 12, border: '1.5px solid #e0e0e0', padding: 20, marginBottom: 12 },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    keyword: { fontSize: 15, fontWeight: 700, color: '#111' },
    date: { fontSize: 12, color: '#888', marginTop: 4 },
    expandBtn: { padding: '6px 14px', borderRadius: 8, border: '1.5px solid #7F77DD', color: '#7F77DD', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    deleteBtn: { padding: '6px 14px', borderRadius: 8, border: '1.5px solid #ffcccc', color: '#cc0000', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    detail: { marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 },
    tabs: { display: 'flex', gap: 6, marginBottom: 12 },
    tab: { padding: '5px 14px', borderRadius: 20, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#888' },
    tabActive: { background: '#7F77DD', color: '#fff', borderColor: '#7F77DD' },
    output: { width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 12, lineHeight: 1.7, color: '#333', resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box', outline: 'none' },
    copyBtn: { marginTop: 8, padding: '6px 16px', borderRadius: 8, border: '1.5px solid #7F77DD', color: '#7F77DD', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
}
