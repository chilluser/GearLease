import React from 'react';
import { Head, useForm } from '@inertiajs/react';

const wrap: React.CSSProperties = { maxWidth: 420, margin: '40px auto', padding: 20 };
const inputStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 4, border: '1px solid #d1d5db' };
const btnStyle: React.CSSProperties = { padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };

export default function LogIn() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Log In" />
            <main style={wrap}>
                <h2 style={{ marginBottom: 12 }}>Sign in</h2>
                <form onSubmit={submit}>
                    <div style={{ marginBottom: 12 }}>
                        <label>Email</label>
                        <input style={inputStyle} id="email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label>Password</label>
                        <input style={inputStyle} id="password" name="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label>
                          <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.currentTarget.checked)} />
                          {' '}Remember me
                        </label>
                    </div>

                    <button type="submit" disabled={processing} style={btnStyle}>Log in</button>
                    <button type="button" onClick={() => window.location.href = '/register'} style={{ ...btnStyle, background: '#4b5563', marginLeft: 8 }}>Register</button>
                </form>
            </main>
        </>
    )
}