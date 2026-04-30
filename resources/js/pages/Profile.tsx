import React from 'react';
import { useForm, usePage, Head, Link } from '@inertiajs/react';

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

type RentRequest = {
  id: number;
  renter_name: string;
  text: string;
};

export default function Profile() {
  const { props } = usePage();
  const user = props.auth && props.auth.user ? (props.auth.user as unknown as User) : undefined;
  const [showRentRequestPanel, setShowRentRequestPanel] = React.useState(false);
  const [rentRequests, setRentRequests] = React.useState<RentRequest[]>([]);
  const [myRentals, setMyRentals] = React.useState<any[]>([]);

  async function loadRentRequests() {
    try {
      console.log('Fetching /rent-requests');
      const res = await fetch('/rent-requests', { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }});
      const status = res.status;
      const ct = res.headers.get('content-type') ?? '';
      const raw = await res.text().catch(() => '');
      console.log('Rent requests -> status:', status);
      console.log('Rent requests -> content-type:', ct);
      console.log('Rent requests -> raw text:', raw);
      let data: any = [];
      try { data = ct.includes('application/json') ? JSON.parse(raw) : []; } catch (e) { data = []; }
      setRentRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRentRequests([]);
    }
  }

  async function loadMyRentals() {
    try {
      const res = await fetch('/my-rentals', { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }});
      const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : [];
      setMyRentals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMyRentals([]);
    }
  }

  async function approveRequest(messageId: number) {
    try {
      const res = await fetch(`/rent-requests/${messageId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Approve failed: ' + res.status);
      const json = await res.json();
      console.log('Approve response', json);
      // refresh lists
      await loadRentRequests();
      await loadMyRentals();
    } catch (err) {
      console.error('Error approving request', err);
      alert('Error approving request');
    }
  }

  React.useEffect(() => 
    {
    console.log('Rent Requests:', rentRequests);
    loadRentRequests();
    loadMyRentals();
  }, []);

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
        <Link href="/" className="inline-block mb-4">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-bold mb-4">Account settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: profile form */}
          <div className="col-span-1 bg-gray-100 p-6 rounded shadow">
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
                  <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="mt-1 block w-full" disabled />
                </div>

                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Password (leave blank to keep)</label>
                  <input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Address</label>
                  <input value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Age</label>
                  <input type="number" value={form.data.age ?? ''} onChange={(e) => form.setData('age', e.target.value === '' ? null : Number(e.target.value))} className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Country</label>
                  <input value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} className="mt-1 block w-full" />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-gray-800 text-white rounded">
                  Save
                </button>
                <button onClick={() => form.reset()} className="px-4 py-2 border rounded">
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
                          <Link href={`/delete-listing/${listing.id ?? listing.listing_id}`} method="delete" data-confirm="Are you sure?" className="px-3 py-1 bg-red-600 text-white rounded text-sm inline-block text-center">
                            Delete
                          </Link>

                          <Link href={`/edit-listing/${listing.id ?? listing.listing_id}`} className="px-3 py-1 bg-blue-600 text-white rounded text-sm inline-block text-center">
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rent Requests */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Rent request amount: {rentRequests.length}</h2>
              <button
                onClick={() => setShowRentRequestPanel(true)}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
              >
                View Rent Requests
              </button>
            </div>
            {/* My Rentals */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Your current rentals</h2>
              {myRentals.length === 0 ? (
                <div className="bg-white p-4 rounded mt-2">You have no active rentals.</div>
              ) : (
                <div className="grid gap-4 mt-2">
                  {myRentals.map((r: any) => (
                    <div key={r.id} className="p-4 bg-white rounded shadow flex items-center gap-4">
                      {r.image_url && <img src={r.image_url} className="w-20 h-20 object-cover rounded" alt={r.title} />}
                      <div>
                        <h3 className="font-semibold">{r.title}</h3>
                        <p className="text-sm">Rented at: {r.rented_at ? new Date(r.rented_at).toLocaleString() : '—'}</p>
                        <p className="text-sm">Days left: {typeof r.days_left === 'number' ? r.days_left : '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rent Request Panel */}
        {showRentRequestPanel && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setShowRentRequestPanel(false)}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-1/3"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Rent Requests</h2>
              {rentRequests.length > 0 ? (
                rentRequests.map((request: any) => (
                  <div key={request.id} className="mb-4 p-4 border rounded">
                    <p>
                      <strong>Renter Name:</strong> {request.renter_name}
                    </p>
                    <p>
                      <strong>Message:</strong> {request.text}
                    </p>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                      onClick={() => approveRequest(request.id)}
                    >
                      Approve Request
                    </button>
                  </div>
                ))
              ) : (
                <p>No rent requests available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}