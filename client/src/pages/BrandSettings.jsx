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
        setSaved(true)
        setLoading(false)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div style={styles.wrap}>
            <nav style={styles.nav}>
                <span style={styles.navLogo} onClick={() => navigate('/dashboard')}>ContentOS</span>
                <span style={styles.back} onClick={() => navigate('/dashboard')}>← Dashboard</span>
            </nav>
            <div style={styles.main}>
                <h2 style={styles.heading}>Brand voice settings</h2>
                <p style={styles.sub}>Teach ContentOS how you write. Every piece of content will match your voice.</p>

                <div style={styles.card}>
                    <label style={styles.label}>Tone</label>
                    <select style={styles.select} value={tone} onChange={e => setTone(e.target.value)}>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="bold">Bold & Direct</option>
                        <option value="friendly">Friendly & Warm</option>
                        <option value="gen-z">Gen-Z</option>
                        <option value="luxury">Luxury & Premium</option>
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
    wrap: { minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif' },
    nav: { background: '#fff', borderBottom: '1px solid #eee', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    navLogo: { fontWeight: 800, fontSize: 18, color: '#7F77DD', cursor: 'pointer' },
    back: { fontSize: 13, color: '#888', cursor: 'pointer' },
    main: { maxWidth: 700, margin: '0 auto', padding: '32px 24px' },
    heading: { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 },
    sub: { fontSize: 14, color: '#888', marginBottom: 24 },
    card: { background: '#fff', borderRadius: 12, border: '1.5px solid #e0e0e0', padding: 24, marginBottom: 20 },
    label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6, marginTop: 16 },
    select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14, outline: 'none', background: '#fff' },
    textarea: { width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'sans-serif', boxSizing: 'border-box' },
    btn: { marginTop: 16, padding: '12px 24px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    success: { marginTop: 10, color: '#1D9E75', fontSize: 13, fontWeight: 600 },
    extractedCard: { background: '#EEEDFE', borderRadius: 12, padding: 20 },
    extractedLabel: { fontSize: 11, fontWeight: 700, color: '#7F77DD', textTransform: 'uppercase', marginBottom: 8 },
    extractedText: { fontSize: 13, color: '#3C3489', lineHeight: 1.7, whiteSpace: 'pre-wrap' }
}
