import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function BrandSettings() {
    const [tone, setTone] = useState('professional')
    const [sample, setSample] = useState('')
    const [extracted, setExtracted] = useState('')
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            setUser(data.user)
            if (data.user) {
                const res = await fetch(`${API}/brand/${data.user.id}`)
                const json = await res.json()
                if (json.profile) {
                    setTone(json.profile.tone || 'professional')
                    setSample(json.profile.sample_text || '')
                    setExtracted(json.profile.extracted_voice || '')
                }
            }
        })
    }, [])

    const save = async () => {
        if (!sample.trim() || sample.length < 50) return alert('Please enter at least 50 characters of sample text')
        setLoading(true)
        const res = await fetch(`${API}/brand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, tone, sample_text: sample })
        })
        const json = await res.json()
        setExtracted(json.extracted_voice)

        // Save to database from frontend using authenticated session
        if (user?.id) {
            const { data } = await supabase.from('brand_profiles').select('id').eq('user_id', user.id)
            if (data && data.length > 0) {
                await supabase.from('brand_profiles').update({ tone, sample_text: sample, extracted_voice: json.extracted_voice }).eq('user_id', user.id)
            } else {
                await supabase.from('brand_profiles').insert({ user_id: user.id, tone, sample_text: sample, extracted_voice: json.extracted_voice })
            }
        }
        setSaved(true)
        setLoading(false)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div style={styles.wrap}>
            <nav style={styles.nav}>
                <span style={styles.back} onClick={() => navigate('/dashboard')}>← Dashboard</span>
                <span style={styles.navLogo} onClick={() => navigate('/dashboard')}>ContentOS</span>
            </nav>
            <div style={styles.main}>
                <h2 style={styles.heading}>Brand voice settings</h2>
                <p style={styles.sub}>Teach ContentOS how you write. Every piece of content will match your voice.</p>

                <div style={styles.card}>
                    <label style={styles.label}>Tone</label>
                    <select style={styles.select} value={tone} onChange={e => setTone(e.target.value)}>
                        <option style={styles.option} value="professional">Professional</option>
                        <option style={styles.option} value="casual">Casual</option>
                        <option style={styles.option} value="bold">Bold & Direct</option>
                        <option style={styles.option} value="friendly">Friendly & Warm</option>
                        <option style={styles.option} value="gen-z">Gen-Z</option>
                        <option style={styles.option} value="luxury">Luxury & Premium</option>
                    </select>

                    <label style={styles.label}>Writing sample <span style={{ color: '#aaa', fontWeight: 400 }}>(paste 100+ words of your best writing)</span></label>
                    <textarea style={styles.textarea} placeholder="Paste a sample of your writing here..."
                        value={sample} onChange={e => setSample(e.target.value)} rows={8} />

                    <button style={styles.btn} onClick={save} disabled={loading}>
                        {loading ? 'Extracting voice...' : 'Save & extract my brand voice'}
                    </button>
                    {saved && <div style={styles.success}>Brand voice saved successfully</div>}
                </div>

                {extracted && (
                    <div style={styles.extractedCard}>
                        <div style={styles.extractedLabel}>Your extracted brand voice</div>
                        <div style={styles.extractedText}>{extracted}</div>
                    </div>
                )}
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
    heading: { fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' },
    sub: { fontSize: 15, color: '#aaa', marginBottom: 30 },
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: 32,
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    },
    label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10, marginTop: 24, textTransform: 'uppercase', letterSpacing: '1px' },
    select: {
        width: '100%',
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
    textarea: {
        width: '100%',
        padding: '20px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.15)',
        fontSize: 15,
        outline: 'none',
        resize: 'vertical',
        lineHeight: 1.8,
        color: '#f0f0f0',
        background: 'rgba(0,0,0,0.3)',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box'
    },
    btn: {
        marginTop: 24,
        padding: '16px 36px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        width: '100%'
    },
    success: { marginTop: 16, color: '#92FE9D', fontSize: 13, fontWeight: 700, textAlign: 'center' },
    extractedCard: {
        background: 'rgba(0, 201, 255, 0.05)',
        borderRadius: 16,
        padding: 24,
        border: '1px solid rgba(0, 201, 255, 0.2)'
    },
    extractedLabel: { fontSize: 12, fontWeight: 800, color: '#00C9FF', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '1px' },
    extractedText: { fontSize: 15, color: '#e0e0e0', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif" }
}
