import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(error.message); setLoading(false) }
        else navigate('/dashboard')
    }

    return (
        <div style={styles.wrap}>
            <div style={styles.card}>
                <h1 style={styles.logo}>ContentOS</h1>
                <p style={styles.sub}>Sign in to your account</p>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <input style={styles.input} type="email" placeholder="Email"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    <input style={styles.input} type="password" placeholder="Password"
                        value={password} onChange={e => setPassword(e.target.value)} required />
                    <button style={styles.btn} type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p style={styles.link}>No account? <Link to="/signup">Sign up</Link></p>
            </div>
        </div>
    )
}

const styles = {
    wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
    card: { background: '#fff', borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
    logo: { fontSize: 24, fontWeight: 800, color: '#7F77DD', marginBottom: 4 },
    sub: { color: '#888', fontSize: 14, marginBottom: 24 },
    input: { display: 'block', width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', marginBottom: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    error: { background: '#fff0f0', color: '#cc0000', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13 },
    link: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }
}
