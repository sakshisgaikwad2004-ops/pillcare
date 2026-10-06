// ProductModal.js - Detailed medicine specification modal
import React, { useState } from 'https://esm.sh/react@18.3.1';
import { Modal, Badge, Button, Icon } from './UI.js';

export function ProductModal({ product, isOpen, onClose, onAddToEnquiry }) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const isRx = Boolean(product.prescriptionRequired);
  const isOutOfStock = product.stockStatus === 'Out of Stock';

  const handleAdd = () => {
    onAddToEnquiry(product, quantity);
    onClose();
  };

  return React.createElement(Modal, {
    isOpen,
    onClose,
    title: product.name,
    maxWidth: 'max-w-2xl'
  },
    React.createElement('div', { className: 'space-y-6' },
      // Top section: Image & Core Info
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-12 gap-6 items-start' },
        // Thumbnail
        React.createElement('div', { className: 'sm:col-span-5 w-full h-52 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center' },
          product.imageUrl
            ? React.createElement('img', {
                src: product.imageUrl,
                alt: product.name,
                className: 'w-full h-full object-cover'
              })
            : React.createElement(Icon, { name: 'shield', className: 'w-16 h-16 text-slate-300' })
        ),

        // Core details
        React.createElement('div', { className: 'sm:col-span-7 space-y-3' },
          React.createElement('div', { className: 'flex flex-wrap items-center gap-2' },
            isRx
              ? React.createElement(Badge, { variant: 'rx', size: 'sm' },
                  React.createElement(Icon, { name: 'fileText', className: 'w-3.5 h-3.5 inline mr-1' }),
                  'Prescription Required (Rx)'
                )
              : React.createElement(Badge, { variant: 'otc', size: 'sm' }, 'OTC / General Healthcare'),
            React.createElement(Badge, {
              variant: product.stockStatus === 'In Stock' ? 'inStock' : 'lowStock',
              size: 'sm'
            }, product.stockStatus || 'In Stock')
          ),

          React.createElement('div', null,
            React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider' }, 'Manufacturer / Brand'),
            React.createElement('div', { className: 'font-semibold text-slate-900 text-sm' }, product.brand)
          ),

          React.createElement('div', null,
            React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider' }, 'Category'),
            React.createElement('div', { className: 'text-slate-800 text-sm font-medium' }, product.category)
          ),

          React.createElement('div', { className: 'pt-2' },
            React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider' }, 'Statutory MRP'),
            React.createElement('div', { className: 'font-heading font-extrabold text-2xl text-emerald-800' },
              `₹${product.price.toFixed(2)}`,
              React.createElement('span', { className: 'text-xs text-slate-500 font-normal ml-2' },
                product.packSize ? `per ${product.packSize}` : 'inclusive of all taxes'
              )
            )
          )
        )
      ),

      // Specifications Grid
      React.createElement('div', { className: 'p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-sm' },
        product.composition && React.createElement('div', null,
          React.createElement('strong', { className: 'text-slate-900 font-semibold block text-xs uppercase tracking-wider mb-1' }, 'Active Composition / Ingredients:'),
          React.createElement('span', { className: 'text-slate-700 font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200 inline-block' }, product.composition)
        ),
        product.strength && React.createElement('div', null,
          React.createElement('strong', { className: 'text-slate-900 font-semibold block text-xs uppercase tracking-wider mb-1' }, 'Strength / Dosage Specification:'),
          React.createElement('span', { className: 'text-slate-700' }, product.strength)
        ),
        product.description && React.createElement('div', null,
          React.createElement('strong', { className: 'text-slate-900 font-semibold block text-xs uppercase tracking-wider mb-1' }, 'Product Description:'),
          React.createElement('p', { className: 'text-slate-600 leading-relaxed text-xs' }, product.description)
        ),
        product.dosageInstructions && React.createElement('div', null,
          React.createElement('strong', { className: 'text-slate-900 font-semibold block text-xs uppercase tracking-wider mb-1' }, 'Usage Guidance:'),
          React.createElement('p', { className: 'text-slate-600 leading-relaxed text-xs' }, product.dosageInstructions)
        )
      ),

      // Statutory Regulatory Warning Banner
      isRx && React.createElement('div', {
        className: 'p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed'
      },
        React.createElement(Icon, { name: 'alert', className: 'w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5' }),
        React.createElement('div', null,
          React.createElement('strong', { className: 'font-semibold' }, 'Prescription Verification Mandatory: '),
          'This medicine requires a valid prescription from a registered medical practitioner. You will be prompted to securely upload your prescription when submitting an order enquiry.'
        )
      ),

      // Quantity Selector & Add to Enquiry Action
      React.createElement('div', { className: 'pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('span', { className: 'text-xs font-semibold text-slate-600 uppercase tracking-wider' }, 'Quantity:'),
          React.createElement('div', { className: 'flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white' },
            React.createElement('button', {
              onClick: () => setQuantity(Math.max(1, quantity - 1)),
              className: 'p-2 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none',
              'aria-label': 'Decrease quantity'
            }, React.createElement(Icon, { name: 'minus', className: 'w-4 h-4' })),
            React.createElement('span', { className: 'px-4 py-1 text-sm font-semibold text-slate-900 min-w-[2.5rem] text-center' }, quantity),
            React.createElement('button', {
              onClick: () => setQuantity(quantity + 1),
              className: 'p-2 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none',
              'aria-label': 'Increase quantity'
            }, React.createElement(Icon, { name: 'plus', className: 'w-4 h-4' }))
          )
        ),

        React.createElement('div', { className: 'flex items-center gap-3 w-full sm:w-auto' },
          React.createElement(Button, {
            variant: 'outline',
            onClick: onClose,
            className: 'w-1/2 sm:w-auto'
          }, 'Close'),
          React.createElement(Button, {
            variant: 'primary',
            disabled: isOutOfStock,
            onClick: handleAdd,
            icon: 'bag',
            className: 'w-1/2 sm:w-auto'
          }, isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Enquiry`)
        )
      )
    )
  );
}
