import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function Dashboard() {
    const [keyword, setKeyword] = useState('')
    const [voice, setVoice] = useState('professional')
    const [activeTab, setActiveTab] = useState('blog')
    const [outputs, setOutputs] = useState({ blog: '', linkedin: '', twitter: '', email: '', instagram: '' })
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    const generate = async () => {
        if (!keyword.trim()) return
        setLoading(true)
        setOutputs({ blog: '', linkedin: '', twitter: '', email: '', instagram: '' })
        setActiveTab('blog')

        try {
            const res = await fetch(`${API}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, brand_voice: voice, user_id: user?.id })
            })

            const reader = res.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = decoder.decode(value)
                const lines = text.split('\n').filter(l => l.startsWith('data:'))
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line.replace('data: ', ''))
                        if (json.type === 'token') {
                            setOutputs(prev => ({ ...prev, blog: prev.blog + json.token }))
                        }
                        if (json.type === 'done' && json.data) {
                            setOutputs({
                                blog: json.data.edited_blog || '',
                                linkedin: json.data.linkedin_post || '',
                                twitter: json.data.twitter_thread || '',
                                email: json.data.email_newsletter || '',
                                instagram: json.data.instagram_caption || ''
                            })
                        }
                    } catch { }
                }
            }
        } catch (e) {
            console.error(e)
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
                <span style={styles.navLogo}>ContentOS</span>
                <div style={styles.navLinks}>
                    <span style={styles.navLink} onClick={() => navigate('/brand')}>Brand</span>
                    <span style={styles.navLink} onClick={() => navigate('/history')}>History</span>
                    <span style={{ ...styles.navLink, color: '#cc0000' }} onClick={logout}>Logout</span>
                </div>
            </nav>

            <div style={styles.main}>
                <h2 style={styles.heading}>Generate content</h2>

                <div style={styles.inputRow}>
                    <input style={styles.input} placeholder="Enter your keyword or topic..."
                        value={keyword} onChange={e => setKeyword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && generate()} />
                    <select style={styles.select} value={voice} onChange={e => setVoice(e.target.value)}>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="bold">Bold</option>
                        <option value="friendly">Friendly</option>
                        <option value="gen-z">Gen-Z</option>
                    </select>
                    <button style={styles.btn} onClick={generate} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </div>

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
                        placeholder={loading && activeTab === 'blog' ? 'Writing...' : `Your ${activeTab} content will appear here`} />
                </div>
            </div>
        </div>
    )
}

const styles = {
    wrap: { minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif' },
    nav: { background: '#fff', borderBottom: '1px solid #eee', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    navLogo: { fontWeight: 800, fontSize: 18, color: '#7F77DD' },
    navLinks: { display: 'flex', gap: 24 },
    navLink: { fontSize: 13, color: '#555', cursor: 'pointer', fontWeight: 500 },
    main: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
    heading: { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 20 },
    inputRow: { display: 'flex', gap: 10, marginBottom: 20 },
    input: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14, outline: 'none' },
    select: { padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none', background: '#fff' },
    btn: { padding: '10px 24px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
    tabs: { display: 'flex', gap: 6, marginBottom: 16 },
    tab: { padding: '6px 18px', borderRadius: 20, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#888' },
    tabActive: { background: '#7F77DD', color: '#fff', borderColor: '#7F77DD' },
    outputWrap: { background: '#fff', borderRadius: 12, border: '1.5px solid #e0e0e0', overflow: 'hidden' },
    outputHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #eee' },
    outputLabel: { fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase' },
    copyBtn: { fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1.5px solid #7F77DD', color: '#7F77DD', background: 'transparent', cursor: 'pointer', fontWeight: 600 },
    output: { width: '100%', minHeight: 400, padding: '16px', border: 'none', outline: 'none', fontSize: 13, lineHeight: 1.7, color: '#333', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'sans-serif' }
}
