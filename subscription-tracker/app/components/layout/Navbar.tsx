'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCreditCard, FiDollarSign, FiSettings, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { auth } from '@/app/utils/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '@/app/context/ThemeContext';
import { FiX } from "react-icons/fi";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Subscriptions', href: '/subscriptions', icon: <FiCreditCard className="w-5 h-5" /> },
    { name: 'Finances', href: '/finances', icon: <FiDollarSign className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                SubTracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <FiSun className="h-6 w-6" /> : <FiMoon className="h-6 w-6" />}
            </button>
            <button
              onClick={handleSignOut}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Sign out</span>
              <FiLogOut className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-100 mr-1"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`${
                  pathname === item.href
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </div>
              </Link>
            ))}
            <button
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="w-full text-left border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <div className="flex items-center">
                <span className="mr-2"><FiLogOut className="w-5 h-5" /></span>
                Sign Out
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;