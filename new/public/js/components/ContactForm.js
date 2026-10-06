// ContactForm.js - Contact Us page component with Google Maps and enquiry form
import React, { useState } from 'https://esm.sh/react@18.3.1';
import { Button, Icon, Alert } from './UI.js';

export function ContactForm({ storeConfig }) {
  const cfg = storeConfig || {};
  const ownerName = cfg.ownerName || '[Pharmacist / Store Owner Name]';
  const phone = cfg.contactNumber || '+91 98765 43210';
  const whatsappNumber = cfg.whatsappNumber || '919876543210';
  const email = cfg.email || 'care@pillcaremedical.com';
  const mapEmbedUrl = cfg.googleMaps?.embedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.856!2d72.83!3d18.94!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU2JzI0LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin';
  const directionsUrl = cfg.googleMaps?.directionsUrl || 'https://maps.google.com/?q=Pillcare+Medical+Store';
  const addressLine = `${cfg.address?.line1 || 'Shop No. 12, Healthcare Commercial Complex'}, ${cfg.address?.line2 || 'Opposite City Civil Hospital'}, ${cfg.address?.city || 'Mumbai'}, ${cfg.address?.state || 'Maharashtra'} - ${cfg.address?.pincode || '400001'}`;
  const hoursWeekdays = cfg.businessHours?.weekdays || 'Monday - Saturday: 8:00 AM - 10:00 PM';
  const hoursSunday = cfg.businessHours?.sunday || 'Sunday: 9:00 AM - 2:00 PM';

  // Contact Form State
  const [name, setName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [subject, setSubject] = useState('Medicine Availability');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text, ref }

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent('Hello Pillcare Medical, I would like to inquire regarding medicine availability.');
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || name.trim().length < 2) {
      setStatus({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    const digitsOnly = phoneInput.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setStatus({ type: 'error', text: 'Please enter a valid contact phone number (10-15 digits).' });
      return;
    }

    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Please enter your enquiry message.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneInput.trim(),
          email: emailInput.trim() || null,
          subject,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact message');
      }

      setStatus({
        type: 'success',
        text: 'Thank you for reaching out to Pillcare Medical! Your message has been received.',
        ref: data.referenceCode
      });

      setName('');
      setPhoneInput('');
      setEmailInput('');
      setMessage('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'py-12 bg-slate-50/60' },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12' },
      // Page Heading
      React.createElement('div', { className: 'text-center max-w-3xl mx-auto space-y-3' },
        React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider' },
          React.createElement(Icon, { name: 'mapPin', className: 'w-3.5 h-3.5' }),
          'Visit Our Pharmacy'
        ),
        React.createElement('h1', { className: 'font-heading text-3xl sm:text-4xl font-extrabold text-slate-900' },
          'Contact Pillcare Medical'
        ),
        React.createElement('p', { className: 'text-slate-600 text-sm sm:text-base' },
          'Have questions regarding medicine availability, prescription verification, or health products? Our pharmacy staff is here to assist.'
        )
      ),

      // Two Column Layout: Store Info & Maps vs Contact Enquiry Form
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' },
        // LEFT: Store Details, WhatsApp, and Google Maps Preview
        React.createElement('div', { className: 'lg:col-span-5 space-y-6' },
          // Store Info Card
          React.createElement('div', { className: 'bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6' },
            React.createElement('div', { className: 'flex items-center justify-between pb-4 border-b border-slate-100' },
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-heading font-bold text-slate-900 text-lg' }, 'Store Information'),
                React.createElement('p', { className: 'text-xs text-slate-500' }, 'Official Pharmacy Outlet')
              ),
              React.createElement('span', { className: 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200' },
                'Open for Assistance'
              )
            ),

            // Store Attributes
            React.createElement('div', { className: 'space-y-4 text-sm' },
              // Pharmacist / Owner Name
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5' },
                  React.createElement(Icon, { name: 'user', className: 'w-4 h-4' })
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider block' }, 'Supervising Pharmacist / Owner'),
                  React.createElement('span', { className: 'text-slate-800 font-medium' }, ownerName)
                )
              ),

              // Phone
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5' },
                  React.createElement(Icon, { name: 'phone', className: 'w-4 h-4' })
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider block' }, 'Telephone / Counter Helpline'),
                  React.createElement('a', {
                    href: `tel:${phone.replace(/\s+/g, '')}`,
                    className: 'text-emerald-700 font-semibold hover:underline'
                  }, phone)
                )
              ),

              // Email
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5' },
                  React.createElement(Icon, { name: 'mail', className: 'w-4 h-4' })
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider block' }, 'Email Address'),
                  React.createElement('a', {
                    href: `mailto:${email}`,
                    className: 'text-slate-700 hover:text-emerald-700 font-medium'
                  }, email)
                )
              ),

              // Full Address
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5' },
                  React.createElement(Icon, { name: 'mapPin', className: 'w-4 h-4' })
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider block' }, 'Medical Store Address'),
                  React.createElement('span', { className: 'text-slate-700 leading-relaxed block' }, addressLine)
                )
              ),

              // Business Hours
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5' },
                  React.createElement(Icon, { name: 'clock', className: 'w-4 h-4' })
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-xs font-semibold text-slate-400 uppercase tracking-wider block' }, 'Operating Schedule'),
                  React.createElement('span', { className: 'text-slate-700 font-medium block' }, hoursWeekdays),
                  React.createElement('span', { className: 'text-slate-500 text-xs block' }, hoursSunday)
                )
              )
            ),

            // WhatsApp Quick Action Button
            React.createElement('div', { className: 'pt-2' },
              React.createElement(Button, {
                variant: 'whatsapp',
                size: 'lg',
                onClick: handleWhatsAppClick,
                icon: 'whatsapp',
                className: 'w-full shadow-emerald-600/10'
              }, 'Chat with Store on WhatsApp')
            )
          ),

          // Google Maps Interactive Integration Card
          React.createElement('div', { className: 'bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', { className: 'flex items-center gap-2 font-heading font-bold text-slate-900 text-sm' },
                React.createElement(Icon, { name: 'mapPin', className: 'w-4 h-4 text-emerald-600' }),
                'Store Location on Google Maps'
              ),
              React.createElement('a', {
                href: directionsUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800'
              },
                'Get Directions',
                React.createElement(Icon, { name: 'externalLink', className: 'w-3 h-3' })
              )
            ),

            // Map Embed Frame
            React.createElement('div', { className: 'w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative' },
              React.createElement('iframe', {
                title: 'Pillcare Medical Location',
                src: mapEmbedUrl,
                className: 'w-full h-full border-0',
                loading: 'lazy',
                referrerPolicy: 'no-referrer-when-downgrade'
              })
            ),

            // Directions CTA button
            React.createElement('a', {
              href: directionsUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors'
            },
              React.createElement(Icon, { name: 'mapPin', className: 'w-4 h-4 text-emerald-600' }),
              'Open in Google Maps / Get Route'
            )
          )
        ),

        // RIGHT: Customer Contact & Enquiry Form
        React.createElement('div', { className: 'lg:col-span-7' },
          React.createElement('div', { className: 'bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-heading font-bold text-slate-900 text-xl' }, 'Send Medicine Enquiry / Message'),
              React.createElement('p', { className: 'text-xs text-slate-500 mt-1' },
                'Leave your details and enquiry below. Our retail counter team will respond with availability and advice.'
              )
            ),

            // Status message
            status && (
              status.type === 'success' ? (
                React.createElement('div', { className: 'p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2' },
                  React.createElement('div', { className: 'flex items-center gap-2 text-emerald-900 font-semibold text-sm' },
                    React.createElement(Icon, { name: 'check', className: 'w-5 h-5 text-emerald-600' }),
                    'Enquiry Sent Successfully!'
                  ),
                  React.createElement('p', { className: 'text-xs text-emerald-800' }, status.text),
                  status.ref && React.createElement('div', { className: 'text-xs font-mono font-bold text-emerald-900 pt-1' },
                    `Reference ID: ${status.ref}`
                  )
                )
              ) : (
                React.createElement(Alert, {
                  type: 'error',
                  message: status.text,
                  onClose: () => setStatus(null)
                })
              )
            ),

            // Form
            React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
              // Name
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' },
                  'Your Full Name ',
                  React.createElement('span', { className: 'text-rose-500' }, '*')
                ),
                React.createElement('input', {
                  type: 'text',
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  placeholder: 'e.g. Ramesh Kumar',
                  required: true,
                  className: 'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                })
              ),

              // Phone & Email Row
              React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' },
                    'Phone Number ',
                    React.createElement('span', { className: 'text-rose-500' }, '*')
                  ),
                  React.createElement('input', {
                    type: 'tel',
                    value: phoneInput,
                    onChange: (e) => setPhoneInput(e.target.value),
                    placeholder: 'e.g. 9876543210',
                    required: true,
                    className: 'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' },
                    'Email Address ',
                    React.createElement('span', { className: 'text-slate-400 font-normal lowercase' }, '(optional)')
                  ),
                  React.createElement('input', {
                    type: 'email',
                    value: emailInput,
                    onChange: (e) => setEmailInput(e.target.value),
                    placeholder: 'ramesh@example.com',
                    className: 'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  })
                )
              ),

              // Enquiry Subject
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' }, 'Enquiry Category'),
                React.createElement('select', {
                  value: subject,
                  onChange: (e) => setSubject(e.target.value),
                  className: 'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                },
                  React.createElement('option', { value: 'Medicine Availability' }, 'Medicine Availability Enquiry'),
                  React.createElement('option', { value: 'Prescription Refill' }, 'Prescription Order & Refill'),
                  React.createElement('option', { value: 'Healthcare Equipment' }, 'Healthcare Device / Equipment Inquiry'),
                  React.createElement('option', { value: 'Store Visit / Timings' }, 'Store Location & Timings'),
                  React.createElement('option', { value: 'General Support' }, 'General Customer Assistance')
                )
              ),

              // Message
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1' },
                  'Enquiry Details / Message ',
                  React.createElement('span', { className: 'text-rose-500' }, '*')
                ),
                React.createElement('textarea', {
                  rows: 4,
                  value: message,
                  onChange: (e) => setMessage(e.target.value),
                  placeholder: 'Please describe the medicine name, dosage, or query you have...',
                  required: true,
                  className: 'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                })
              ),

              // Privacy & Medical Disclaimer
              React.createElement('p', { className: 'text-[11px] text-slate-500 leading-relaxed' },
                'By sending this message, you consent to Pillcare Medical contacting you regarding your healthcare enquiry. Information is handled confidentially and never shared with third parties.'
              ),

              // Submit Button
              React.createElement(Button, {
                type: 'submit',
                variant: 'primary',
                size: 'lg',
                loading: loading,
                icon: 'phone',
                className: 'w-full shadow-emerald-700/20'
              }, 'Submit Enquiry')
            )
          )
        )
      )
    )
  );
}
