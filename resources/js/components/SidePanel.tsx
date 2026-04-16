// ...existing code...
import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from './ui/button';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

export default function SidePanel({categories = []}) {
    // fallback categories when none passed
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

    const things = categories.length ? categories : defaultCategories;

    return (
        <aside className="bg-gray-300 p-4 self-start rounded-md"> 
            <nav className="flex flex-col gap-2">
                <Button className="bg-gray-300 outline-solid text-black hover:text-gray-400">Trending</Button>
                <Button className="bg-gray-300 outline-solid text-black hover:text-gray-400">Popular</Button>

                <Menu>
                    <MenuButton
                      as={Button}
                      className="w-full text-left bg-gray-300 outline-solid text-black px-4 py-2 rounded-md mt-4 hover:text-gray-400"
                    >
                        Categories
                    </MenuButton>

                    <MenuItems className="bg-gray-300 !outline-solid text-black rounded-md mt-2 p-2 flex flex-col gap-2">

                        <MenuItem as={Button} className="w-full text-black outline-solid text-left bg-gray-300 hover:bg-gray-600 px-4 py-2 rounded-md">
                            <Link className="w-full hover:text-white text-black text-center bg-transparent px-4 py-2 rounded-md" href='/'>{'All'}</Link>
                        </MenuItem>

                        {/* dynamic categories */}
                        {things.map((thing) => {
                            const slug = encodeURIComponent(thing);
                            return (
                                <MenuItem key={thing} as={Button} className="w-full text-black outline-solid text-left bg-gray-300 hover:bg-gray-600 px-4 py-2 rounded-md">
                                    <Link className="w-full text-black hover:text-white text-center bg-transparent px-4 py-2 rounded-md" href={`/category/${slug}`}>{thing}</Link>
                                </MenuItem>
                            );
                        })}
                    </MenuItems>
                </Menu>

            </nav>
        </aside>
    )
}
// ...existing code...