import React, { useEffect, useState } from 'react';
import { usePage, Head, router, Link } from '@inertiajs/react'; // Use router from @inertiajs/react
import Header from '../components/Header';
import SidePanel from '../components/SidePanel';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';

type Item = {
    listing_id: number;
    title: string;
    description?: string;
    price_per_day: number;
    image_url: string;
    seller_id: number;
    seller?: { id: number; name: string };
}

export default function Home() {
    const { props } = usePage();
    const auth = (props as any).auth;
    const user = auth?.user;
    
    const raw = (props as any).items;
    const items = Array.isArray(raw) ? raw : (raw?.data ?? []);
    
    const [rates, setRates] = useState<any>(null);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [externalInfo, setExternalInfo] = useState("");

    // Authentication Guard
    useEffect(() => {
        if (!user) {
            router.visit('/login');
        }
    }, [user]);

    // Fetch Exchange Rates
    useEffect(() => {
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(res => res.json())
            .then(data => setRates(data.rates))
            .catch(err => console.error("Currency API failed", err));
    }, []);

    // Fetch System Info
    useEffect(() => {
        fetch('/external-info')
            .then(res => res.json())
            .then(data => setExternalInfo(data.info))
            .catch(err => console.error("External Info failed", err));
    }, []);

    const convertPrice = (priceInUsd: number) => {
        if (!rates || selectedCurrency === 'USD') return priceInUsd.toFixed(2);
        const rate = rates[selectedCurrency];
        return (priceInUsd * rate).toFixed(2);
    };

    return (
        <>
            <Head title="Home - GearLease" />
            
            {/* 1. PASS THE PROPS HERE */}
            <Header 
                selectedCurrency={selectedCurrency} 
                onCurrencyChange={(curr) => setSelectedCurrency(curr)} 
            />

            <main className="mx-auto p-6 text-gray-800">
                <div className="grid grid-cols-12 gap-6 items-start">
                    <aside className="col-span-12 md:col-span-3 flex-none">
                        <div className="w-full sticky top-20">
                            <SidePanel />
                        </div>
                    </aside>

                    <section className="col-span-12 md:col-span-9">
                        <div className="p-4 bg-gray-300 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item: Item) => (
                                    <article
                                        key={item.listing_id} // Use ID for key, not title
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex flex-col"
                                    >
                                        <div className="h-48 w-full bg-gray-100 overflow-hidden">
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
                                            <p className="text-sm text-gray-600 mb-3 max-h-16 overflow-hidden">
                                                {item.description}
                                            </p>

                                            <div className="mt-auto flex items-center gap-3">
                                                <span className="inline-block bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">
                                                    {convertPrice(item.price_per_day)} {selectedCurrency} / day
                                                </span>
                                                <span className="ml-auto text-xs text-gray-500">
                                                    Seller: {item.seller?.name ?? '—'}
                                                </span>
                                                <Link 
                                                    href={`/listings/${item.listing_id}`} 
                                                    className="inline-block bg-blue-500 text-white font-semibold px-3 py-1 rounded-full text-sm hover:bg-blue-600"
                                                >
                                                    Rent Now
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            
            <footer className="p-6 border-t mt-12 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">System Info from GitHub: {externalInfo}</p>
            </footer>

            <ChatWidget />
        </>
    );
}