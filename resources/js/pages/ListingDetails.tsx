import { Button } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

type Item = {
  id: number;
  title: string;
  description?: string;
  price_per_day: number;
  image_url: string;
  seller?: { id: number; name: string };
};

export default function ListingShow() {
  const { props } = usePage();
  const item = props.item as Item;

  return (
    <>
      <div className="flex flex-col items-center container m-8 p-4 bg-gray-200 rounded-lg shadow-md h-auto w-auto">
        <Link href='/' className="inline-block mb-4">
          &larr; Back to Home
        </Link>
        <h1 className="text-5xl font-bold bg-gray-100 rounded-lg shadow-md w-1/2 text-center">{item.title}</h1>
        <img className="w-1/3 bg-gray-100 rounded-lg shadow-md m-4 p-4" src={item.image_url} alt={item.title} />
        <div>
          <div className="flex flex-row items-center gap-2">
            {/* basically i want these two things to be on the left side and the right side. How to do this? Answer: flex-grow */}
            <h1 className="bg-gray-100 rounded-lg shadow-md p-3 m-2 flex-grow">Description: </h1>
            <p className="bg-gray-100 rounded-lg shadow-md p-3 m-2 flex-grow">{item.description}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <h1 className="bg-gray-100 rounded-lg shadow-md p-3 m-2 flex-grow">Price: </h1>
            <p className="bg-gray-100 rounded-lg shadow-md p-3 m-2 flex-grow">${item.price_per_day}/day</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <h1 className="bg-gray-100 rounded-lg shadow-md p-3 m-2 flex-grow">Seller: </h1>
            <p className="bg-gray-100 rounded-lg shadow-md p-3 m-2 flex-grow">{item.seller?.name ?? '—'}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
              <button
                onClick={async () => {
                  const daysStr = window.prompt('How many days would you like to rent this for?', '1');
                  if (!daysStr) return;
                  const days = parseInt(daysStr, 10);
                  if (Number.isNaN(days) || days <= 0) {
                    alert('Please enter a valid number of days');
                    return;
                  }
                  const total = (days * Number(item.price_per_day)).toFixed(2);
                  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

                  // Debug: inspect item object (see if backend uses listing_id or id)
                  console.log('item object:', item);

                  // Debug: show cookie + token in browser console
                  console.log('document.cookie:', document.cookie);
                  console.log('CSRF token meta present:', !!token);

                  const payload = {
                    listing_id: item.id ?? (item as any).listing_id ?? (item as any).listingId ?? null,
                    rent_days: days,
                    total: `$${total}`,
                  };
                  console.log('Rent request -> URL:', `/conversations/${item.seller?.id}/message`);
                  console.log('Rent request -> payload:', payload);

                  // IMPORTANT: credentials must be 'include' so laravel_session cookie is sent
                  const res = await fetch(`/conversations/${item.seller?.id}/message`, {
                     method: 'POST',
                     credentials: 'include',
                     headers: {
                       'Content-Type': 'application/json',
                       'Accept': 'application/json',
                       'X-CSRF-TOKEN': token,
                       'X-Requested-With': 'XMLHttpRequest',
                     },
                     body: JSON.stringify(payload),
                   });
 
                  const status = res.status;
                  const ct = res.headers.get('content-type') ?? '';
                  const raw = await res.text().catch(() => '');
                  console.log('Rent response -> status:', status);
                  console.log('Rent response -> content-type:', ct);
                  console.log('Rent response -> raw text:', raw);

                  if (!res.ok) {
                    alert('Failed to start rent conversation: ' + raw);
                    return;
                  }

                  // If server returned HTML (login page or redirect), stop and show message.
                  if (!ct.includes('application/json')) {
                    console.warn('Expected JSON but got HTML — not navigating. Raw response:', raw);
                    alert('Server did not return JSON. Check session / CSRF. See console for raw response.');
                    return;
                  }

                  let json = null;
                  try { json = JSON.parse(raw); } catch (e) { json = null; }
                  const openId = json?.open_chat ?? null;
                  if (openId) {
                    window.location.href = `/?open_chat=${openId}`;
                  } else {
                    // if backend intentionally returns JSON but no open_chat, stay or go home as you prefer
                    window.location.href = '/';
                  }
                }}
                className="outline-solid text-black bg-gray-300 hover:text-gray-400 px-3 py-2 rounded"
              >
                Rent
              </button>
             <Link method="post" href={`/conversations/${item.seller?.id}/message`} className="...">
               Message Seller
             </Link>
          </div>
        </div>
      </div>
    </>
  );
}