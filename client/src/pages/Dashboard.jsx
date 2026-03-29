import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function Dashboard() {
    const [keyword, setKeyword] = useState('')
    const [voice, setVoice] = useState('professional')
    const [activeTab, setActiveTab] = useState('blog')
    const [outputs, setOutputs] = useState({ blog: '', linkedin: '', twitter: '', email: '', instagram: '' })
    const [debugLog, setDebugLog] = useState([])
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    const addLog = (msg) => setDebugLog(l => [...l, msg])

    // Load state from sessionStorage on mount
    useEffect(() => {
        const savedOutputs = sessionStorage.getItem('dashboard_outputs')
        const savedKeyword = sessionStorage.getItem('dashboard_keyword')
        if (savedOutputs) setOutputs(JSON.parse(savedOutputs))
        if (savedKeyword) setKeyword(savedKeyword)

        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    const generate = async () => {
        if (!keyword.trim()) return

        sessionStorage.setItem('dashboard_keyword', keyword)

        setLoading(true)
        let currentOutputs = { blog: '', linkedin: '', twitter: '', email: '', instagram: '' }
        setOutputs(currentOutputs)
        setActiveTab('blog')

        try {
            const res = await fetch(`${API}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, brand_voice: voice, user_id: user?.id })
            })

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // Keep the incomplete line for the next chunk

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue

                    try {
                        const json = JSON.parse(line.replace('data:', '').trim())

                        if (json.type === 'token') {
                            const target = json.target || 'blog'
                            currentOutputs[target] += json.token
                            setOutputs({ ...currentOutputs })
                            sessionStorage.setItem('dashboard_outputs', JSON.stringify(currentOutputs))

                            // Auto-switch tab if it's social content starting
                            if (target !== 'blog') setActiveTab(target)
                        }
                        if (json.type === 'done') {
                            addLog('Received DONE signal from backend.')
                            // Save to database natively outside of React state cycle
                            if (user?.id) {
                                addLog('Attempting Supabase insert for user: ' + user.id)
                                const { data: insertedData, error: dbError } = await supabase.from('content_history').insert({
                                    user_id: user.id,
                                    keyword: keyword,
                                    blog: currentOutputs.blog || '',
                                    linkedin: currentOutputs.linkedin || '',
                                    twitter: currentOutputs.twitter || '',
                                    email: currentOutputs.email || '',
                                    instagram: currentOutputs.instagram || '',
                                    seo_score: json.seo_score || 0
                                }).select()

                                if (dbError) {
                                    alert("Database Insert Error: " + dbError.message)
                                    addLog('DB Error: ' + dbError.message)
                                } else if (!insertedData || insertedData.length === 0) {
                                    addLog('FATAL: Supabase returned NO error, but the row was NOT inserted (returned empty). RLS might still be active!')
                                } else {
                                    addLog(`Successfully confirmed insertion! New Row ID: ${insertedData[0].id}`)
                                }
                            } else {
                                addLog('User not logged in, skipping insert.')
                            }
                        }
                        if (json.type === 'error') {
                            alert('Backend Error: ' + json.message)
                            addLog('Backend Error: ' + json.message)
                        }
                    } catch (err) {
                        // Silently ignore incomplete JSON if any sneak through
                    }
                }
            }
            addLog('Stream loop completed naturally.')
        } catch (e) {
            addLog('Exception thrown: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const copy = (text) => navigator.clipboard.writeText(text)

    const logout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const tabs = ['blog', 'linkedin', 'twitter', 'email', 'instagram']

    return (
        <div style={styles.wrap}>
            <nav style={styles.nav}>
                <div style={styles.navLinks}>
                    <span style={styles.navLink} onClick={() => navigate('/brand')}>Brand</span>
                    <span style={styles.navLink} onClick={() => navigate('/history')}>History</span>
                    <span style={{ ...styles.navLink, color: '#cc0000' }} onClick={logout}>Logout</span>
                </div>
                <span style={styles.navLogo}>ContentOS</span>
            </nav>

            <div style={styles.main}>
                <h2 style={styles.heading}>Generate content</h2>

                <div style={styles.inputRow}>
                    <input style={styles.input} placeholder="Enter your keyword or topic..."
                        value={keyword} onChange={e => setKeyword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && generate()} />
                    <select style={styles.select} value={voice} onChange={e => setVoice(e.target.value)}>
                        <option style={styles.option} value="professional">Professional</option>
                        <option style={styles.option} value="casual">Casual</option>
                        <option style={styles.option} value="bold">Bold</option>
                        <option style={styles.option} value="friendly">Friendly</option>
                        <option style={styles.option} value="gen-z">Gen-Z</option>
                    </select>
                    <button style={styles.btn} onClick={generate} disabled={loading}>
                        {loading ? `Generating ${activeTab}...` : 'Generate'}
                    </button>
                </div>

                {debugLog.length > 0 && (
                    <div style={{ background: '#333', color: '#0f0', padding: 10, marginBottom: 20, fontFamily: 'monospace', fontSize: 11, borderRadius: 6 }}>
                        <strong>Debug Logs:</strong>
                        {debugLog.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                )}

                <div style={styles.tabs}>
                    {tabs.map(tab => (
                        <button key={tab} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div style={styles.outputWrap}>
                    <div style={styles.outputHeader}>
                        <span style={styles.outputLabel}>{activeTab}</span>
                        {outputs[activeTab] && (
                            <button style={styles.copyBtn} onClick={() => copy(outputs[activeTab])}>Copy</button>
                        )}
                    </div>
                    <textarea style={styles.output} readOnly
                        value={outputs[activeTab]}
                        placeholder={loading ? `Generating ${activeTab}...` : `Your ${activeTab} content will appear here`} />
                </div>
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
        letterSpacing: '-0.5px'
    },
    navLinks: {
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '10px 24px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    navLink: { fontSize: 14, color: '#e0e0e0', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s', ... { '&:hover': { color: '#fff' } } },
    main: { maxWidth: 960, margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.5s ease' },
    heading: { fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 30, letterSpacing: '-0.5px' },
    inputRow: {
        display: 'flex',
        gap: 16,
        marginBottom: 30,
        background: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)'
    },
    input: {
        flex: 1,
        padding: '14px 20px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.15)',
        fontSize: 15,
        outline: 'none',
        background: 'rgba(0,0,0,0.3)',
        color: '#fff',
        transition: 'all 0.3s ease'
    },
    select: {
        padding: '14px 20px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.15)',
        fontSize: 14,
        outline: 'none',
        background: 'rgba(0,0,0,0.3)',
        color: '#fff',
        cursor: 'pointer'
    },
    option: {
        background: '#24243e',
        color: '#fff'
    },
    btn: {
        padding: '14px 36px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 800,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
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
    outputWrap: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    },
    outputHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0,0,0,0.2)'
    },
    outputLabel: { fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' },
    copyBtn: {
        fontSize: 12,
        padding: '6px 16px',
        borderRadius: 20,
        border: 'none',
        color: '#111',
        background: '#92FE9D',
        cursor: 'pointer',
        fontWeight: 700,
        boxShadow: '0 2px 10px rgba(146, 254, 157, 0.3)'
    },
    output: {
        width: '100%',
        minHeight: 450,
        padding: '24px',
        border: 'none',
        outline: 'none',
        fontSize: 15,
        lineHeight: 1.8,
        color: '#f0f0f0',
        background: 'transparent',
        resize: 'vertical',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif"
    }
}
