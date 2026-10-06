# PILLCARE MEDICAL — Pharmacy & Healthcare Web Platform

A modern, responsive, and compliant medical store and pharmacy web application built with **React 18**, **Tailwind CSS**, and a zero-dependency **Node.js + SQLite** backend.

---

## 1. Project Overview
- **Website Name**: Pillcare Medical
- **Business Type**: Medical Store / Retail Pharmacy & Healthcare Provider
- **Purpose**: Showcase verified medicines and healthcare equipment, provide live inventory and availability search, enable compliant customer order enquiries with doctor prescription upload, provide store owner / pharmacy helpline contact, and direct customers to the retail counter using Google Maps.
- **Theme & Aesthetics**: Professional healthcare theme with Emerald Green, Medical Sky Blue, and Crisp White, rounded cards, accessible contrast, and smooth micro-interactions.

---

## 2. Key Features

### 🌟 Page 1: Home
- Sticky responsive navigation bar with Pillcare Medical custom dual-tone logo (medical cross + capsule pill).
- Hero section with headline: *"Your Trusted Partner in Healthcare"* and action CTAs (*View Medicines*, *Order Enquiry*, *Contact Us*).
- **About Pillcare Medical**: Background on ethical pharmacy dispensing and licensed retail chemist standards.
- **Services Section**: Medicine availability, medicine enquiry, pharmacy support, healthcare products, and customer assistance.
- **Featured Medicine Categories**: Tablets & Capsules, Syrups & Liquids, Healthcare Products, Vitamins & Supplements, Other Approved Products.
- **Why Choose Us**: Convenient access, customer support, 100% verified distributor sourcing, easy enquiry process.
- **Store Location Preview**: Interactive Google Maps preview with *Get Directions* action.
- **Professional Healthcare Footer**: Opening hours, telephone helpline, emergency casualty disclaimer, privacy notice, and staff login.

### 💊 Page 2: Medicines & Services
- **Real-Time Catalogue Search**: Instant live search by medicine brand, salt name, or active composition.
- **Category Filter Chips**: Filter seamlessly across all 5 major pharmacy categories.
- **Prescription & Stock Filter**: Toggle between *All Formulations*, *OTC Approved Only*, and *Rx Prescription Required*.
- **Comprehensive Product Cards**: Displays product photo, medicine name, manufacturer/brand, active composition, strength, statutory MRP, stock availability status, and prescription requirement badge.
- **Product Specification Modal**: In-depth medical overview, dosage format, usage guidelines, and quantity selector.
- **Empty & Loading States**: Elegant skeleton loaders and helpful reset buttons when no medicines match query.

### 📞 Page 3: Contact Us
- **Store Contact Information**: Live display of Store Name, Supervising Pharmacist / Owner Name, Helpline Number, Email, Physical Address, and Operating Schedule.
- **Direct WhatsApp Action**: One-click *"Chat with Store on WhatsApp"* button that opens a pre-composed message directly to the counter.
- **Google Maps Integration**: Responsive interactive embedded Google Map with one-click *"Open in Google Maps / Get Route"* directions link.
- **Customer Enquiry Form**: Validated submission form (Full Name, Phone Number, Optional Email, Enquiry Category, and Message) with instant confirmation and reference tracking.

### 📋 Medicine Order & Enquiry System
- **Compliant Workflow**: Built specifically for pharmacy regulations. Clearly separates an enquiry / verification flow from an unregulated instant checkout.
- **Enquiry Basket**: Persistent client-side cart allowing customers to select multiple medicines and specify quantities.
- **Doctor Prescription Upload**: Mandatory secure prescription upload (.pdf, .jpg, .png; max 5MB) whenever prescription-controlled medicines (Schedule H/Rx) are selected.
- **Unique Reference Tracking**: Submissions generate a unique reference code (`PCM-2026-XXXX`) for order pickup identification at the counter.

### 🔒 Admin Dashboard (`#admin`)
- **Secure Authentication**: PBKDF2 password hashing with cryptographically random salt and time-limited session tokens.
- **Demo Credentials**:
  - **Username**: `admin`
  - **Password**: `pillcare2026!`
- **Dashboard Overview**: Metrics for Total Enquiries, Pending Review, Confirmed Enquiries, and Total Catalogue Medicines.
- **Enquiry Manager**: View customer details, requested medicines, and securely download/view uploaded prescription files. Update status across `Pending`, `Under Review`, `Confirmed`, `Rejected`, and `Completed`.
- **Catalogue Manager**: Add new medicines, edit existing products, update stock availability, or delete discontinued medicines.
- **Live Store Settings Editor**: Edit Store Name, Owner Name, Contact Phone, WhatsApp number, Address, Business Hours, and Google Maps embed URL directly from the browser without editing code files!

---

## 3. Quick Start & Running Locally

### Option A: 1-Click Launch (Windows)
Double click `run.bat` in the project root:
```cmd
run.bat
```

### Option B: Using Node.js or `agy-node`
Open a terminal in `d:\new` and execute:
```cmd
node src/server.js
```
*(or if using the pre-configured Node runtime)*:
```cmd
agy-node src/server.js
```

Then open your browser to:
- **Public Website**: [http://localhost:3000](http://localhost:3000)
- **Staff / Admin Portal**: [http://localhost:3000/#admin](http://localhost:3000/#admin)

---

## 4. Running Automated Tests

The application comes with an automated unit test suite covering product search, phone validation, reference code generation, prescription file security checks, and password hashing:

```cmd
node --test tests/api.test.js
```
*(or `agy-node --test tests/api.test.js`)*

---

## 5. Configuration & Replacing Sample Data

### Central Store Configuration
All store placeholders are maintained in [config/store.config.json](file:///d:/new/config/store.config.json) and in the SQLite database:
```json
{
  "storeName": "Pillcare Medical",
  "ownerName": "[Pharmacist / Store Owner Name]",
  "registrationNumber": "DL-PHARM-2026-9812",
  "contactNumber": "+91 98765 43210",
  "whatsappNumber": "919876543210",
  "email": "care@pillcaremedical.com",
  "address": {
    "line1": "Shop No. 12, Healthcare Commercial Complex",
    "line2": "Opposite City Civil Hospital, Main Medical Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "businessHours": {
    "weekdays": "Monday - Saturday: 8:00 AM - 10:00 PM",
    "sunday": "Sunday: 9:00 AM - 2:00 PM"
  },
  "googleMaps": {
    "embedUrl": "https://www.google.com/maps/embed?...",
    "directionsUrl": "https://maps.google.com/?q=Pillcare+Medical+Store"
  }
}
```

> [!TIP]
> You can also update these placeholders live at any time from the **Admin Portal -> Store Information & Maps** tab!

### Replacing Catalogue Data
Sample medicines are defined in [data/medicines.seed.json](file:///d:/new/data/medicines.seed.json). You can edit this JSON file before starting, or add/update products directly via the **Admin Portal -> Catalogue Products** interface.

---

## 6. Pre-Production & Compliance Checklist Before Going Live

Before taking this website live for public customer transactions:
1. **Pharmacy Licensing & Statutory Details**:
   - Update the actual Drug License (D.L.) numbers (e.g. Form 20 / 21) in the footer and configuration.
   - Enter the verified Registered Pharmacist (R.Ph.) registration number.
2. **Admin Password**:
   - Change the default password (`pillcare2026!`) in the database or via environment variable `ADMIN_PASSWORD`.
3. **Domain & SSL/TLS**:
   - Deploy behind HTTPS (e.g. Let's Encrypt / Cloudflare) to ensure all uploaded prescription documents and patient contact numbers are encrypted in transit.
4. **Online Payment Gateway & Commercial Selling**:
   - Direct payment gateway integration (e.g. Razorpay / Stripe) should be enabled only after verifying that state and federal e-pharmacy regulations, retail prescription collection rules, and GST billing systems are established.
