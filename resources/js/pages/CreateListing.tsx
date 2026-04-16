import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

const wrap: React.CSSProperties = { maxWidth: 420, margin: '40px auto', padding: 20 };
const inputStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 4, border: '1px solid #d1d5db' };
const btnStyle: React.CSSProperties = { padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };

export default function CreateListing() {

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: '',
        price_per_day: '',
        image_url: null as File | null,
    });

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image_url', file);
    };

    const defaultCategories = [
        '3Dprinters',
        'Audio & Sound Recording',
        'Camping & Expedition Gear',
        'Automotive',
        'Cinema Cameras',
        'Virtual Reality',
        'Tools',
        'Drones',
        'Electrical Gear',
        'Heavy Machinery',
        'Musical instruments',
    ];

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/store-listing');
    }

    return (
        <>
            <Head title="Create Listing" />
            <main style={wrap}>
                <Link href='/' className="inline-block mb-4">
                    &larr; Back to Home
                </Link>
                <h2 style={{ marginBottom: 12 }}>Create a new listing</h2>
                <form onSubmit={submit}>
                    <div style={{ marginBottom: 12 }}>
                        <label>Title</label>
                        <input style={inputStyle} id="title" name="title" type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                        {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label>Description</label>
                        <textarea style={{ ...inputStyle, height: 100 }} id="description" name="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        {errors.description && <div style={{ color: 'red' }}>{errors.description}</div>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label>Category</label>
                        <select style={inputStyle} id="category" name="category" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            <option value="">Select a category</option>
                            {defaultCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label>Price per Day</label>
                        <input style={inputStyle} id="price_per_day" name="price_per_day" type="text" value={data.price_per_day} onChange={(e) => setData('price_per_day', e.target.value)} />
                        {errors.price_per_day && <div style={{ color: 'red' }}>{errors.price_per_day}</div>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label>Image</label>
                        <input type="file" accept="image/*" onChange={onFileChange} />
                        {data.image_url && (
                        <div style={{ marginTop: 8 }}>
                            <img src={URL.createObjectURL(data.image_url)} alt="preview" style={{maxWidth:200}}/>
                        </div>
                        )}
                        {errors.image_url && <div style={{ color: 'red' }}>{errors.image_url}</div>}
                    </div>

                    <button type="submit" style={btnStyle} disabled={processing}>Create Listing</button>
                </form>
            </main>
        </>
    )
}