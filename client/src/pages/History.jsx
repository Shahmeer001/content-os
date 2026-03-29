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

    const fetchHistory = async () => {
        const { data: userData } = await supabase.auth.getUser()
        setUser(userData?.user)

        let query = supabase.from('content_history').select('*').order('created_at', { ascending: false })

        // Temporarily bypassing .eq('user_id') filter to catch mismatched identity issues!
        const { data: historyData, error } = await query

        if (error) {
            alert("History Fetch Error: " + error.message)
            console.error("Fetch Error:", error)
        }

        setHistory(historyData || [])
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const remove = async (id) => {
        await supabase.from('content_history').delete().eq('id', id)
        setHistory(h => h.filter(item => item.id !== id))
    }

    const tabs = ['blog', 'linkedin', 'twitter', 'email', 'instagram']
    const tabKey = { blog: 'blog', linkedin: 'linkedin', twitter: 'twitter', email: 'email', instagram: 'instagram' }

    return (
        <div style={styles.wrap}>
            <nav style={styles.nav}>
                <span style={styles.back} onClick={() => navigate('/dashboard')}>← Dashboard</span>
                <span style={styles.navLogo} onClick={() => navigate('/dashboard')}>ContentOS</span>
            </nav>
            <div style={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ ...styles.heading, marginBottom: 0 }}>Content history</h2>
                    <button style={styles.expandBtn} onClick={fetchHistory}>Refresh History</button>
                </div>

                {history.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>No content generated yet.</p>}
                {history.map(item => (
                    <div key={item.id} style={styles.card}>
                        <div style={styles.cardTop}>
                            <div>
                                <div style={styles.keyword}>{item.keyword}</div>
                                <div style={styles.date}>
                                    {new Date(item.created_at).toLocaleDateString()} · SEO score: {item.seo_score}/100
                                    <br />
                                    <span style={{ fontSize: 10, color: '#aaa' }}>
                                        UserID: {item.user_id?.substring(0, 8)}... |
                                        Blog: {item.blog?.length || 0} chars | LinkedIn: {item.linkedin?.length || 0} chars
                                    </span>
                                </div>
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
    wrap: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        backgroundAttachment: 'fixed',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#fff'
    },
    nav: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    navLogo: {
        fontWeight: 900,
        fontSize: 22,
        background: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
        cursor: 'pointer'
    },
    back: {
        fontSize: 14,
        color: '#e0e0e0',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.2s',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '8px 20px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ... { '&:hover': { color: '#fff', background: 'rgba(255, 255, 255, 0.1)' } }
    },
    main: { maxWidth: 960, margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.5s ease' },
    heading: { fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 30, letterSpacing: '-0.5px' },
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: 24,
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    keyword: { fontSize: 18, fontWeight: 800, color: '#fff' },
    date: { fontSize: 13, color: '#aaa', marginTop: 6, lineHeight: 1.5 },
    expandBtn: {
        padding: '8px 20px',
        borderRadius: 10,
        border: '1.5px solid rgba(0, 201, 255, 0.5)',
        color: '#00C9FF',
        background: 'rgba(0, 201, 255, 0.1)',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    deleteBtn: {
        padding: '8px 20px',
        borderRadius: 10,
        border: '1.5px solid rgba(255, 100, 100, 0.5)',
        color: '#ff6b6b',
        background: 'rgba(255, 100, 100, 0.1)',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    detail: { marginTop: 24, borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 24 },
    tabs: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
    tab: {
        padding: '8px 24px',
        borderRadius: 30,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        color: '#aaa',
        transition: 'all 0.3s ease'
    },
    tabActive: {
        background: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
        color: '#111',
        borderColor: 'transparent',
        boxShadow: '0 4px 12px rgba(0, 201, 255, 0.3)'
    },
    output: {
        width: '100%',
        padding: '20px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 14,
        lineHeight: 1.8,
        color: '#f0f0f0',
        background: 'rgba(0,0,0,0.3)',
        resize: 'vertical',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
        outline: 'none'
    },
    copyBtn: {
        marginTop: 16,
        padding: '10px 24px',
        borderRadius: 10,
        border: 'none',
        color: '#111',
        background: '#92FE9D',
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(146, 254, 157, 0.3)'
    }
}
