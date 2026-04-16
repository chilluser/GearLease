import React from 'react';
import { Head, useForm } from '@inertiajs/react';

const formStyle: React.CSSProperties = {
  maxWidth: 420,
  margin: '40px auto',
  padding: 20,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const fieldStyle: React.CSSProperties = { marginBottom: 12, display: 'flex', flexDirection: 'column' };
const inputStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 4, border: '1px solid #d1d5db' };
const btnStyle: React.CSSProperties = { padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };

export default function Register() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string;
        address: string;
        city: string;
        country: string;
        age: string;
        profile_picture: File | null;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        age: '',
        profile_picture: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/register');
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('profile_picture', file);
    }

    return (
        <>
            <Head title="Register" />
            <main style={{ padding: 24 }}>
                <form onSubmit={submit} style={formStyle}>
                    <h2 style={{ marginBottom: 12 }}>Create account</h2>

                    <div style={fieldStyle}>
                        <label>Name</label>
                        <input style={inputStyle} value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
                    </div>

                    <div style={fieldStyle}>
                        <label>Email</label>
                        <input style={inputStyle} value={data.email} onChange={e => setData('email', e.target.value)} />
                        {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
                    </div>

                    <div style={fieldStyle}>
                        <label>Password</label>
                        <input type="password" style={inputStyle} value={data.password} onChange={e => setData('password', e.target.value)} />
                        {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
                    </div>

                    <div style={fieldStyle}>
                        <label>Confirm Password</label>
                        <input type="password" style={inputStyle} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                    </div>

                    <hr style={{ margin: '12px 0' }} />

                    <div style={fieldStyle}>
                        <label>Phone</label>
                        <input style={inputStyle} value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    </div>

                    <div style={fieldStyle}>
                        <label>Address</label>
                        <input style={inputStyle} value={data.address} onChange={e => setData('address', e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                            <label>City</label>
                            <input style={inputStyle} value={data.city} onChange={e => setData('city', e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Country</label>
                            <input style={inputStyle} value={data.country} onChange={e => setData('country', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <label>Age</label>
                        <input type="number" style={inputStyle} value={data.age} onChange={e => setData('age', e.target.value)} />
                    </div>

                    <div style={fieldStyle}>
                        <label>Profile image</label>
                        <input type="file" accept="image/*" onChange={onFileChange} />
                        {errors.profile_picture && <div style={{color:'red'}}>{errors.profile_picture}</div>}
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <button type="button" onClick={() => window.location.href = '/login'} style={{ ...btnStyle, background: '#4b5563', marginRight: 8 }}>Back to Log In</button>
                        <button type="submit" disabled={processing} style={btnStyle}>Register</button>
                    </div>
                </form>
            </main>
        </>
    );
}