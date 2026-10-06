// ProductCard.js - Medicine card component for Pillcare Medical catalogue
import React from 'https://esm.sh/react@18.3.1';
import { Badge, Button, Icon } from './UI.js';

export function ProductCard({ product, onSelectDetails, onAddToEnquiry }) {
  const isRx = Boolean(product.prescriptionRequired);
  const isOutOfStock = product.stockStatus === 'Out of Stock';

  const stockBadgeVariant =
    product.stockStatus === 'In Stock'
      ? 'inStock'
      : product.stockStatus === 'Low Stock'
      ? 'lowStock'
      : 'outOfStock';

  return React.createElement('div', {
    className: 'med-card bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden group'
  },
    // Top Row: Badges
    React.createElement('div', null,
      React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-3' },
        isRx
          ? React.createElement(Badge, { variant: 'rx', size: 'xs' },
              React.createElement(Icon, { name: 'fileText', className: 'w-3 h-3 inline mr-0.5' }),
              'Rx Required'
            )
          : React.createElement(Badge, { variant: 'otc', size: 'xs' },
              React.createElement(Icon, { name: 'check', className: 'w-3 h-3 inline mr-0.5' }),
              'OTC Approved'
            ),
        React.createElement(Badge, { variant: stockBadgeVariant, size: 'xs' }, product.stockStatus || 'In Stock')
      ),

      // Medicine Image Thumbnail
      React.createElement('div', {
        className: 'relative w-full h-40 bg-slate-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-slate-100 group-hover:border-emerald-200 transition-colors cursor-pointer',
        onClick: () => onSelectDetails(product)
      },
        product.imageUrl
          ? React.createElement('img', {
              src: product.imageUrl,
              alt: product.name,
              className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
              loading: 'lazy'
            })
          : React.createElement('div', { className: 'text-slate-300' },
              React.createElement(Icon, { name: 'shield', className: 'w-12 h-12' })
            ),
        // Hover View Details overlay
        React.createElement('div', {
          className: 'absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'
        },
          React.createElement('span', { className: 'px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-xs' },
            'View Specifications'
          )
        )
      ),

      // Category Tag
      React.createElement('div', { className: 'text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1' },
        product.category
      ),

      // Product Title
      React.createElement('h3', {
        className: 'font-heading font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors',
        onClick: () => onSelectDetails(product)
      }, product.name),

      // Brand / Manufacturer
      React.createElement('div', { className: 'text-xs text-slate-500 mt-1' },
        'By ',
        React.createElement('span', { className: 'font-medium text-slate-700' }, product.brand)
      ),

      // Composition (when verified)
      product.composition && React.createElement('div', {
        className: 'mt-2.5 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-100 line-clamp-2'
      },
        React.createElement('span', { className: 'font-semibold text-slate-700' }, 'Composition: '),
        product.composition
      ),

      // Strength & Pack Size
      React.createElement('div', { className: 'flex items-center gap-3 mt-2.5 text-xs text-slate-500' },
        product.strength && React.createElement('span', { className: 'bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-medium' },
          product.strength
        ),
        product.packSize && React.createElement('span', { className: 'truncate text-slate-400' },
          product.packSize
        )
      )
    ),

    // Bottom Row: Price & Actions
    React.createElement('div', { className: 'pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2' },
      React.createElement('div', null,
        React.createElement('div', { className: 'text-[10px] text-slate-400 uppercase tracking-wider font-semibold' }, 'Statutory MRP'),
        React.createElement('div', { className: 'font-heading font-extrabold text-slate-900 text-lg' },
          `₹${product.price.toFixed(2)}`
        )
      ),

      React.createElement('div', { className: 'flex items-center gap-1.5' },
        React.createElement(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: () => onSelectDetails(product),
          title: 'View Details'
        }, 'Details'),
        React.createElement(Button, {
          variant: 'primary',
          size: 'sm',
          disabled: isOutOfStock,
          onClick: () => onAddToEnquiry(product),
          icon: 'plus',
          title: isOutOfStock ? 'Currently Out of Stock' : 'Add to Medicine Enquiry'
        }, 'Enquire')
      )
    )
  );
}
