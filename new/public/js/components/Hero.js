// Hero.js - Hero section for Pillcare Medical
import React from 'https://esm.sh/react@18.3.1';
import { Button, Icon } from './UI.js';

export function Hero({ onNavigate, onOpenCart }) {
  return React.createElement('section', { className: 'relative overflow-hidden hero-pattern pt-12 pb-20 border-b border-emerald-100/60' },
    // Soft ambient backdrop glow
    React.createElement('div', {
      className: 'absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none'
    }),
    React.createElement('div', {
      className: 'absolute bottom-0 left-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none'
    }),

    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-12 items-center' },
        // Left Column: Copy & Actions
        React.createElement('div', { className: 'lg:col-span-7 space-y-6 text-center lg:text-left' },
          // Pill Badge
          React.createElement('div', { className: 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold uppercase tracking-wider' },
            React.createElement('span', { className: 'w-2 h-2 rounded-full bg-emerald-600 badge-live' }),
            'Pillcare Medical Pharmacy & Healthcare'
          ),

          // Main Headline
          React.createElement('h1', { className: 'font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]' },
            'Your Trusted Partner in ',
            React.createElement('span', { className: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600' }, 'Healthcare')
          ),

          // Supporting Description
          React.createElement('p', { className: 'text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0' },
            'Explore available healthcare products and connect with Pillcare Medical for medicine enquiries and pharmacy support.'
          ),

          // CTAs: View Medicines, Order Enquiry, Contact Us
          React.createElement('div', { className: 'flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2' },
            React.createElement(Button, {
              variant: 'primary',
              size: 'lg',
              onClick: () => onNavigate('medicines'),
              icon: 'search',
              className: 'shadow-md shadow-emerald-700/20'
            }, 'View Medicines'),
            React.createElement(Button, {
              variant: 'secondary',
              size: 'lg',
              onClick: onOpenCart,
              icon: 'bag',
              className: 'shadow-md shadow-sky-700/20'
            }, 'Order Enquiry'),
            React.createElement(Button, {
              variant: 'outline',
              size: 'lg',
              onClick: () => onNavigate('contact'),
              icon: 'phone'
            }, 'Contact Us')
          ),

          // Pharmacist verification note
          React.createElement('div', { className: 'pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500' },
            React.createElement(Icon, { name: 'shield', className: 'w-4 h-4 text-emerald-600 flex-shrink-0' }),
            React.createElement('span', null, 'All prescription medicines verified by licensed pharmacists before dispensing.')
          )
        ),

        // Right Column: Professional Healthcare Graphic Card
        React.createElement('div', { className: 'lg:col-span-5' },
          React.createElement('div', { className: 'relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-emerald-100' },
            React.createElement('div', { className: 'flex items-center justify-between pb-4 border-b border-slate-100' },
              React.createElement('div', { className: 'flex items-center gap-3' },
                React.createElement('div', { className: 'w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold' },
                  React.createElement(Icon, { name: 'shield', className: 'w-7 h-7' })
                ),
                React.createElement('div', null,
                  React.createElement('h3', { className: 'font-heading font-bold text-slate-900 text-base' }, 'Pillcare Quality Assurance'),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, 'Registered Retail Store')
                )
              ),
              React.createElement('span', { className: 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800' },
                'Open Today'
              )
            ),

            // Feature points
            React.createElement('div', { className: 'space-y-4 py-5' },
              [
                { title: 'Medicine Availability Checks', desc: 'Real-time catalogue search for tablets, syrups & OTC items', icon: 'check' },
                { title: 'Prescription Verification', desc: 'Secure upload reviewed by our qualified pharmacist', icon: 'fileText' },
                { title: 'Direct Pharmacy Support', desc: 'Instant WhatsApp assistance and counter pickup support', icon: 'whatsapp' },
                { title: 'Convenient Store Location', desc: 'Easily accessible with complete Google Maps navigation', icon: 'mapPin' }
              ].map((item, idx) => (
                React.createElement('div', { key: idx, className: 'flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100' },
                  React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5' },
                    React.createElement(Icon, { name: item.icon, className: 'w-4 h-4' })
                  ),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-sm font-semibold text-slate-900' }, item.title),
                    React.createElement('div', { className: 'text-xs text-slate-500 leading-snug mt-0.5' }, item.desc)
                  )
                )
              ))
            ),

            // Store helpline quick link
            React.createElement('div', { className: 'pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100' },
              React.createElement('span', null, 'Need instant guidance?'),
              React.createElement('button', {
                onClick: () => onNavigate('contact'),
                className: 'font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1'
              },
                'Reach Pharmacy Team',
                React.createElement(Icon, { name: 'arrowRight', className: 'w-3 h-3' })
              )
            )
          )
        )
      )
    )
  );
}
