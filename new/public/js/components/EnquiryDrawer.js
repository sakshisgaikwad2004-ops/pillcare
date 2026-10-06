// EnquiryDrawer.js - Compliant medicine order enquiry basket & prescription upload drawer
import React, { useState } from 'https://esm.sh/react@18.3.1';
import { Button, Icon, Badge, Alert } from './UI.js';

export function EnquiryDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitSuccess
}) {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preference, setPreference] = useState('Counter Pickup');
  const [notes, setNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionBase64, setPrescriptionBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submittedRef, setSubmittedRef] = useState(null);

  // Check if any selected item requires prescription
  const rxRequiredItems = items.filter(item => item.product.prescriptionRequired);
  const hasRxItem = rxRequiredItems.length > 0;

  // Calculate estimated total MRP
  const estimatedTotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Handle prescription file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Prescription file size exceeds 5 MB. Please select a smaller file.');
      return;
    }

    // Validate extension
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Invalid format. Only JPG, PNG, or PDF files are accepted.');
      return;
    }

    setErrorMsg(null);
    setPrescriptionFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPrescriptionBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Enquiry
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    const digitsOnly = customerPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setErrorMsg('Please enter a valid 10 to 15 digit mobile phone number.');
      return;
    }

    if (hasRxItem && !prescriptionBase64) {
      setErrorMsg('One or more selected medicines require a prescription (Rx). Please upload a valid prescription before proceeding.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        preference,
        notes: notes.trim() || null,
        items: items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          composition: i.product.composition,
          strength: i.product.strength,
          price: i.product.price,
          prescriptionRequired: Boolean(i.product.prescriptionRequired),
          quantity: i.quantity
        })),
        prescriptionBase64: prescriptionBase64 || null,
        prescriptionFileName: prescriptionFile ? prescriptionFile.name : null
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (data.details ? data.details.join(', ') : 'Failed to submit enquiry'));
      }

      setSubmittedRef(data.referenceCode);
      onClearCart();
      if (onSubmitSuccess) onSubmitSuccess(data.referenceCode);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setPrescriptionFile(null);
    setPrescriptionBase64(null);
    setErrorMsg(null);
    onClose();
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity'
  },
    React.createElement('div', {
      className: 'fixed inset-0',
      onClick: onClose,
      'aria-hidden': 'true'
    }),
    React.createElement('div', {
      className: 'relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col z-10 modal-animate overflow-hidden'
    },
      // Drawer Header
      React.createElement('div', {
        className: 'flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50'
      },
        React.createElement('div', { className: 'flex items-center gap-2.5' },
          React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center' },
            React.createElement(Icon, { name: 'bag', className: 'w-5 h-5' })
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-heading font-bold text-slate-900 text-base' }, 'Medicine Order Enquiry'),
            React.createElement('p', { className: 'text-xs text-slate-500' }, 'Availability & Pharmacist Verification')
          )
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors',
          'aria-label': 'Close drawer'
        }, React.createElement(Icon, { name: 'close', className: 'w-5 h-5' }))
      ),

      // Drawer Content
      React.createElement('div', { className: 'flex-1 overflow-y-auto p-6 space-y-6' },
        // SUCCESS STATE SCREEN
        submittedRef ? (
          React.createElement('div', { className: 'py-8 text-center space-y-6' },
            React.createElement('div', { className: 'w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto' },
              React.createElement(Icon, { name: 'check', className: 'w-8 h-8' })
            ),
            React.createElement('div', { className: 'space-y-2' },
              React.createElement('h4', { className: 'font-heading font-extrabold text-2xl text-slate-900' }, 'Enquiry Submitted!'),
              React.createElement('p', { className: 'text-sm text-slate-600 max-w-sm mx-auto' },
                'Thank you. Your medicine availability enquiry has been logged with Pillcare Medical.'
              )
            ),
            React.createElement('div', { className: 'p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2' },
              React.createElement('div', { className: 'text-xs text-slate-400 uppercase tracking-wider font-semibold' }, 'Enquiry Reference ID'),
              React.createElement('div', { className: 'text-lg font-mono font-bold text-emerald-800' }, submittedRef),
              React.createElement('div', { className: 'text-xs text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed' },
                'Our registered pharmacist will verify stock and contact you at ',
                React.createElement('strong', { className: 'text-slate-800' }, customerPhone),
                ' to confirm pickup / fulfillment details.'
              )
            ),
            React.createElement(Button, {
              variant: 'primary',
              size: 'lg',
              onClick: handleReset,
              className: 'w-full'
            }, 'Done & Return to Catalogue')
          )
        ) : (
          // REGULAR BASKET & SUBMISSION FLOW
          React.createElement('div', { className: 'space-y-6' },
            // Important Statutory Notice
            React.createElement('div', { className: 'p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed' },
              React.createElement('strong', { className: 'font-semibold' }, 'Pharmacy Notice: '),
              'This enquiry confirms medicine availability and pricing. In compliance with pharmacy law, prescription medicines are verified and dispensed by our licensed pharmacist.'
            ),

            // Item List
            React.createElement('div', { className: 'space-y-3' },
              React.createElement('div', { className: 'flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500' },
                React.createElement('span', null, `Selected Items (${items.length})`),
                items.length > 0 && React.createElement('button', {
                  onClick: onClearCart,
                  className: 'text-rose-600 hover:text-rose-700 font-medium normal-case'
                }, 'Clear All')
              ),

              items.length === 0 ? (
                React.createElement('div', { className: 'text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-2' },
                  React.createElement(Icon, { name: 'bag', className: 'w-10 h-10 mx-auto opacity-40' }),
                  React.createElement('p', { className: 'text-sm font-medium' }, 'No medicines selected yet'),
                  React.createElement('p', { className: 'text-xs' }, 'Browse the catalogue and click "Enquire" on products to add them here.')
                )
              ) : (
                React.createElement('div', { className: 'divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden' },
                  items.map((item, idx) => (
                    React.createElement('div', { key: idx, className: 'p-3 bg-white flex items-center justify-between gap-3' },
                      React.createElement('div', { className: 'flex-1 min-w-0' },
                        React.createElement('div', { className: 'text-sm font-semibold text-slate-900 truncate' }, item.product.name),
                        React.createElement('div', { className: 'flex items-center gap-2 text-xs text-slate-500 mt-0.5' },
                          React.createElement('span', null, item.product.brand),
                          React.createElement('span', null, '•'),
                          React.createElement('span', { className: 'font-medium text-slate-700' }, `₹${item.product.price.toFixed(2)}`),
                          item.product.prescriptionRequired && React.createElement(Badge, { variant: 'rx', size: 'xs' }, 'Rx')
                        )
                      ),
                      // Quantity controls
                      React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('div', { className: 'flex items-center border border-slate-200 rounded-md' },
                          React.createElement('button', {
                            onClick: () => onUpdateQuantity(item.product.id, item.quantity - 1),
                            className: 'px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs'
                          }, '-'),
                          React.createElement('span', { className: 'px-2 text-xs font-semibold' }, item.quantity),
                          React.createElement('button', {
                            onClick: () => onUpdateQuantity(item.product.id, item.quantity + 1),
                            className: 'px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs'
                          }, '+')
                        ),
                        React.createElement('button', {
                          onClick: () => onRemoveItem(item.product.id),
                          className: 'p-1 text-slate-400 hover:text-rose-600 rounded'
                        }, React.createElement(Icon, { name: 'trash', className: 'w-4 h-4' }))
                      )
                    )
                  ))
                )
              )
            ),

            // If Items Exist, Show Prescription Upload & Form
            items.length > 0 && React.createElement('div', { className: 'space-y-5 pt-2' },
              // Subtotal Estimate
              React.createElement('div', { className: 'flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm' },
                React.createElement('span', { className: 'font-medium text-slate-600' }, 'Estimated MRP Subtotal:'),
                React.createElement('span', { className: 'font-heading font-extrabold text-slate-900 text-base' },
                  `₹${estimatedTotal.toFixed(2)}`
                )
              ),

              // Prescription Upload Section
              React.createElement('div', { className: 'space-y-2' },
                React.createElement('div', { className: 'flex items-center justify-between' },
                  React.createElement('label', { className: 'text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5' },
                    React.createElement(Icon, { name: 'fileText', className: 'w-4 h-4 text-emerald-600' }),
                    'Prescription Document',
                    hasRxItem && React.createElement('span', { className: 'text-rose-600 text-sm' }, '*')
                  ),
                  hasRxItem && React.createElement(Badge, { variant: 'rx', size: 'xs' }, 'Mandatory for Rx Items')
                ),

                React.createElement('div', {
                  className: `border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    prescriptionFile ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
                  }`
                },
                  React.createElement('input', {
                    type: 'file',
                    id: 'prescription-input',
                    accept: '.jpg,.jpeg,.png,.pdf',
                    onChange: handleFileChange,
                    className: 'hidden'
                  }),
                  React.createElement('label', {
                    htmlFor: 'prescription-input',
                    className: 'cursor-pointer block space-y-1'
                  },
                    React.createElement(Icon, {
                      name: prescriptionFile ? 'check' : 'upload',
                      className: `w-6 h-6 mx-auto ${prescriptionFile ? 'text-emerald-600' : 'text-slate-400'}`
                    }),
                    React.createElement('div', { className: 'text-xs font-semibold text-slate-700' },
                      prescriptionFile ? prescriptionFile.name : 'Click to Upload Doctor Prescription'
                    ),
                    React.createElement('div', { className: 'text-[11px] text-slate-400' },
                      'Supports JPG, PNG or PDF (Max 5MB)'
                    )
                  )
                ),
                prescriptionFile && React.createElement('div', { className: 'flex items-center justify-between text-xs text-emerald-700 pt-1' },
                  React.createElement('span', null, '✓ Document attached for pharmacist review'),
                  React.createElement('button', {
                    type: 'button',
                    onClick: () => { setPrescriptionFile(null); setPrescriptionBase64(null); },
                    className: 'text-rose-600 hover:underline'
                  }, 'Remove')
                )
              ),

              // Customer Details Form
              React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4 pt-2' },
                React.createElement('div', { className: 'text-xs font-bold uppercase tracking-wider text-slate-700' },
                  'Customer Contact Details'
                ),

                // Full Name
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-medium text-slate-700 mb-1' },
                    'Full Name ',
                    React.createElement('span', { className: 'text-rose-500' }, '*')
                  ),
                  React.createElement('input', {
                    type: 'text',
                    value: customerName,
                    onChange: (e) => setCustomerName(e.target.value),
                    placeholder: 'Enter your full name',
                    className: 'w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600',
                    required: true
                  })
                ),

                // Mobile Phone
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-medium text-slate-700 mb-1' },
                    'Mobile Phone Number ',
                    React.createElement('span', { className: 'text-rose-500' }, '*')
                  ),
                  React.createElement('input', {
                    type: 'tel',
                    value: customerPhone,
                    onChange: (e) => setCustomerPhone(e.target.value),
                    placeholder: 'e.g. 9876543210',
                    className: 'w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600',
                    required: true
                  })
                ),

                // Email (Optional)
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-medium text-slate-700 mb-1' },
                    'Email Address ',
                    React.createElement('span', { className: 'text-slate-400 font-normal' }, '(Optional)')
                  ),
                  React.createElement('input', {
                    type: 'email',
                    value: customerEmail,
                    onChange: (e) => setCustomerEmail(e.target.value),
                    placeholder: 'name@example.com',
                    className: 'w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  })
                ),

                // Pickup / Delivery Preference
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-medium text-slate-700 mb-1' }, 'Fulfillment Preference'),
                  React.createElement('div', { className: 'grid grid-cols-2 gap-2 text-xs' },
                    ['Counter Pickup', 'Home Delivery Enquiry'].map((opt) => (
                      React.createElement('button', {
                        key: opt,
                        type: 'button',
                        onClick: () => setPreference(opt),
                        className: `py-2 px-3 rounded-lg border font-medium text-center transition-colors ${
                          preference === opt
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`
                      }, opt)
                    ))
                  )
                ),

                // Notes / Instructions
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-medium text-slate-700 mb-1' },
                    'Notes / Specific Brand Preference ',
                    React.createElement('span', { className: 'text-slate-400 font-normal' }, '(Optional)')
                  ),
                  React.createElement('textarea', {
                    rows: 2,
                    value: notes,
                    onChange: (e) => setNotes(e.target.value),
                    placeholder: 'Mention preferred manufacturer or delivery timings...',
                    className: 'w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  })
                ),

                // Error message banner
                errorMsg && React.createElement(Alert, {
                  type: 'error',
                  message: errorMsg,
                  onClose: () => setErrorMsg(null)
                }),

                // Submit Button
                React.createElement(Button, {
                  type: 'submit',
                  variant: 'primary',
                  size: 'lg',
                  loading: loading,
                  className: 'w-full shadow-emerald-700/20'
                }, 'Submit Medicine Enquiry')
              )
            )
          )
        )
      )
    )
  );
}
