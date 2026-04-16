import React, {useEffect} from 'react';
import { usePage, Head } from '@inertiajs/react';
import Header from '../components/Header';
import SidePanel from '../components/SidePanel';
import { Button } from '../components/ui/button';
import { Inertia } from '@inertiajs/inertia';

type Item ={
    title: string;
    description?: string;
    price_per_day: number;
    image_url: string;
    seller_id: number;
    seller?: {id: number; name: string};
}

export default function Home() {
    const { props } = usePage();
    const user = {} //props.auth?.user;
    const items = props.items as Item[];

    console.log('Home component rendered with items:', items);
    //still has all the values.
    React.useEffect(() => {

        if (!user) Inertia.visit('/login');
        else {
            if (!items) {
                console.log('No items found');
            } else {
                console.log(`${items.length} items loaded`);
            }
        }
    }, [items]);

    return (
        <>
            <Header />
            <main className=" mx-auto p-6 text-gray-800">
                <div className="grid grid-cols-12 gap-6 items-start">
                    <aside className="col-span-12 md:col-span-3 flex-none">
                        <div className="w-full sticky top-20">
                            <div className="w-full max-w-xs md:max-w-none"> {/* <- constrain sidebar width */}
                                <SidePanel />
                            </div>
                        </div>
                    </aside>

                    <section className="col-span-12 md:col-span-9">
                        <div className="p-4 bg-gray-300 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => (
                                    <article
                                        key={item.title}
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
                                                    ${item.price_per_day}/day
                                                </span>
                                                <span className="ml-auto text-xs text-gray-500">
                                                    Seller: {item.seller?.name ?? '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
