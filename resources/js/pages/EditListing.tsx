import React, { useEffect } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import Header from '../components/Header';
import SidePanel from '../components/SidePanel';
import { Button } from '../components/ui/button';

type ListingType = {
  listing_id?: number;
  id?: number;
  title: string;
  description: string;
  price_per_day: number | string;
  image_url?: string;
  category?: string;
};

export default function EditListing() {
  const { props } = usePage();
  const listing = (props.listing as ListingType) ?? ({} as ListingType);
  const id = listing.listing_id ?? listing.id;

  const form = useForm<ListingType>({
    title: listing.title ?? '',
    description: listing.description ?? '',
    price_per_day: listing.price_per_day ?? '',
    image_url: listing.image_url ?? '',
    category: listing.category ?? '',
  });

  useEffect(() => {
    // keep form synced if page props change (hot navigation)
    form.setData({
      title: listing.title ?? '',
      description: listing.description ?? '',
      price_per_day: listing.price_per_day ?? '',
      image_url: listing.image_url ?? '',
      category: listing.category ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.listing_id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    // send a PUT request to update — ensure you have a matching route/controller
    form.put(`/update-listing/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // redirect to profile or listing page after successful update
        window.location.href = '/profile';
      },
    });
  }

  return (
    <div>
      <Head title={`Edit Listing - ${form.data.title || 'Listing'}`} />
      <main className="p-6 max-w-3xl mx-auto">
        <Link href='/profile' className="inline-block mb-4">
          &larr; Back to Profile
        </Link>
        <h1 className="text-2xl font-semibold mb-6">Edit Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={form.data.title}
              onChange={e => form.setData('title', e.target.value)}
              className="w-full border rounded p-2"
            />
            {form.errors.title && <div className="text-red-600 text-sm mt-1">{form.errors.title}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.data.description}
              onChange={e => form.setData('description', e.target.value)}
              className="w-full border rounded p-2 h-32"
            />
            {form.errors.description && <div className="text-red-600 text-sm mt-1">{form.errors.description}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price per Day</label>
              <input
                type="number"
                value={String(form.data.price_per_day)}
                onChange={e => form.setData('price_per_day', e.target.value)}
                className="w-full border rounded p-2"
              />
              {form.errors.price_per_day && <div className="text-red-600 text-sm mt-1">{form.errors.price_per_day}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={form.data.category}
                onChange={e => form.setData('category', e.target.value)}
                className="w-full border rounded p-2"
              />
              {form.errors.category && <div className="text-red-600 text-sm mt-1">{form.errors.category}</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={form.data.image_url ?? ''}
              onChange={e => form.setData('image_url', e.target.value)}
              className="w-full border rounded p-2"
            />
            {form.errors.image_url && <div className="text-red-600 text-sm mt-1">{form.errors.image_url}</div>}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button type="submit" disabled={form.processing}>
              Save Changes
            </Button>

            <Link href='profile.edit' className="inline-block">
              <button type="button" className="px-4 py-2 border rounded">Cancel</button>
            </Link>

            {id && (
              <button
                type="button"
                onClick={() => {
                  if (!confirm('Delete this listing?')) return;
                  // delete by sending DELETE to the delete route
                  form.delete(`/delete-listing/${id}`, {
                    onSuccess: () => (window.location.href = '/profile'),
                  });
                }}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}