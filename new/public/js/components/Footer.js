// Footer.js - Healthcare footer for Pillcare Medical
import React from 'https://esm.sh/react@18.3.1';
import { PillcareLogo, Icon } from './UI.js';

export function Footer({ storeConfig, onNavigate, onOpenAdmin }) {
  const cfg = storeConfig || {};
  const phone = cfg.contactNumber || '+91 98765 43210';
  const email = cfg.email || 'care@pillcaremedical.com';
  const hoursWeekdays = cfg.businessHours?.weekdays || 'Monday - Saturday: 8:00 AM - 10:00 PM';
  const hoursSunday = cfg.businessHours?.sunday || 'Sunday: 9:00 AM - 2:00 PM';
  const addressLine = `${cfg.address?.line1 || 'Shop No. 12, Healthcare Commercial Complex'}, ${cfg.address?.city || 'Mumbai'}, ${cfg.address?.state || 'Maharashtra'} - ${cfg.address?.pincode || '400001'}`;

  return React.createElement('footer', { className: 'bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800' },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800' },
        // Col 1: Brand & Pharmacy Notice
        React.createElement('div', { className: 'space-y-4' },
          React.createElement(PillcareLogo, { className: 'h-9 w-9', textClassName: 'text-white text-xl', showTagline: false }),
          React.createElement('p', { className: 'text-sm text-slate-400 leading-relaxed' },
            'Pillcare Medical provides retail healthcare products, medicine availability checks, and prescription enquiry support backed by registered pharmacy professionals.'
          ),
          React.createElement('div', { className: 'pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium' },
            React.createElement(Icon, { name: 'shield', className: 'w-4 h-4 flex-shrink-0' }),
            React.createElement('span', null, 'Licensed Retail Chemist & Druggist')
          )
        ),

        // Col 2: Quick Links
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('h4', { className: 'font-heading font-bold text-white text-base tracking-wide uppercase text-sm' }, 'Quick Navigation'),
          React.createElement('ul', { className: 'space-y-2.5 text-sm' },
            [
              { label: 'Home', id: 'home' },
              { label: 'Medicines & Services', id: 'medicines' },
              { label: 'Contact Us & Store Location', id: 'contact' },
              { label: 'Pharmacist Verification Flow', id: 'medicines' }
            ].map((link, idx) => (
              React.createElement('li', { key: idx },
                React.createElement('button', {
                  onClick: () => onNavigate(link.id),
                  className: 'hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5'
                },
                  React.createElement(Icon, { name: 'arrowRight', className: 'w-3 h-3 text-slate-500' }),
                  link.label
                )
              )
            ))
          )
        ),

        // Col 3: Business Hours & Medical Emergency Notice
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('h4', { className: 'font-heading font-bold text-white text-base tracking-wide uppercase text-sm' }, 'Store Timings'),
          React.createElement('div', { className: 'space-y-2 text-sm text-slate-400' },
            React.createElement('div', { className: 'flex items-start gap-2' },
              React.createElement(Icon, { name: 'clock', className: 'w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5' }),
              React.createElement('div', null,
                React.createElement('div', { className: 'text-white font-medium' }, 'Weekdays'),
                React.createElement('div', null, hoursWeekdays)
              )
            ),
            React.createElement('div', { className: 'flex items-start gap-2 pt-1' },
              React.createElement(Icon, { name: 'clock', className: 'w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5' }),
              React.createElement('div', null,
                React.createElement('div', { className: 'text-white font-medium' }, 'Sundays'),
                React.createElement('div', null, hoursSunday)
              )
            ),
            React.createElement('div', { className: 'p-3 mt-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-amber-300/90 leading-relaxed' },
              'Notice: For severe health emergencies, please call emergency services or visit the nearest hospital casualty immediately.'
            )
          )
        ),

        // Col 4: Store Contact & Location
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('h4', { className: 'font-heading font-bold text-white text-base tracking-wide uppercase text-sm' }, 'Store Location'),
          React.createElement('div', { className: 'space-y-3 text-sm text-slate-400' },
            React.createElement('div', { className: 'flex items-start gap-2.5' },
              React.createElement(Icon, { name: 'mapPin', className: 'w-4 h-4 text-emerald-400 flex-shrink-0 mt-1' }),
              React.createElement('span', null, addressLine)
            ),
            React.createElement('div', { className: 'flex items-center gap-2.5' },
              React.createElement(Icon, { name: 'phone', className: 'w-4 h-4 text-emerald-400 flex-shrink-0' }),
              React.createElement('span', { className: 'text-white font-medium' }, phone)
            ),
            React.createElement('div', { className: 'flex items-center gap-2.5' },
              React.createElement(Icon, { name: 'mail', className: 'w-4 h-4 text-emerald-400 flex-shrink-0' }),
              React.createElement('span', null, email)
            ),
            React.createElement('div', { className: 'pt-2' },
              React.createElement('button', {
                onClick: () => onNavigate('contact'),
                className: 'inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium'
              },
                'View Interactive Google Map',
                React.createElement(Icon, { name: 'externalLink', className: 'w-3 h-3' })
              )
            )
          )
        )
      ),

      // Statutory Healthcare Disclaimer & Copyright
      React.createElement('div', { className: 'pt-8 mt-2 space-y-4 text-xs text-slate-500' },
        React.createElement('div', { className: 'p-4 rounded-xl bg-slate-800/50 border border-slate-800 text-slate-400 leading-relaxed space-y-2' },
          React.createElement('p', null,
            React.createElement('strong', { className: 'text-slate-300' }, 'Regulatory & Medical Disclaimer: '),
            'Pillcare Medical website is an informational, product catalogue, and medicine enquiry platform. The contents presented do not constitute medical diagnosis, doctor treatment recommendations, or therapeutic advice. All prescription products (Schedule H/H1) strictly require verification of an original physical prescription by a registered pharmacist before fulfillment.'
          ),
          React.createElement('p', null,
            'Online enquiry submissions do not form a binding contract of immediate automated sale. Fulfillments comply with applicable national and local pharmacy statutory rules.'
          )
        ),
        React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-between gap-4 pt-2' },
          React.createElement('p', null,
            `© ${new Date().getFullYear()} Pillcare Medical Store. All rights reserved.`
          ),
          React.createElement('div', { className: 'flex items-center gap-6' },
            React.createElement('button', { onClick: onOpenAdmin, className: 'hover:text-slate-400 flex items-center gap-1 text-slate-500' },
              React.createElement(Icon, { name: 'lock', className: 'w-3 h-3' }),
              'Admin Login'
            ),
            React.createElement('span', { className: 'text-slate-700' }, '|'),
            React.createElement('span', { className: 'text-slate-500' }, 'Confidential Patient Record Handling')
          )
        )
      )
    )
  );
}
