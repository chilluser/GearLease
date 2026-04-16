import React from 'react';
import { useForm, usePage, Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  age?: number;
  avatar?: string | null;
};

export default function Profile() {
  const { props } = usePage();
  const user = props.auth && props.auth.user ? (props.auth.user as unknown as User) : undefined;
  const form = useForm<{
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    age: number | null;
    profile_picture: File | null;
  }>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
    age: user?.age ?? null,
    profile_picture: null,
  });

  // separate form for delete requests
  const deleteForm = useForm({});


  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    form.setData('profile_picture', file);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    
    const endpoint = (typeof (window as any).route === 'function')
      ? (window as any).route('profile.update')
      : '/profile';

    form.put(endpoint, {
      preserveScroll: true,
      preserveState: true,
    });
  }

  const userListings = ((props.userListings ?? props.auth?.user?.listings) ?? []) as any[];


  return (
    <>
      <Head title="Account settings" />
      <div className="container mx-auto p-6">
        <Link href='/' className="inline-block mb-4">
                        &larr; Back to Home
                    </Link>
        <h1 className="text-2xl font-bold mb-4">Account settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: profile form (keeps existing fields) */}
          <div className="col-span-1 bg-white p-6 rounded shadow">
            <form onSubmit={submit} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border">
                  <img
                    src={form.data.profile_picture ? URL.createObjectURL(form.data.profile_picture) : (user?.avatar ?? '/placeholder-avatar.png')}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile picture</label>
                  <input type="file" accept="image/*" onChange={onFileChange} className="mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="mt-1 block w-full" disabled />
                </div>

                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input value={form.data.phone} onChange={e => form.setData('phone', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Password (leave blank to keep)</label>
                  <input type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Address</label>
                  <input value={form.data.address} onChange={e => form.setData('address', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Age</label>
                  <input type="number" value={form.data.age ?? ''} onChange={e => form.setData('age', e.target.value === '' ? null : Number(e.target.value))} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Country</label>
                  <input value={form.data.country} onChange={e => form.setData('country', e.target.value)} className="mt-1 block w-full" />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-gray-800 text-white rounded">
                  Save
                </button>
                <button type="button" onClick={() => form.reset()} className="px-4 py-2 border rounded">
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: user's listings */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Your listings</h2>
            {userListings.length === 0 ? (
              <div className="bg-white p-6 rounded shadow">You have not created any listings yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userListings.map((listing: any) => (
                  <div key={listing.id || listing.listing_id} className="bg-white rounded shadow overflow-hidden">
                    <div className="flex">
                      <img
                        src={listing.image_url ?? '/placeholder.png'}
                        alt={listing.title}
                        className="w-32 h-32 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold">{listing.title}</h3>
                        <p className="text-sm text-gray-600">{listing.category}</p>
                        <p className="text-sm font-medium mt-2">Price per day: {listing.price_per_day}</p>

                        <div className="mt-4 flex gap-2">
                          <button onClick={() => (window.location.href = `/edit-listing/${listing.id ?? listing.listing_id}`)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            <Link href={`/edit-listing/${listing.id ?? listing.listing_id}`}>
                              Edit
                            </Link>
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                            <Link href={`/delete-listing/${listing.id ?? listing.listing_id}`} method="delete" data-confirm="Are you sure?">
                              Delete
                            </Link>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}