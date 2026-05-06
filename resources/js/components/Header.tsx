import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Button } from './ui/button';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

interface HeaderProps {
    onCurrencyChange: (currency: string) => void;
    selectedCurrency: string;
}

export default function Header({ onCurrencyChange, selectedCurrency }: HeaderProps) {
    const { auth } = usePage().props;
    const [headerBg, setHeaderBg] = React.useState('bg-gray-400');
    const [searchTerm, setSearchTerm] = React.useState('');
    const currencies = [
        'USD', // US Dollar
        'EUR', // Euro
        'GBP', // British Pound
        'JPY', // Japanese Yen
        'CAD', // Canadian Dollar
        'AUD', // Australian Dollar
        'CHF', // Swiss Franc
        'CNY', // Chinese Yuan
        'INR', // Indian Rupee
        'MXN'  // Mexican Peso
    ];

    function toggleHeaderColor() {
        setHeaderBg(prev => prev === 'bg-gray-400' ? 'bg-blue-600' : 'bg-gray-400');
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const term = (searchTerm ?? '').trim();
        
        // Use Inertia router instead of window.location to prevent full page reload
        // preserveState: true keeps the current React state (like your currency rates)
        router.get('/', 
            { searchterm: term }, 
            { preserveState: true, replace: true }
        );
    }

    return (
        <header className={`${headerBg} text-white`}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
            
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                    <img id="logo" src="/path/to/logo.png" alt="GearLease logo" className="h-8" />
                </div>

                {/* Center: Search */}
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Search
                    </button>
                </form>

                {/* Right: Navigation */}
                <nav className="flex items-center gap-4">
                    <Menu as="div" className="relative">
                        <MenuButton className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-gray-300 hover:bg-gray-400">
                            <span className="material-symbols-outlined text-black">person</span>
                        </MenuButton>
                        <MenuItems className="absolute left-1/2 top-full mt-2 w-44 text-center -translate-x-1/2 transform bg-white rounded-md shadow-lg z-50 py-1 border border-gray-400">
                            <MenuItem as={Link} href="/profile" className="block px-3 py-2 text-sm text-black hover:bg-gray-100">
                                Profile
                            </MenuItem>
                            <MenuItem as={Link} href="/create-listing" className="block px-3 py-2 text-sm text-black hover:bg-gray-100">
                                Create new listing
                            </MenuItem>
                            <MenuItem
                                as="button"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    router.post('/logout');
                                }}
                                className="block w-full px-3 py-2 text-sm text-black hover:bg-gray-100 text-center"
                            >
                                Log Out
                            </MenuItem>
                        </MenuItems>
                    </Menu>

                    <Button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-gray-300 hover:bg-gray-400">
                        <span className="material-symbols-outlined text-black">shopping_cart</span>
                    </Button>

                    {/* Currency Selector */}
                    <div className="flex items-center gap-2 bg-gray-300 rounded-full border-2 border-black px-2 py-1">
                        <span className="material-symbols-outlined text-black text-sm">payments</span>
                        <select 
                            value={selectedCurrency}
                            onChange={(e) => onCurrencyChange(e.target.value)}
                            className="bg-transparent text-black text-sm font-bold focus:outline-none cursor-pointer"
                        >
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <Button className="outline-solid text-black bg-gray-300 hover:bg-gray-400">Options</Button>
                    
                    <Link 
                        href="/logout" 
                        method="post" 
                        as="button" 
                        className="px-4 py-2 text-black bg-gray-300 rounded hover:bg-gray-400 transition-colors font-medium border-2 border-black"
                    >
                        Log Out
                    </Link>
                </nav>
            </div>
        </header>
    );
}