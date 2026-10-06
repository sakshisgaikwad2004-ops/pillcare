// AdminPanel.js - Pharmacy management dashboard for Pillcare Medical
import React, { useState, useEffect } from 'https://esm.sh/react@18.3.1';
import { Button, Icon, Badge, Alert, Modal } from './UI.js';

export function AdminPanel({ isOpen, onClose, storeConfig, onConfigUpdated }) {
  if (!isOpen) return null;

  const [token, setToken] = useState(() => localStorage.getItem('pcm_token') || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pcm_user') || 'null'); } catch { return null; }
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('pillcare2026!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Active admin tab: 'stats' | 'enquiries' | 'products' | 'settings'
  const [activeTab, setActiveTab] = useState('stats');

  // Stats state
  const [stats, setStats] = useState(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Products management state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Store settings form state
  const [settingsForm, setSettingsForm] = useState(storeConfig || {});
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Global message
  const [alertInfo, setAlertInfo] = useState(null);

  // Headers helper
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Perform login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('pcm_token', data.token);
      localStorage.setItem('pcm_user', JSON.stringify(data.user));
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: authHeaders });
    } catch {
      // ignore
    }
    localStorage.removeItem('pcm_token');
    localStorage.removeItem('pcm_user');
    setToken(null);
    setUser(null);
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', { headers: authHeaders });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch enquiries
  const fetchEnquiries = async () => {
    if (!token) return;
    setEnquiryLoading(true);
    try {
      const url = statusFilter === 'All' ? '/api/enquiries' : `/api/enquiries?status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url, { headers: authHeaders });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEnquiryLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const url = productSearch ? `/api/products?search=${encodeURIComponent(productSearch)}` : '/api/products';
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchEnquiries();
      fetchProducts();
      setSettingsForm(storeConfig);
    }
  }, [token, activeTab, statusFilter]);

  // Update enquiry status
  const handleUpdateStatus = async (enquiryId, newStatus) => {
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus, adminNotes: statusUpdateNote || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setAlertInfo({ type: 'success', text: `Enquiry #${enquiryId} updated to ${newStatus}.` });
      setStatusUpdateNote('');
      fetchEnquiries();
      fetchStats();
      if (selectedEnquiry) {
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus, adminNotes: statusUpdateNote || prev.adminNotes }));
      }
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.message });
    }
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const method = isNewProduct ? 'POST' : 'PUT';
      const url = isNewProduct ? '/api/products' : `/api/products/${editingProduct.id}`;

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(editingProduct)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      setAlertInfo({ type: 'success', text: isNewProduct ? 'Product created successfully.' : 'Product updated successfully.' });
      setEditingProduct(null);
      setIsNewProduct(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.message });
    }
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      setAlertInfo({ type: 'success', text: `Product "${name}" deleted.` });
      fetchProducts();
      fetchStats();
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.message });
    }
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update store settings');

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      if (onConfigUpdated) onConfigUpdated(settingsForm);
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.message });
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6'
  },
    React.createElement('div', {
      className: 'relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] modal-animate'
    },
      // Admin Header
      React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold' },
            React.createElement(Icon, { name: 'shield', className: 'w-5 h-5' })
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-heading font-bold text-lg leading-tight' }, 'Pillcare Medical — Admin Portal'),
            React.createElement('p', { className: 'text-xs text-slate-400' },
              token ? `Logged in as: ${user?.username} (${user?.role})` : 'Pharmacist & Staff Security Verification'
            )
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-3' },
          token && React.createElement(Button, {
            variant: 'ghost',
            size: 'sm',
            onClick: handleLogout,
            className: 'text-slate-300 hover:text-white hover:bg-slate-800'
          }, 'Sign Out'),
          React.createElement('button', {
            onClick: onClose,
            className: 'text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors',
            'aria-label': 'Close admin panel'
          }, React.createElement(Icon, { name: 'close', className: 'w-6 h-6' }))
        )
      ),

      // Alert notifications
      alertInfo && React.createElement('div', { className: 'px-6 pt-3' },
        React.createElement(Alert, {
          type: alertInfo.type,
          message: alertInfo.text,
          onClose: () => setAlertInfo(null)
        })
      ),

      // MAIN BODY: Login View or Dashboard Views
      !token ? (
        // LOGIN FORM
        React.createElement('div', { className: 'p-8 sm:p-12 max-w-md mx-auto w-full space-y-6 my-auto' },
          React.createElement('div', { className: 'text-center space-y-2' },
            React.createElement('div', { className: 'w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto' },
              React.createElement(Icon, { name: 'lock', className: 'w-6 h-6' })
            ),
            React.createElement('h4', { className: 'font-heading font-extrabold text-2xl text-slate-900' }, 'Pharmacist Staff Login'),
            React.createElement('p', { className: 'text-xs text-slate-500' },
              'Enter verified credentials to access medicine inventory, prescriptions, and order enquiries.'
            )
          ),

          loginError && React.createElement(Alert, { type: 'error', message: loginError }),

          React.createElement('form', { onSubmit: handleLogin, className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Staff Username'),
              React.createElement('input', {
                type: 'text',
                value: loginUsername,
                onChange: (e) => setLoginUsername(e.target.value),
                required: true,
                className: 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
              })
            ),

            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Password'),
              React.createElement('input', {
                type: 'password',
                value: loginPassword,
                onChange: (e) => setLoginPassword(e.target.value),
                required: true,
                className: 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
              })
            ),

            React.createElement('div', { className: 'p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500' },
              React.createElement('strong', { className: 'text-slate-700 block mb-0.5' }, 'Demo Administrator Credentials:'),
              React.createElement('div', null, 'Username: ', React.createElement('code', { className: 'font-bold text-emerald-800' }, 'admin')),
              React.createElement('div', null, 'Password: ', React.createElement('code', { className: 'font-bold text-emerald-800' }, 'pillcare2026!'))
            ),

            React.createElement(Button, {
              type: 'submit',
              variant: 'primary',
              size: 'lg',
              loading: loginLoading,
              className: 'w-full'
            }, 'Sign In to Dashboard')
          )
        )
      ) : (
        // DASHBOARD WITH TABS
        React.createElement('div', { className: 'flex-1 overflow-hidden flex flex-col' },
          // Tab bar
          React.createElement('div', { className: 'flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/80 overflow-x-auto text-sm' },
            [
              { id: 'stats', label: 'Overview & Statistics', icon: 'shield' },
              { id: 'enquiries', label: `Order Enquiries (${stats?.totalEnquiries ?? 0})`, icon: 'fileText' },
              { id: 'products', label: `Catalogue Products (${stats?.totalProducts ?? 0})`, icon: 'bag' },
              { id: 'settings', label: 'Store Information & Maps', icon: 'mapPin' }
            ].map(tab => (
              React.createElement('button', {
                key: tab.id,
                onClick: () => setActiveTab(tab.id),
                className: `flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              },
                React.createElement(Icon, { name: tab.icon, className: 'w-4 h-4' }),
                tab.label
              )
            ))
          ),

          // TAB CONTENT CONTAINER
          React.createElement('div', { className: 'flex-1 overflow-y-auto p-6 space-y-6' },

            // 1. STATS TAB
            activeTab === 'stats' && React.createElement('div', { className: 'space-y-6' },
              React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-4' },
                [
                  { label: 'Total Enquiries', value: stats?.totalEnquiries ?? 0, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: 'fileText' },
                  { label: 'Pending Review', value: stats?.pendingEnquiries ?? 0, bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: 'clock' },
                  { label: 'Confirmed Enquiries', value: stats?.confirmedEnquiries ?? 0, bg: 'bg-sky-50 text-sky-800 border-sky-200', icon: 'check' },
                  { label: 'Catalogue Products', value: stats?.totalProducts ?? 0, bg: 'bg-slate-50 text-slate-800 border-slate-200', icon: 'bag' }
                ].map((stat, idx) => (
                  React.createElement('div', { key: idx, className: `p-5 rounded-2xl border ${stat.bg} space-y-1` },
                    React.createElement('div', { className: 'flex items-center justify-between' },
                      React.createElement('span', { className: 'text-xs uppercase font-bold tracking-wider opacity-70' }, stat.label),
                      React.createElement(Icon, { name: stat.icon, className: 'w-4 h-4 opacity-60' })
                    ),
                    React.createElement('div', { className: 'font-heading font-extrabold text-3xl' }, stat.value)
                  ))
                )
              ),

              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                React.createElement('div', { className: 'p-6 rounded-2xl bg-white border border-slate-200 space-y-4' },
                  React.createElement('h4', { className: 'font-heading font-bold text-slate-900' }, 'Compliance & Security Protocol'),
                  React.createElement('ul', { className: 'text-xs text-slate-600 space-y-2 leading-relaxed' },
                    React.createElement('li', { className: 'flex items-start gap-2' },
                      React.createElement(Icon, { name: 'check', className: 'w-4 h-4 text-emerald-600 flex-shrink-0' }),
                      'Prescriptions stored with restricted access. Downloadable only by verified staff.'
                    ),
                    React.createElement('li', { className: 'flex items-start gap-2' },
                      React.createElement(Icon, { name: 'check', className: 'w-4 h-4 text-emerald-600 flex-shrink-0' }),
                      'Customer phone and personal details are encrypted and masked from public access.'
                    ),
                    React.createElement('li', { className: 'flex items-start gap-2' },
                      React.createElement(Icon, { name: 'check', className: 'w-4 h-4 text-emerald-600 flex-shrink-0' }),
                      'Direct online medicine sales remain disabled until valid pharmacy licensing is confirmed.'
                    )
                  )
                ),
                React.createElement('div', { className: 'p-6 rounded-2xl bg-white border border-slate-200 space-y-3' },
                  React.createElement('h4', { className: 'font-heading font-bold text-slate-900' }, 'Quick Actions'),
                  React.createElement('div', { className: 'flex flex-col gap-2' },
                    React.createElement(Button, {
                      variant: 'outline',
                      onClick: () => setActiveTab('enquiries'),
                      icon: 'fileText',
                      className: 'justify-start'
                    }, 'Review Customer Medicine Enquiries'),
                    React.createElement(Button, {
                      variant: 'outline',
                      onClick: () => {
                        setEditingProduct({
                          name: '', brand: '', category: 'Tablets & Capsules', composition: '',
                          strength: '', price: 0, stockStatus: 'In Stock', prescriptionRequired: 0,
                          packSize: '', description: '', dosageInstructions: '', isFeatured: 0, imageUrl: ''
                        });
                        setIsNewProduct(true);
                        setActiveTab('products');
                      },
                      icon: 'plus',
                      className: 'justify-start'
                    }, 'Add New Medicine to Catalogue'),
                    React.createElement(Button, {
                      variant: 'outline',
                      onClick: () => setActiveTab('settings'),
                      icon: 'mapPin',
                      className: 'justify-start'
                    }, 'Update Store Address, Hours & Google Maps')
                  )
                )
              )
            ),

            // 2. ENQUIRIES TAB
            activeTab === 'enquiries' && React.createElement('div', { className: 'space-y-4' },
              // Filter controls
              React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-3' },
                React.createElement('div', { className: 'flex items-center gap-2 text-xs' },
                  React.createElement('span', { className: 'font-semibold text-slate-600' }, 'Filter Status:'),
                  ['All', 'Pending', 'Under Review', 'Confirmed', 'Rejected', 'Completed'].map(st => (
                    React.createElement('button', {
                      key: st,
                      onClick: () => setStatusFilter(st),
                      className: `px-2.5 py-1 rounded-full font-medium transition-colors ${
                        statusFilter === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`
                    }, st)
                  ))
                ),
                React.createElement(Button, {
                  variant: 'outline',
                  size: 'sm',
                  onClick: fetchEnquiries,
                  icon: 'refresh'
                }, 'Refresh')
              ),

              // Enquiries Table / Cards
              enquiries.length === 0 ? (
                React.createElement('div', { className: 'text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500' },
                  'No medicine enquiries found matching the selected filter.'
                )
              ) : (
                React.createElement('div', { className: 'border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs' },
                  React.createElement('div', { className: 'divide-y divide-slate-100' },
                    enquiries.map(enquiry => (
                      React.createElement('div', {
                        key: enquiry.id,
                        className: 'p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4'
                      },
                        // Left: Customer & items overview
                        React.createElement('div', { className: 'space-y-1.5 flex-1 min-w-0' },
                          React.createElement('div', { className: 'flex items-center gap-3' },
                            React.createElement('span', { className: 'font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded' },
                              enquiry.referenceCode
                            ),
                            React.createElement('span', { className: 'font-semibold text-slate-900 text-sm' }, enquiry.customerName),
                            React.createElement('span', { className: 'text-xs text-slate-500' }, `• ${enquiry.customerPhone}`)
                          ),
                          React.createElement('div', { className: 'text-xs text-slate-600 line-clamp-1' },
                            enquiry.items && enquiry.items.length > 0
                              ? `Items: ${enquiry.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}`
                              : enquiry.notes || 'Contact enquiry'
                          ),
                          React.createElement('div', { className: 'text-[11px] text-slate-400' },
                            `Submitted on: ${new Date(enquiry.createdAt).toLocaleString()} | Preference: ${enquiry.preference}`
                          )
                        ),

                        // Center: Status Badge & Prescription Indicator
                        React.createElement('div', { className: 'flex items-center gap-3' },
                          enquiry.prescriptionFile && React.createElement('a', {
                            href: `/api/uploads/${enquiry.prescriptionFile}`,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            className: 'px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1 hover:underline'
                          },
                            React.createElement(Icon, { name: 'fileText', className: 'w-3.5 h-3.5' }),
                            'View Rx File'
                          ),

                          React.createElement(Badge, {
                            variant: enquiry.status === 'Pending' ? 'pending'
                              : enquiry.status === 'Under Review' ? 'underReview'
                              : enquiry.status === 'Confirmed' ? 'confirmed'
                              : enquiry.status === 'Rejected' ? 'rejected' : 'completed',
                            size: 'sm'
                          }, enquiry.status)
                        ),

                        // Right: Action Dropdown / Manage
                        React.createElement('div', { className: 'flex items-center gap-2' },
                          React.createElement('select', {
                            value: enquiry.status,
                            onChange: (e) => handleUpdateStatus(enquiry.id, e.target.value),
                            className: 'text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:border-emerald-600'
                          },
                            React.createElement('option', { value: 'Pending' }, 'Pending'),
                            React.createElement('option', { value: 'Under Review' }, 'Under Review'),
                            React.createElement('option', { value: 'Confirmed' }, 'Confirmed'),
                            React.createElement('option', { value: 'Rejected' }, 'Rejected'),
                            React.createElement('option', { value: 'Completed' }, 'Completed')
                          ),
                          React.createElement(Button, {
                            variant: 'outline',
                            size: 'sm',
                            onClick: () => setSelectedEnquiry(enquiry)
                          }, 'Inspect Details')
                        )
                      )
                    ))
                  )
                )
              )
            ),

            // 3. PRODUCTS TAB
            activeTab === 'products' && React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-between gap-3' },
                // Search
                React.createElement('div', { className: 'relative w-full sm:w-80' },
                  React.createElement(Icon, { name: 'search', className: 'w-4 h-4 absolute left-3 top-3 text-slate-400' }),
                  React.createElement('input', {
                    type: 'text',
                    value: productSearch,
                    onChange: (e) => setProductSearch(e.target.value),
                    onKeyDown: (e) => { if (e.key === 'Enter') fetchProducts(); },
                    placeholder: 'Search medicine, brand, salt...',
                    className: 'w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-600'
                  })
                ),
                React.createElement(Button, {
                  variant: 'primary',
                  size: 'sm',
                  icon: 'plus',
                  onClick: () => {
                    setEditingProduct({
                      name: '', brand: '', category: 'Tablets & Capsules', composition: '',
                      strength: '', price: 0, stockStatus: 'In Stock', prescriptionRequired: 0,
                      packSize: '', description: '', dosageInstructions: '', isFeatured: 0, imageUrl: ''
                    });
                    setIsNewProduct(true);
                  }
                }, 'Add New Medicine')
              ),

              // Product list table
              React.createElement('div', { className: 'border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs' },
                React.createElement('table', { className: 'min-w-full divide-y divide-slate-200 text-left text-xs' },
                  React.createElement('thead', { className: 'bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider' },
                    React.createElement('tr', null,
                      React.createElement('th', { className: 'py-3 px-4' }, 'Medicine'),
                      React.createElement('th', { className: 'py-3 px-4' }, 'Category'),
                      React.createElement('th', { className: 'py-3 px-4' }, 'Price'),
                      React.createElement('th', { className: 'py-3 px-4' }, 'Stock'),
                      React.createElement('th', { className: 'py-3 px-4' }, 'Rx Rule'),
                      React.createElement('th', { className: 'py-3 px-4 text-right' }, 'Actions')
                    )
                  ),
                  React.createElement('tbody', { className: 'divide-y divide-slate-100' },
                    products.map(p => (
                      React.createElement('tr', { key: p.id, className: 'hover:bg-slate-50 transition-colors' },
                        React.createElement('td', { className: 'py-3 px-4' },
                          React.createElement('div', { className: 'font-semibold text-slate-900 text-sm' }, p.name),
                          React.createElement('div', { className: 'text-slate-500 text-xs' }, `${p.brand} • ${p.strength}`)
                        ),
                        React.createElement('td', { className: 'py-3 px-4 text-slate-700' }, p.category),
                        React.createElement('td', { className: 'py-3 px-4 font-mono font-bold text-slate-900' }, `₹${p.price.toFixed(2)}`),
                        React.createElement('td', { className: 'py-3 px-4' },
                          React.createElement(Badge, {
                            variant: p.stockStatus === 'In Stock' ? 'inStock' : 'lowStock',
                            size: 'xs'
                          }, p.stockStatus)
                        ),
                        React.createElement('td', { className: 'py-3 px-4' },
                          p.prescriptionRequired
                            ? React.createElement(Badge, { variant: 'rx', size: 'xs' }, 'Rx Required')
                            : React.createElement(Badge, { variant: 'otc', size: 'xs' }, 'OTC')
                        ),
                        React.createElement('td', { className: 'py-3 px-4 text-right space-x-2' },
                          React.createElement('button', {
                            onClick: () => { setEditingProduct({ ...p }); setIsNewProduct(false); },
                            className: 'text-emerald-700 hover:text-emerald-800 font-semibold'
                          }, 'Edit'),
                          React.createElement('button', {
                            onClick: () => handleDeleteProduct(p.id, p.name),
                            className: 'text-rose-600 hover:text-rose-700 font-semibold'
                          }, 'Delete')
                        )
                      )
                    ))
                  )
                )
              )
            ),

            // 4. SETTINGS TAB
            activeTab === 'settings' && React.createElement('form', { onSubmit: handleSaveSettings, className: 'space-y-6 max-w-3xl' },
              React.createElement('div', { className: 'p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed' },
                'Changes made here will immediately update the public store information, contact placeholders, business hours, and Google Maps embed.'
              ),

              settingsSaved && React.createElement(Alert, {
                type: 'success',
                message: 'Store settings saved successfully and updated live!'
              }),

              React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Store Name'),
                  React.createElement('input', {
                    type: 'text',
                    value: settingsForm.storeName || '',
                    onChange: (e) => setSettingsForm({ ...settingsForm, storeName: e.target.value }),
                    className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Owner / Pharmacist Name Placeholder'),
                  React.createElement('input', {
                    type: 'text',
                    value: settingsForm.ownerName || '',
                    onChange: (e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value }),
                    className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Store Contact Number Placeholder'),
                  React.createElement('input', {
                    type: 'text',
                    value: settingsForm.contactNumber || '',
                    onChange: (e) => setSettingsForm({ ...settingsForm, contactNumber: e.target.value }),
                    className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'WhatsApp Number (Digits Only)'),
                  React.createElement('input', {
                    type: 'text',
                    value: settingsForm.whatsappNumber || '',
                    onChange: (e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value }),
                    className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Email Address Placeholder'),
                  React.createElement('input', {
                    type: 'email',
                    value: settingsForm.email || '',
                    onChange: (e) => setSettingsForm({ ...settingsForm, email: e.target.value }),
                    className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Weekday Business Hours'),
                  React.createElement('input', {
                    type: 'text',
                    value: settingsForm.businessHours?.weekdays || '',
                    onChange: (e) => setSettingsForm({
                      ...settingsForm,
                      businessHours: { ...settingsForm.businessHours, weekdays: e.target.value }
                    }),
                    className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                  })
                )
              ),

              // Full Address
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Store Address (Line 1)'),
                React.createElement('input', {
                  type: 'text',
                  value: settingsForm.address?.line1 || '',
                  onChange: (e) => setSettingsForm({
                    ...settingsForm,
                    address: { ...settingsForm.address, line1: e.target.value }
                  }),
                  className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                })
              ),

              // Google Maps URL
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Google Maps Embed URL'),
                React.createElement('input', {
                  type: 'text',
                  value: settingsForm.googleMaps?.embedUrl || '',
                  onChange: (e) => setSettingsForm({
                    ...settingsForm,
                    googleMaps: { ...settingsForm.googleMaps, embedUrl: e.target.value }
                  }),
                  placeholder: 'https://www.google.com/maps/embed?...',
                  className: 'w-full px-3.5 py-2 border rounded-xl text-sm'
                })
              ),

              React.createElement(Button, {
                type: 'submit',
                variant: 'primary',
                size: 'md'
              }, 'Save Store Settings')
            )
          )
        )
      )
    ),

    // SUB-MODAL: Product Edit / Create Modal
    editingProduct && React.createElement(Modal, {
      isOpen: true,
      onClose: () => setEditingProduct(null),
      title: isNewProduct ? 'Add New Medicine to Catalogue' : `Edit ${editingProduct.name}`,
      maxWidth: 'max-w-2xl'
    },
      React.createElement('form', { onSubmit: handleSaveProduct, className: 'space-y-4' },
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Medicine Name *'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.name,
              onChange: (e) => setEditingProduct({ ...editingProduct, name: e.target.value }),
              required: true,
              className: 'w-full px-3 py-2 border rounded-lg text-sm'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Brand / Manufacturer *'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.brand,
              onChange: (e) => setEditingProduct({ ...editingProduct, brand: e.target.value }),
              required: true,
              className: 'w-full px-3 py-2 border rounded-lg text-sm'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Category *'),
            React.createElement('select', {
              value: editingProduct.category,
              onChange: (e) => setEditingProduct({ ...editingProduct, category: e.target.value }),
              className: 'w-full px-3 py-2 border rounded-lg text-sm bg-white'
            },
              ['Tablets & Capsules', 'Syrups & Liquids', 'Healthcare Products', 'Vitamins & Supplements', 'Other approved products'].map(c => (
                React.createElement('option', { key: c, value: c }, c)
              ))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Statutory MRP (₹) *'),
            React.createElement('input', {
              type: 'number',
              step: '0.01',
              value: editingProduct.price,
              onChange: (e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 }),
              required: true,
              className: 'w-full px-3 py-2 border rounded-lg text-sm'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Active Composition / Salt'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.composition || '',
              onChange: (e) => setEditingProduct({ ...editingProduct, composition: e.target.value }),
              className: 'w-full px-3 py-2 border rounded-lg text-sm'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Strength / Formulation'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.strength || '',
              onChange: (e) => setEditingProduct({ ...editingProduct, strength: e.target.value }),
              className: 'w-full px-3 py-2 border rounded-lg text-sm'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Stock Status'),
            React.createElement('select', {
              value: editingProduct.stockStatus,
              onChange: (e) => setEditingProduct({ ...editingProduct, stockStatus: e.target.value }),
              className: 'w-full px-3 py-2 border rounded-lg text-sm bg-white'
            },
              ['In Stock', 'Low Stock', 'Out of Stock'].map(s => (
                React.createElement('option', { key: s, value: s }, s)
              ))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Pack Size'),
            React.createElement('input', {
              type: 'text',
              value: editingProduct.packSize || '',
              onChange: (e) => setEditingProduct({ ...editingProduct, packSize: e.target.value }),
              placeholder: 'Strip of 10 / 100ml',
              className: 'w-full px-3 py-2 border rounded-lg text-sm'
            })
          )
        ),

        React.createElement('div', { className: 'flex items-center gap-6 pt-2' },
          React.createElement('label', { className: 'flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer' },
            React.createElement('input', {
              type: 'checkbox',
              checked: Boolean(editingProduct.prescriptionRequired),
              onChange: (e) => setEditingProduct({ ...editingProduct, prescriptionRequired: e.target.checked ? 1 : 0 }),
              className: 'rounded text-emerald-600 focus:ring-emerald-500'
            }),
            'Prescription Required (Schedule H / Rx)'
          ),
          React.createElement('label', { className: 'flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer' },
            React.createElement('input', {
              type: 'checkbox',
              checked: Boolean(editingProduct.isFeatured),
              onChange: (e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked ? 1 : 0 }),
              className: 'rounded text-emerald-600 focus:ring-emerald-500'
            }),
            'Show in Featured Section'
          )
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Image URL'),
          React.createElement('input', {
            type: 'url',
            value: editingProduct.imageUrl || '',
            onChange: (e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value }),
            placeholder: 'https://...',
            className: 'w-full px-3 py-2 border rounded-lg text-sm'
          })
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 mb-1' }, 'Description / Medical Summary'),
          React.createElement('textarea', {
            rows: 2,
            value: editingProduct.description || '',
            onChange: (e) => setEditingProduct({ ...editingProduct, description: e.target.value }),
            className: 'w-full px-3 py-2 border rounded-lg text-sm'
          })
        ),

        React.createElement('div', { className: 'flex justify-end gap-3 pt-3 border-t border-slate-200' },
          React.createElement(Button, {
            type: 'button',
            variant: 'outline',
            onClick: () => setEditingProduct(null)
          }, 'Cancel'),
          React.createElement(Button, {
            type: 'submit',
            variant: 'primary'
          }, isNewProduct ? 'Add Medicine' : 'Save Changes')
        )
      )
    ),

    // SUB-MODAL: Enquiry Detailed Inspection Modal
    selectedEnquiry && React.createElement(Modal, {
      isOpen: true,
      onClose: () => setSelectedEnquiry(null),
      title: `Enquiry ${selectedEnquiry.referenceCode}`,
      maxWidth: 'max-w-xl'
    },
      React.createElement('div', { className: 'space-y-4 text-sm' },
        React.createElement('div', { className: 'p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1' },
          React.createElement('div', { className: 'text-xs text-slate-400 uppercase font-semibold' }, 'Customer Information'),
          React.createElement('div', { className: 'font-bold text-slate-900' }, selectedEnquiry.customerName),
          React.createElement('div', { className: 'text-slate-600' }, `Phone: ${selectedEnquiry.customerPhone}`),
          selectedEnquiry.customerEmail && React.createElement('div', { className: 'text-slate-600' }, `Email: ${selectedEnquiry.customerEmail}`),
          React.createElement('div', { className: 'text-slate-500 text-xs' }, `Preference: ${selectedEnquiry.preference}`)
        ),

        selectedEnquiry.notes && React.createElement('div', { className: 'p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1' },
          React.createElement('div', { className: 'text-xs text-slate-400 uppercase font-semibold' }, 'Customer Notes / Query'),
          React.createElement('div', { className: 'text-slate-700 text-xs leading-relaxed' }, selectedEnquiry.notes)
        ),

        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'text-xs font-semibold text-slate-700 uppercase' }, 'Requested Medicines:'),
          React.createElement('div', { className: 'divide-y border rounded-xl overflow-hidden' },
            (selectedEnquiry.items || []).map((it, idx) => (
              React.createElement('div', { key: idx, className: 'p-2.5 bg-white flex justify-between items-center text-xs' },
                React.createElement('div', null,
                  React.createElement('span', { className: 'font-semibold text-slate-900' }, it.name),
                  React.createElement('span', { className: 'text-slate-500 ml-2' }, `(Qty: ${it.quantity})`)
                ),
                React.createElement('span', { className: 'font-mono' }, `₹${(it.price * it.quantity).toFixed(2)}`)
              )
            ))
          )
        ),

        selectedEnquiry.prescriptionFile && React.createElement('div', { className: 'p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center gap-2 text-sky-900 font-medium text-xs' },
            React.createElement(Icon, { name: 'fileText', className: 'w-4 h-4 text-sky-600' }),
            'Customer Uploaded Doctor Prescription'
          ),
          React.createElement('a', {
            href: `/api/uploads/${selectedEnquiry.prescriptionFile}`,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-xs font-bold text-sky-700 hover:underline'
          }, 'Open Document')
        ),

        React.createElement('div', { className: 'space-y-2 pt-2 border-t' },
          React.createElement('label', { className: 'block text-xs font-semibold text-slate-700' }, 'Add Pharmacist Verification Note:'),
          React.createElement('input', {
            type: 'text',
            value: statusUpdateNote,
            onChange: (e) => setStatusUpdateNote(e.target.value),
            placeholder: 'e.g. Verified Rx. Stock available at counter.',
            className: 'w-full px-3 py-2 border rounded-lg text-xs'
          }),
          React.createElement('div', { className: 'flex flex-wrap gap-2 pt-1' },
            ['Under Review', 'Confirmed', 'Rejected', 'Completed'].map(st => (
              React.createElement(Button, {
                key: st,
                size: 'sm',
                variant: st === 'Confirmed' ? 'primary' : 'outline',
                onClick: () => handleUpdateStatus(selectedEnquiry.id, st)
              }, `Mark as ${st}`)
            ))
          )
        )
      )
    )
  );
}
