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
                <p style={styles.link}>No account? <Link to="/signup" style={styles.linkAnchor}>Sign up</Link></p>
            </div>
        </div>
    )
}

const styles = {
    wrap: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        backgroundAttachment: 'fixed',
        fontFamily: "'Inter', system-ui, sans-serif"
    },
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        borderRadius: 20,
        padding: '50px 40px',
        width: '100%',
        maxWidth: 400,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        textAlign: 'center'
    },
    logo: {
        fontSize: 32,
        fontWeight: 900,
        background: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 8,
        letterSpacing: '-1px'
    },
    sub: { color: '#aaa', fontSize: 15, marginBottom: 30, letterSpacing: '0.5px' },
    input: {
        display: 'block',
        width: '100%',
        padding: '16px 20px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.15)',
        marginBottom: 16,
        fontSize: 15,
        outline: 'none',
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.3)',
        color: '#fff',
        transition: 'all 0.3s ease'
    },
    btn: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        marginTop: 10
    },
    error: { background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255, 100, 100, 0.5)', color: '#ff6b6b', borderRadius: 8, padding: '12px', marginBottom: 20, fontSize: 14 },
    link: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#aaa' },
    linkAnchor: { color: '#00C9FF', textDecoration: 'none', fontWeight: 600 }
}
