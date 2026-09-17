import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('test@novacart.com'); 
  const [password, setPassword] = useState('password123'); 
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>NovaCart Support</h2>
        <p style={styles.subtitle}>Sign in to your enterprise account</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card: { background: '#ffffff', padding: '40px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  title: { marginBottom: '8px', fontSize: '24px', color: '#1e293b' },
  subtitle: { marginBottom: '24px', color: '#64748b', fontSize: '14px' },
  error: { background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  inputGroup: { marginBottom: '16px', display: 'flex', flexDirection: 'column' },
  input: { padding: '10px', marginTop: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' },
  button: { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};