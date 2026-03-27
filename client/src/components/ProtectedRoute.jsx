import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
    const [checking, setChecking] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate('/login')
            else setChecking(false)
        })
    }, [])

    if (checking) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>
    return children
}
