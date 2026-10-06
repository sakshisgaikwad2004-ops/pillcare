// Header.js - Sticky responsive navigation bar for Pillcare Medical
import React, { useState } from 'https://esm.sh/react@18.3.1';
import { PillcareLogo, Icon, Button } from './UI.js';

export function Header({ currentRoute, onNavigate, cartItemCount, onOpenCart, onOpenAdmin, storeConfig }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'medicines', label: 'Medicines & Services' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const phone = storeConfig?.contactNumber || '+91 98765 43210';
  const hours = storeConfig?.businessHours?.weekdays || 'Mon - Sat: 8:00 AM - 10:00 PM';

  return React.createElement('header', { className: 'sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs' },
    // Top Micro-Announcement Bar
    React.createElement('div', { className: 'bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 hidden md:block' },
      React.createElement('div', { className: 'max-w-7xl mx-auto flex justify-between items-center' },
        React.createElement('div', { className: 'flex items-center gap-6' },
          React.createElement('span', { className: 'flex items-center gap-1.5' },
            React.createElement(Icon, { name: 'phone', className: 'w-3.5 h-3.5 text-emerald-400' }),
            React.createElement('span', { className: 'text-slate-300' }, 'Call / WhatsApp:'),
            React.createElement('strong', { className: 'text-white font-medium' }, phone)
          ),
          React.createElement('span', { className: 'flex items-center gap-1.5' },
            React.createElement(Icon, { name: 'clock', className: 'w-3.5 h-3.5 text-emerald-400' }),
            React.createElement('span', { className: 'text-slate-300' }, hours)
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-4 text-emerald-200' },
          React.createElement('span', { className: 'flex items-center gap-1.5' },
            React.createElement('span', { className: 'w-2 h-2 rounded-full bg-emerald-400 badge-live inline-block' }),
            React.createElement('span', { className: 'text-white' }, 'Verified Retail Pharmacy Counter')
          ),
          React.createElement('button', {
            onClick: onOpenAdmin,
            className: 'text-emerald-300 hover:text-white flex items-center gap-1 transition-colors pl-2 border-l border-emerald-800'
          },
            React.createElement(Icon, { name: 'lock', className: 'w-3 h-3' }),
            'Staff Login'
          )
        )
      )
    ),

    // Main Navigation Header
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'flex items-center justify-between h-20' },
        // Brand Logo
        React.createElement('div', {
          className: 'cursor-pointer py-2',
          onClick: () => handleNavClick('home')
        },
          React.createElement(PillcareLogo, { className: 'h-10 w-10' })
        ),

        // Desktop Nav Links
        React.createElement('nav', { className: 'hidden md:flex items-center gap-8' },
          navLinks.map(link => {
            const isActive = currentRoute === link.id;
            return React.createElement('button', {
              key: link.id,
              onClick: () => handleNavClick(link.id),
              className: `font-medium text-sm transition-all duration-150 relative py-2 ${
                isActive
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`
            },
              link.label,
              isActive && React.createElement('span', {
                className: 'absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full'
              })
            );
          })
        ),

        // Action Buttons: Cart / Order Enquiry & Mobile Hamburger
        React.createElement('div', { className: 'flex items-center gap-3' },
          // Order Enquiry Basket Trigger
          React.createElement(Button, {
            variant: 'primary',
            size: 'md',
            onClick: onOpenCart,
            className: 'relative group shadow-emerald-700/10'
          },
            React.createElement(Icon, { name: 'bag', className: 'w-4 h-4' }),
            React.createElement('span', { className: 'hidden sm:inline' }, 'Order Enquiry'),
            cartItemCount > 0 && React.createElement('span', {
              className: 'ml-1.5 px-2 py-0.5 text-xs font-bold bg-white text-emerald-800 rounded-full shadow-xs'
            }, cartItemCount)
          ),

          // Mobile Hamburger Button
          React.createElement('button', {
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            className: 'md:hidden p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors',
            'aria-label': 'Toggle navigation menu'
          },
            React.createElement(Icon, { name: mobileMenuOpen ? 'close' : 'menu', className: 'w-6 h-6' })
          )
        )
      )
    ),

    // Mobile Navigation Drawer
    mobileMenuOpen && React.createElement('div', {
      className: 'md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg modal-animate'
    },
      navLinks.map(link => {
        const isActive = currentRoute === link.id;
        return React.createElement('button', {
          key: link.id,
          onClick: () => handleNavClick(link.id),
          className: `w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center justify-between ${
            isActive
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-700 hover:bg-slate-50'
          }`
        },
          link.label,
          React.createElement(Icon, { name: 'arrowRight', className: 'w-4 h-4 opacity-50' })
        );
      }),
      React.createElement('div', { className: 'pt-3 border-t border-slate-100 flex flex-col gap-2' },
        React.createElement('button', {
          onClick: () => {
            onOpenAdmin();
            setMobileMenuOpen(false);
          },
          className: 'w-full text-left px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-2'
        },
          React.createElement(Icon, { name: 'lock', className: 'w-4 h-4 text-emerald-600' }),
          'Staff Portal / Admin Login'
        )
      )
    )
  );
}
