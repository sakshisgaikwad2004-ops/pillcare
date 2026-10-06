// UI.js - Reusable UI elements for Pillcare Medical
import React from 'https://esm.sh/react@18.3.1';

// Consistent Pillcare Medical Brand Logo (Medical Cross + Pill)
export function PillcareLogo({ className = 'h-9 w-9', textClassName = 'text-xl', showTagline = true }) {
  return React.createElement('div', { className: 'flex items-center gap-3 select-none' },
    React.createElement('div', { className: 'relative flex-shrink-0' },
      React.createElement('svg', {
        className: className,
        viewBox: '0 0 48 48',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg'
      },
        // Soft rounded background
        React.createElement('rect', { width: '48', height: '48', rx: '12', fill: '#ECFDF5' }),
        React.createElement('rect', { x: '1', y: '1', width: '46', height: '46', rx: '11', stroke: '#A7F3D0', strokeWidth: '1.5' }),
        // Medical cross vertical bar
        React.createElement('rect', { x: '21', y: '10', width: '6', height: '28', rx: '3', fill: '#059669' }),
        // Medical cross horizontal bar
        React.createElement('rect', { x: '10', y: '21', width: '28', height: '6', rx: '3', fill: '#059669' }),
        // Pill capsule tilted overlay in accent blue
        React.createElement('g', { transform: 'rotate(32 24 24)' },
          React.createElement('rect', { x: '19', y: '13', width: '10', height: '22', rx: '5', fill: '#0284c7', fillOpacity: '0.9', stroke: '#FFFFFF', strokeWidth: '1.5' }),
          React.createElement('line', { x1: '19', y1: '24', x2: '29', y2: '24', stroke: '#FFFFFF', strokeWidth: '1.5' })
        )
      )
    ),
    React.createElement('div', { className: 'flex flex-col leading-tight' },
      React.createElement('div', { className: `font-heading font-extrabold tracking-tight text-slate-900 ${textClassName}` },
        React.createElement('span', { className: 'text-emerald-700' }, 'PILLCARE'),
        React.createElement('span', { className: 'text-sky-600 ml-1.5' }, 'MEDICAL')
      ),
      showTagline && React.createElement('span', { className: 'text-[10px] uppercase font-bold tracking-widest text-emerald-800/80 -mt-0.5' },
        'Pharmacy & Healthcare Store'
      )
    )
  );
}

// Inline SVG Icon Helper for maximum speed & independence
export function Icon({ name, className = 'w-5 h-5', ...props }) {
  const icons = {
    search: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }),
    mapPin: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' }),
    phone: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }),
    mail: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }),
    clock: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }),
    shield: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }),
    check: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M5 13l4 4L19 7' }),
    alert: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }),
    bag: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' }),
    plus: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 4v16m8-8H4' }),
    minus: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M20 12H4' }),
    trash: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }),
    close: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M6 18L18 6M6 6l12 12' }),
    arrowRight: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M14 5l7 7m0 0l-7 7m7-7H3' }),
    externalLink: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' }),
    menu: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M4 6h16M4 12h16M4 18h16' }),
    user: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }),
    lock: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }),
    upload: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' }),
    whatsapp: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }),
    fileText: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }),
    filter: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' }),
    refresh: React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })
  };

  return React.createElement('svg', {
    className: className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    ...props
  }, icons[name] || null);
}

// Standard Button Component
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 shadow-sm'
  };

  const variantStyles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-sm shadow-emerald-700/20',
    secondary: 'bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 focus:ring-sky-500 shadow-sm shadow-sky-700/20',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 focus:ring-emerald-500',
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500',
    whatsapp: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus:ring-emerald-400 shadow-sm'
  };

  return React.createElement('button', {
    className: `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`,
    disabled: disabled || loading,
    onClick,
    ...props
  },
    loading && React.createElement(Icon, { name: 'refresh', className: 'w-4 h-4 animate-spin' }),
    !loading && icon && React.createElement(Icon, { name: icon, className: size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4' }),
    children
  );
}

// Badge Component
export function Badge({ children, variant = 'neutral', size = 'sm' }) {
  const styles = {
    rx: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-bold',
    otc: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium',
    inStock: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    lowStock: 'bg-amber-100 text-amber-800 border border-amber-200',
    outOfStock: 'bg-rose-100 text-rose-800 border border-rose-200',
    pending: 'bg-amber-100 text-amber-800',
    underReview: 'bg-sky-100 text-sky-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    completed: 'bg-slate-200 text-slate-800',
    neutral: 'bg-slate-100 text-slate-700'
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[11px] rounded',
    sm: 'px-2.5 py-1 text-xs rounded-full',
    md: 'px-3 py-1.5 text-sm rounded-full'
  };

  return React.createElement('span', {
    className: `inline-flex items-center gap-1 font-medium select-none ${sizeStyles[size]} ${styles[variant] || styles.neutral}`
  }, children);
}

// Alert Message Banner
export function Alert({ type = 'info', title, message, onClose, className = '' }) {
  const configs = {
    success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: 'check', iconColor: 'text-emerald-600' },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-900', icon: 'alert', iconColor: 'text-amber-600' },
    error: { bg: 'bg-rose-50 border-rose-200 text-rose-900', icon: 'alert', iconColor: 'text-rose-600' },
    info: { bg: 'bg-sky-50 border-sky-200 text-sky-900', icon: 'shield', iconColor: 'text-sky-600' }
  };

  const config = configs[type] || configs.info;

  return React.createElement('div', {
    className: `flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${className}`,
    role: 'alert'
  },
    React.createElement(Icon, { name: config.icon, className: `w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}` }),
    React.createElement('div', { className: 'flex-1 text-sm' },
      title && React.createElement('div', { className: 'font-semibold mb-0.5' }, title),
      React.createElement('div', { className: 'leading-relaxed' }, message)
    ),
    onClose && React.createElement('button', {
      onClick: onClose,
      className: 'text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none',
      'aria-label': 'Close'
    }, React.createElement(Icon, { name: 'close', className: 'w-4 h-4' }))
  );
}

// Modal Component
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4'
  },
    React.createElement('div', {
      className: 'fixed inset-0',
      onClick: onClose,
      'aria-hidden': 'true'
    }),
    React.createElement('div', {
      className: `relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full ${maxWidth} overflow-hidden modal-animate z-10 my-8`
    },
      React.createElement('div', {
        className: 'flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70'
      },
        React.createElement('h3', { className: 'font-heading font-bold text-lg text-slate-900' }, title),
        React.createElement('button', {
          onClick: onClose,
          className: 'text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors',
          'aria-label': 'Close modal'
        }, React.createElement(Icon, { name: 'close', className: 'w-5 h-5' }))
      ),
      React.createElement('div', { className: 'p-6 max-h-[80vh] overflow-y-auto' }, children)
    )
  );
}
