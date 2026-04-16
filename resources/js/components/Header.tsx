import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from './ui/button';
import { usePage } from '@inertiajs/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Inertia } from '@inertiajs/inertia';

export default function Header() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [headerBg, setHeaderBg] = React.useState('bg-gray-400');
    const [searchTerm, setSearchTerm] = React.useState('');
    
    function toggleHeaderColor() {
        console.log('Toggling header color');
        setHeaderBg(prev => prev === 'bg-gray-400' ? 'bg-blue-600' : 'bg-gray-400');
    }


    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const term = (searchTerm ?? '').trim();
        const target = term ? `/search/${encodeURIComponent(term)}` : '/';
       window.location.href = target;
    }

    return (
        
        <header className={`${headerBg} text-white`}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
            
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* left: logo */}
                <div className="flex flex-start items-center">
                <img id="logo" src="/path/to/logo.png" alt="GearLease logo" className="h-8" />
                </div>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border rounded text-black"
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Search</button>
                </form>
                {/* right: links & buttons */}
                <nav className="flex flex-end items-center gap-4">
                    
                    <Menu as="div" className="relative">
                        <MenuButton className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-gray-300 hover:bg-gray-400">
                            <span className="material-symbols-outlined text-black">
                                person
                            </span>
                        </MenuButton>

                    
                        <MenuItems className="absolute left-1/2 top-full mt-2 w-44 text-center -translate-x-1/2 transform bg-white rounded-md shadow-lg z-50 py-1 border border-gray-400 ring-1 ring-gray-100">
                            <MenuItem as={Button} onClick={toggleHeaderColor} className="block px-3 py-2 text-sm text-black rounded-md hover:bg-gray-600 hover:text-white">
                                Change color
                            </MenuItem>

                            <MenuItem as={Link} href="/profile" className="block px-3 py-2 text-sm text-black rounded-md hover:bg-gray-600 hover:text-white">
                                Profile
                            </MenuItem>
                            <MenuItem as={Link} href="/create-listing" className="block px-3 py-2 text-sm text-black rounded-md hover:bg-gray-600 hover:text-white">
                                Create new listing
                            </MenuItem>
                            <MenuItem as={Link} href="/logout" className="block px-3 py-2 text-sm text-black rounded-md hover:bg-gray-600 hover:text-white">
                                Account settings
                            </MenuItem>
                        </MenuItems>
                    </Menu>

                    <Button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-gray-300 hover:bg-gray-400" aria-label="Shopping Cart">
                        <span className="material-symbols-outlined text-black">
                            shopping_cart
                        </span>
                    </Button>

                    <Button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-gray-300 hover:bg-gray-400" aria-label="Change Language">
                        <span className="material-symbols-outlined text-black">
                            language
                        </span>
                    </Button>

                    <Button className="outline-solid text-black bg-gray-300 hover:text-gray-400" aria-label="Options">Options</Button>
                    <Link as={Button} href="/logout" className="outline-solid text-black bg-gray-300 hover:text-gray-400">Log Out</Link>
                </nav>
            </div>
        </header>
    )
}