// app.js - Main Application for Pillcare Medical
import React, { useState, useEffect } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';

import { PillcareLogo, Icon, Button, Badge, Alert } from './components/UI.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { Hero } from './components/Hero.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductModal } from './components/ProductModal.js';
import { EnquiryDrawer } from './components/EnquiryDrawer.js';
import { ContactForm } from './components/ContactForm.js';
import { AdminPanel } from './components/AdminPanel.js';

function App() {
  // Routing: 'home' | 'medicines' | 'contact'
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'medicines', 'contact'].includes(hash)) return hash;
    return 'home';
  });

  // Admin Modal visibility
  const [adminOpen, setAdminOpen] = useState(() => window.location.hash === '#admin');

  // Store Configuration
  const [storeConfig, setStoreConfig] = useState(null);

  // Cart / Medicine Enquiry Basket
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pcm_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Medicines Catalogue State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [rxFilter, setRxFilter] = useState('All'); // 'All' | 'Rx' | 'OTC'

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync route and hash
  const navigateTo = (route) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        setAdminOpen(true);
      } else if (['home', 'medicines', 'contact'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('pcm_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch Store Config
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setStoreConfig(data);
    } catch (err) {
      console.error('Failed to load store config', err);
    }
  };

  // Fetch Catalogue Products
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();

      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (rxFilter === 'Rx') params.append('prescriptionRequired', '1');
      if (rxFilter === 'OTC') params.append('prescriptionRequired', '0');

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load medicines', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, rxFilter]);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name}" to medicine enquiry basket.`);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Categories list
  const categories = [
    'All',
    'Tablets & Capsules',
    'Syrups & Liquids',
    'Healthcare Products',
    'Vitamins & Supplements',
    'Other approved products'
  ];

  return React.createElement('div', { className: 'min-h-screen flex flex-col bg-slate-50/70 text-slate-800' },
    // Toast Notification Banner
    toast && React.createElement('div', { className: 'fixed bottom-5 right-5 z-50 max-w-sm toast-animate' },
      React.createElement(Alert, {
        type: toast.type,
        message: toast.message,
        onClose: () => setToast(null)
      })
    ),

    // Header Navigation
    React.createElement(Header, {
      currentRoute,
      onNavigate: navigateTo,
      cartItemCount: totalCartCount,
      onOpenCart: () => setCartOpen(true),
      onOpenAdmin: () => setAdminOpen(true),
      storeConfig
    }),

    // MAIN CONTENT ROUTER
    React.createElement('main', { className: 'flex-1' },

      // ==========================================
      // PAGE 1: HOME
      // ==========================================
      currentRoute === 'home' && React.createElement('div', { className: 'space-y-16 pb-16' },
        // Hero Section
        React.createElement(Hero, {
          onNavigate: navigateTo,
          onOpenCart: () => setCartOpen(true)
        }),

        // Section: About Pillcare Medical
        React.createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
          React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-10 items-center' },
            React.createElement('div', { className: 'lg:col-span-6 space-y-5' },
              React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider' },
                React.createElement(Icon, { name: 'shield', className: 'w-3.5 h-3.5' }),
                'About Our Pharmacy'
              ),
              React.createElement('h2', { className: 'font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight' },
                'Dedicated to Safe, Ethical & Accessible Pharmacy Services'
              ),
              React.createElement('p', { className: 'text-slate-600 leading-relaxed text-sm sm:text-base' },
                'Pillcare Medical operates as a community-first retail chemist and medical store. We bridge the gap between patient needs and pharmaceutical availability through transparent catalogue tracking, verified stock checks, and direct pharmacist supervision.'
              ),
              React.createElement('p', { className: 'text-slate-600 leading-relaxed text-sm sm:text-base' },
                'Whether you require daily maintenance tablets, pediatric syrups, surgical wound care, or health monitoring devices, our team adheres to stringent healthcare storage practices and ethical dispensing protocols.'
              ),
              React.createElement('div', { className: 'grid grid-cols-2 gap-4 pt-2' },
                React.createElement('div', { className: 'p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs' },
                  React.createElement('div', { className: 'font-heading font-extrabold text-2xl text-emerald-700' }, '100%'),
                  React.createElement('div', { className: 'text-xs text-slate-500 font-medium mt-1' }, 'Verified Licensed Sourcing')
                ),
                React.createElement('div', { className: 'p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs' },
                  React.createElement('div', { className: 'font-heading font-extrabold text-2xl text-sky-700' }, 'Pharmacist'),
                  React.createElement('div', { className: 'text-xs text-slate-500 font-medium mt-1' }, 'Supervised Dispensing')
                )
              )
            ),
            React.createElement('div', { className: 'lg:col-span-6' },
              React.createElement('div', { className: 'bg-gradient-to-br from-emerald-50 via-white to-sky-50 rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden' },
                React.createElement('div', { className: 'space-y-4' },
                  React.createElement('h3', { className: 'font-heading font-bold text-slate-900 text-lg' }, 'Pharmacy Counter Commitments'),
                  [
                    { title: 'Prescription Verification', desc: 'Every prescription medication is reviewed against doctor instructions before dispensing.' },
                    { title: 'Temperature & Storage Control', desc: 'Medicines and syrups maintained under appropriate clinical conditions.' },
                    { title: 'Patient Data Confidentiality', desc: 'Uploaded medical documents and contact records are handled with strict privacy.' },
                    { title: 'No Unverified Medical Claims', desc: 'We supply certified pharmaceutical items and guide you to registered doctors for medical diagnoses.' }
                  ].map((com, idx) => (
                    React.createElement('div', { key: idx, className: 'flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-slate-100' },
                      React.createElement(Icon, { name: 'check', className: 'w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5' }),
                      React.createElement('div', null,
                        React.createElement('div', { className: 'text-xs font-bold text-slate-900' }, com.title),
                        React.createElement('div', { className: 'text-xs text-slate-500 leading-normal mt-0.5' }, com.desc)
                      )
                    )
                  ))
                )
              )
            )
          )
        ),

        // Section: Pharmacy Services
        React.createElement('section', { className: 'bg-white py-16 border-y border-slate-200/70' },
          React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12' },
            React.createElement('div', { className: 'text-center max-w-3xl mx-auto space-y-3' },
              React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold uppercase tracking-wider' },
                React.createElement(Icon, { name: 'bag', className: 'w-3.5 h-3.5' }),
                'What We Provide'
              ),
              React.createElement('h2', { className: 'font-heading text-3xl sm:text-4xl font-extrabold text-slate-900' },
                'Comprehensive Pharmacy Support & Services'
              ),
              React.createElement('p', { className: 'text-slate-600 text-sm sm:text-base' },
                'Explore our core retail and customer support offerings designed to make healthcare access simple and reliable.'
              )
            ),

            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6' },
              [
                { title: 'Medicine Availability', desc: 'Instant search across our complete inventory of tablets, liquids & formulations.', icon: 'search', color: 'emerald' },
                { title: 'Medicine Enquiry', desc: 'Submit stock checks and reserve requirements for swift retail counter pickup.', icon: 'fileText', color: 'sky' },
                { title: 'Pharmacy Support', desc: 'Registered pharmacist guidance regarding pack sizes, dosage formats, and salt compositions.', icon: 'shield', color: 'emerald' },
                { title: 'Healthcare Products', desc: 'Certified blood pressure monitors, digital thermometers, oximeters, and first-aid kits.', icon: 'bag', color: 'sky' },
                { title: 'Customer Assistance', desc: 'WhatsApp support, telephone helpline, and personalized counter assistance for senior citizens.', icon: 'phone', color: 'emerald' }
              ].map((svc, idx) => (
                React.createElement('div', {
                  key: idx,
                  className: 'p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 flex flex-col justify-between space-y-4'
                },
                  React.createElement('div', { className: 'w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shadow-xs' },
                    React.createElement(Icon, { name: svc.icon, className: 'w-5 h-5' })
                  ),
                  React.createElement('div', { className: 'space-y-1.5' },
                    React.createElement('h4', { className: 'font-heading font-bold text-slate-900 text-base' }, svc.title),
                    React.createElement('p', { className: 'text-xs text-slate-500 leading-relaxed' }, svc.desc)
                  )
                )
              ))
            )
          )
        ),

        // Section: Featured Medicine Categories
        React.createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8' },
          React.createElement('div', { className: 'flex flex-col sm:flex-row sm:items-end justify-between gap-4' },
            React.createElement('div', { className: 'space-y-2' },
              React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider' },
                React.createElement(Icon, { name: 'bag', className: 'w-3.5 h-3.5' }),
                'Product Categories'
              ),
              React.createElement('h2', { className: 'font-heading text-3xl font-extrabold text-slate-900' },
                'Explore Medicine Categories'
              )
            ),
            React.createElement(Button, {
              variant: 'outline',
              size: 'sm',
              onClick: () => navigateTo('medicines'),
              icon: 'arrowRight'
            }, 'View Full Catalogue')
          ),

          React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4' },
            [
              { name: 'Tablets & Capsules', count: 'Pain relief, antibiotics, antacids & cardiac care', cat: 'Tablets & Capsules' },
              { name: 'Syrups & Liquids', count: 'Cough syrups, pediatric suspensions & tonics', cat: 'Syrups & Liquids' },
              { name: 'Healthcare Products', count: 'Digital thermometers, BP monitors & first aid', cat: 'Healthcare Products' },
              { name: 'Vitamins & Supplements', count: 'Vitamin C, Calcium D3, Zinc & minerals', cat: 'Vitamins & Supplements' },
              { name: 'Other Approved Products', count: 'Oral rehydration salts, creams & pain gels', cat: 'Other approved products' }
            ].map((cat, idx) => (
              React.createElement('div', {
                key: idx,
                onClick: () => {
                  setSelectedCategory(cat.cat);
                  navigateTo('medicines');
                },
                className: 'med-card p-5 bg-white rounded-2xl cursor-pointer hover:border-emerald-400 group space-y-2'
              },
                React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors' },
                  React.createElement(Icon, { name: 'shield', className: 'w-5 h-5' })
                ),
                React.createElement('h4', { className: 'font-heading font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors' }, cat.name),
                React.createElement('p', { className: 'text-[11px] text-slate-500 line-clamp-2 leading-relaxed' }, cat.count)
              )
            ))
          )
        ),

        // Section: Why Choose Pillcare Medical
        React.createElement('section', { className: 'bg-emerald-950 text-white py-16' },
          React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12' },
            React.createElement('div', { className: 'text-center max-w-3xl mx-auto space-y-3' },
              React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold uppercase tracking-wider' },
                React.createElement(Icon, { name: 'shield', className: 'w-3.5 h-3.5' }),
                'Trust & Assurance'
              ),
              React.createElement('h2', { className: 'font-heading text-3xl sm:text-4xl font-extrabold text-white' },
                'Why Choose Pillcare Medical?'
              ),
              React.createElement('p', { className: 'text-emerald-200/80 text-sm sm:text-base' },
                'We focus on transparent customer support, verified healthcare products, and dependable local retail service without misleading claims.'
              )
            ),

            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
              [
                { title: 'Convenient Access', desc: 'Centrally located physical medical store with clear Google Maps navigation and ample parking access.', icon: 'mapPin' },
                { title: 'Responsive Customer Support', desc: 'Direct WhatsApp and telephone access to our counter team for rapid availability answers.', icon: 'phone' },
                { title: '100% Verified Products', desc: 'Sourced strictly through authorized pharmaceutical distributors with genuine batch numbers and tamper seals.', icon: 'check' },
                { title: 'Easy Enquiry Process', desc: 'Quick 3-step online enquiry with prescription upload for smooth pre-verification before store pickup.', icon: 'fileText' }
              ].map((item, idx) => (
                React.createElement('div', { key: idx, className: 'p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/80 space-y-3' },
                  React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center' },
                    React.createElement(Icon, { name: item.icon, className: 'w-5 h-5' })
                  ),
                  React.createElement('h4', { className: 'font-heading font-bold text-white text-base' }, item.title),
                  React.createElement('p', { className: 'text-xs text-emerald-200/70 leading-relaxed' }, item.desc)
                )
              ))
            )
          )
        ),

        // Section: Location Preview & Google Maps CTA
        React.createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
          React.createElement('div', { className: 'bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center' },
            React.createElement('div', { className: 'lg:col-span-7 space-y-4' },
              React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider' },
                React.createElement(Icon, { name: 'mapPin', className: 'w-3.5 h-3.5' }),
                'Find Our Pharmacy'
              ),
              React.createElement('h3', { className: 'font-heading font-extrabold text-2xl sm:text-3xl text-slate-900' },
                'Visit Pillcare Medical in Person'
              ),
              React.createElement('p', { className: 'text-slate-600 text-sm leading-relaxed' },
                'Conveniently situated opposite the City Civil Hospital on Main Medical Road. Drop by to consult our licensed pharmacist, collect verified medicine orders, or browse healthcare equipment.'
              ),
              React.createElement('div', { className: 'text-xs text-slate-500 space-y-1' },
                React.createElement('div', null, '📍 Address: ', React.createElement('strong', { className: 'text-slate-700' }, storeConfig?.address?.line1 || 'Shop No. 12, Healthcare Commercial Complex')),
                React.createElement('div', null, '🕒 Schedule: ', React.createElement('strong', { className: 'text-slate-700' }, storeConfig?.businessHours?.weekdays || 'Mon - Sat: 8:00 AM - 10:00 PM'))
              ),
              React.createElement('div', { className: 'flex flex-wrap gap-3 pt-2' },
                React.createElement(Button, {
                  variant: 'primary',
                  size: 'md',
                  onClick: () => navigateTo('contact'),
                  icon: 'mapPin'
                }, 'View Map & Directions'),
                React.createElement(Button, {
                  variant: 'outline',
                  size: 'md',
                  onClick: () => {
                    const url = storeConfig?.googleMaps?.directionsUrl || 'https://maps.google.com/?q=Pillcare+Medical';
                    window.open(url, '_blank');
                  },
                  icon: 'externalLink'
                }, 'Open in Google Maps')
              )
            ),
            React.createElement('div', { className: 'lg:col-span-5 h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100' },
              React.createElement('iframe', {
                title: 'Pillcare Medical Location Preview',
                src: storeConfig?.googleMaps?.embedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.856!2d72.83!3d18.94!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU2JzI0LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin',
                className: 'w-full h-full border-0',
                loading: 'lazy'
              })
            )
          )
        ),

        // Section: Contact CTA Banner
        React.createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
          React.createElement('div', { className: 'bg-gradient-to-r from-emerald-700 to-sky-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/10' },
            React.createElement('div', { className: 'space-y-2 text-center md:text-left' },
              React.createElement('h3', { className: 'font-heading font-extrabold text-2xl sm:text-3xl' }, 'Need Immediate Medicine Assistance?'),
              React.createElement('p', { className: 'text-emerald-100 text-sm max-w-xl' },
                'Speak directly with our pharmacy staff on WhatsApp or place an online enquiry for pharmacist stock confirmation.'
              )
            ),
            React.createElement('div', { className: 'flex flex-wrap gap-3' },
              React.createElement(Button, {
                variant: 'whatsapp',
                size: 'lg',
                onClick: () => {
                  const num = (storeConfig?.whatsappNumber || '919876543210').replace(/\D/g, '');
                  window.open(`https://wa.me/${num}`, '_blank');
                },
                icon: 'whatsapp'
              }, 'WhatsApp Support'),
              React.createElement(Button, {
                variant: 'outline',
                size: 'lg',
                onClick: () => navigateTo('contact'),
                className: 'bg-white/10 text-white border-white/30 hover:bg-white/20'
              }, 'Contact Form')
            )
          )
        )
      ),

      // ==========================================
      // PAGE 2: MEDICINES & SERVICES
      // ==========================================
      currentRoute === 'medicines' && React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8' },
        // Header & Search
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', { className: 'flex flex-col md:flex-row md:items-center justify-between gap-4' },
            React.createElement('div', { className: 'space-y-1' },
              React.createElement('h1', { className: 'font-heading font-extrabold text-3xl sm:text-4xl text-slate-900' },
                'Medicine Catalogue & Healthcare'
              ),
              React.createElement('p', { className: 'text-slate-600 text-sm' },
                'Search verified formulations, check current counter stock, and submit an availability enquiry.'
              )
            ),

            // Live Search Bar
            React.createElement('div', { className: 'relative w-full md:w-96' },
              React.createElement(Icon, { name: 'search', className: 'w-5 h-5 absolute left-3.5 top-3 text-slate-400' }),
              React.createElement('input', {
                type: 'text',
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                placeholder: 'Search by medicine, brand, or salt...',
                className: 'w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white shadow-xs'
              }),
              searchQuery && React.createElement('button', {
                onClick: () => setSearchQuery(''),
                className: 'absolute right-3 top-3 text-slate-400 hover:text-slate-600'
              }, React.createElement(Icon, { name: 'close', className: 'w-4 h-4' }))
            )
          ),

          // Statutory Pharmacy Disclaimer Notice
          React.createElement('div', { className: 'p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 leading-relaxed' },
            React.createElement(Icon, { name: 'shield', className: 'w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5' }),
            React.createElement('div', null,
              React.createElement('strong', { className: 'font-semibold' }, 'Prescription Medicine Regulation Notice: '),
              'Medicines marked with ',
              React.createElement('span', { className: 'font-bold text-amber-800' }, 'Rx Required'),
              ' require verification of a valid registered medical practitioner prescription. Submitting an enquiry does not constitute an automated direct sale. Our licensed pharmacist will review your prescription before dispensing.'
            )
          )
        ),

        // Filter Bar: Category Tabs & Prescription Toggle
        React.createElement('div', { className: 'space-y-3' },
          // Category Chips
          React.createElement('div', { className: 'flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none' },
            categories.map(cat => (
              React.createElement('button', {
                key: cat,
                onClick: () => setSelectedCategory(cat),
                className: `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-700/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`
              }, cat)
            ))
          ),

          // Sub-Filter: All vs Rx vs OTC
          React.createElement('div', { className: 'flex items-center justify-between text-xs text-slate-500 pt-1' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'font-semibold text-slate-700' }, 'Filter Formulation:'),
              ['All', 'OTC', 'Rx'].map(f => (
                React.createElement('button', {
                  key: f,
                  onClick: () => setRxFilter(f),
                  className: `px-2.5 py-1 rounded-md transition-colors ${
                    rxFilter === f ? 'bg-slate-800 text-white font-medium' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`
                }, f === 'All' ? 'All Formulations' : f === 'Rx' ? 'Rx Prescription Only' : 'OTC Approved Only')
              ))
            ),
            React.createElement('div', null,
              `Showing ${products.length} product${products.length === 1 ? '' : 's'}`
            )
          )
        ),

        // Catalogue Grid / Loading / Empty States
        loadingProducts ? (
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' },
            Array.from({ length: 8 }).map((_, idx) => (
              React.createElement('div', { key: idx, className: 'h-80 bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4' },
                React.createElement('div', { className: 'w-full h-36 bg-slate-200 rounded-xl' }),
                React.createElement('div', { className: 'h-4 bg-slate-200 rounded w-3/4' }),
                React.createElement('div', { className: 'h-3 bg-slate-200 rounded w-1/2' }),
                React.createElement('div', { className: 'h-8 bg-slate-200 rounded w-full' })
              )
            ))
          )
        ) : products.length === 0 ? (
          // Empty state
          React.createElement('div', { className: 'text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 space-y-4 p-8' },
            React.createElement('div', { className: 'w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto' },
              React.createElement(Icon, { name: 'search', className: 'w-7 h-7' })
            ),
            React.createElement('div', { className: 'space-y-1' },
              React.createElement('h3', { className: 'font-heading font-bold text-slate-900 text-lg' }, 'No Medicines Found'),
              React.createElement('p', { className: 'text-xs text-slate-500 max-w-md mx-auto' },
                `We could not find any medicines matching "${searchQuery || selectedCategory}". Try checking for generic salt names or contact our pharmacy counter directly.`
              )
            ),
            React.createElement('div', { className: 'flex justify-center gap-3 pt-2' },
              React.createElement(Button, {
                variant: 'outline',
                size: 'sm',
                onClick: () => { setSearchQuery(''); setSelectedCategory('All'); setRxFilter('All'); }
              }, 'Reset Filters'),
              React.createElement(Button, {
                variant: 'whatsapp',
                size: 'sm',
                icon: 'whatsapp',
                onClick: () => {
                  const num = (storeConfig?.whatsappNumber || '919876543210').replace(/\D/g, '');
                  window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Inquiry for: ${searchQuery}`)}`, '_blank');
                }
              }, 'Inquire on WhatsApp')
            )
          )
        ) : (
          // Grid of products
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' },
            products.map(prod => (
              React.createElement(ProductCard, {
                key: prod.id,
                product: prod,
                onSelectDetails: (p) => setSelectedProduct(p),
                onAddToEnquiry: (p) => addToCart(p, 1)
              })
            ))
          )
        )
      ),

      // ==========================================
      // PAGE 3: CONTACT US
      // ==========================================
      currentRoute === 'contact' && React.createElement(ContactForm, {
        storeConfig
      })
    ),

    // FOOTER
    React.createElement(Footer, {
      storeConfig,
      onNavigate: navigateTo,
      onOpenAdmin: () => setAdminOpen(true)
    }),

    // MODAL: Product Specifications
    React.createElement(ProductModal, {
      product: selectedProduct,
      isOpen: Boolean(selectedProduct),
      onClose: () => setSelectedProduct(null),
      onAddToEnquiry: (p, qty) => addToCart(p, qty)
    }),

    // DRAWER: Medicine Order Enquiry Basket & Prescription Upload
    React.createElement(EnquiryDrawer, {
      isOpen: cartOpen,
      onClose: () => setCartOpen(false),
      items: cartItems,
      onUpdateQuantity: updateQuantity,
      onRemoveItem: removeFromCart,
      onClearCart: clearCart,
      onSubmitSuccess: (ref) => {
        showToast(`Enquiry ${ref} submitted! Our pharmacist will review it.`);
      }
    }),

    // ADMIN DASHBOARD PORTAL MODAL
    React.createElement(AdminPanel, {
      isOpen: adminOpen,
      onClose: () => {
        setAdminOpen(false);
        if (window.location.hash === '#admin') {
          window.location.hash = currentRoute;
        }
      },
      storeConfig,
      onConfigUpdated: (newConfig) => {
        setStoreConfig(newConfig);
        showToast('Store configuration saved successfully.');
      }
    })
  );
}

// Mount React Root
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(React.createElement(App));
}
