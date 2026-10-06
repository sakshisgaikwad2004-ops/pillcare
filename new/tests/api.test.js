// tests/api.test.js - Automated tests using Node.js native test runner
const test = require('node:test');
const assert = require('node:assert');

const { db } = require('../src/db');
const { hashPasswordSync, verifyPasswordSync, createSession, verifySession, invalidateSession } = require('../src/auth');
const {
  isValidPhone,
  isValidEmail,
  generateReferenceCode,
  validatePrescriptionUpload,
  validateEnquiryPayload
} = require('../src/validator');

test('Product Catalogue & Search Queries', async (t) => {
  await t.test('database has seeded products across required categories', () => {
    const products = db.prepare('SELECT * FROM products').all();
    assert.ok(products.length >= 10, 'Expected at least 10 seeded products');

    const categories = new Set(products.map(p => p.category));
    assert.ok(categories.has('Tablets & Capsules'), 'Should include Tablets & Capsules');
    assert.ok(categories.has('Syrups & Liquids'), 'Should include Syrups & Liquids');
    assert.ok(categories.has('Healthcare Products'), 'Should include Healthcare Products');
    assert.ok(categories.has('Vitamins & Supplements'), 'Should include Vitamins & Supplements');
  });

  await t.test('searches products by name and salt composition', () => {
    const searchTerm = '%Paracetamol%';
    const results = db.prepare('SELECT * FROM products WHERE name LIKE ? OR composition LIKE ?').all(searchTerm, searchTerm);
    assert.ok(results.length > 0, 'Expected to find products containing Paracetamol');
    for (const r of results) {
      const match = r.name.includes('Paracetamol') || r.composition.includes('Paracetamol');
      assert.ok(match, 'Result should match search term');
    }
  });

  await t.test('filters products by prescription requirement', () => {
    const rxItems = db.prepare('SELECT * FROM products WHERE prescriptionRequired = 1').all();
    const otcItems = db.prepare('SELECT * FROM products WHERE prescriptionRequired = 0').all();
    assert.ok(rxItems.length > 0, 'Should have Rx items in catalogue');
    assert.ok(otcItems.length > 0, 'Should have OTC items in catalogue');
  });
});

test('Input Validation & Sanitization', async (t) => {
  await t.test('validates phone numbers correctly', () => {
    assert.strictEqual(isValidPhone('9876543210'), true);
    assert.strictEqual(isValidPhone('+91 98765 43210'), true);
    assert.strictEqual(isValidPhone('123'), false, 'Short number should be invalid');
    assert.strictEqual(isValidPhone('abcdefghij'), false, 'Alphabetic input should be invalid');
    assert.strictEqual(isValidPhone(null), false);
  });

  await t.test('validates email addresses correctly', () => {
    assert.strictEqual(isValidEmail('patient@example.com'), true);
    assert.strictEqual(isValidEmail(''), true, 'Optional empty email is permitted');
    assert.strictEqual(isValidEmail('invalid-email'), false);
  });

  await t.test('validates complete customer enquiry payload', () => {
    const validPayload = {
      customerName: 'Anil Deshmukh',
      customerPhone: '9822012345',
      customerEmail: 'anil@example.com',
      items: [{ productId: 1, quantity: 2 }]
    };
    const res1 = validateEnquiryPayload(validPayload);
    assert.strictEqual(res1.isValid, true);
    assert.strictEqual(res1.errors.length, 0);

    const invalidPayload = {
      customerName: 'A', // too short
      customerPhone: '123', // invalid phone
      items: [] // empty items
    };
    const res2 = validateEnquiryPayload(invalidPayload);
    assert.strictEqual(res2.isValid, false);
    assert.ok(res2.errors.length >= 2, 'Should detect multiple errors');
  });

  await t.test('generates reference codes with PCM prefix and year', () => {
    const code = generateReferenceCode();
    const currentYear = new Date().getFullYear().toString();
    assert.ok(code.startsWith(`PCM-${currentYear}-`), `Reference code ${code} should start with PCM-YYYY-`);
  });
});

test('Prescription File Upload Security', async (t) => {
  await t.test('accepts valid prescription documents (PDF, JPG, PNG)', () => {
    const validPdf = validatePrescriptionUpload('rx_dr_sharma.pdf', 1024 * 500); // 500KB
    assert.strictEqual(validPdf.valid, true);

    const validJpg = validatePrescriptionUpload('prescription_scan.jpg', 1024 * 1024); // 1MB
    assert.strictEqual(validJpg.valid, true);
  });

  await t.test('rejects unauthorized executable extensions', () => {
    const invalidExe = validatePrescriptionUpload('malicious.exe', 1000);
    assert.strictEqual(invalidExe.valid, false);
    assert.ok(invalidExe.error.includes('Invalid file format'));

    const invalidBat = validatePrescriptionUpload('script.bat', 500);
    assert.strictEqual(invalidBat.valid, false);
  });

  await t.test('rejects files exceeding 5MB limit', () => {
    const oversized = validatePrescriptionUpload('large_scan.pdf', 6 * 1024 * 1024); // 6MB
    assert.strictEqual(oversized.valid, false);
    assert.ok(oversized.error.includes('exceeds the maximum allowed size'));
  });
});

test('Authentication & Session Management', async (t) => {
  await t.test('cryptographically hashes and verifies passwords', () => {
    const password = 'TestSecretPassword!987';
    const { hash, salt } = hashPasswordSync(password);
    assert.ok(hash.length > 32);
    assert.ok(salt.length >= 16);

    const match = verifyPasswordSync(password, hash, salt);
    assert.strictEqual(match, true);

    const wrongMatch = verifyPasswordSync('WrongPassword', hash, salt);
    assert.strictEqual(wrongMatch, false);
  });

  await t.test('creates, verifies, and invalidates session tokens', () => {
    const session = createSession('admin', 'admin');
    assert.ok(session.token);
    assert.ok(session.expiresAt > Date.now());

    const verified = verifySession(session.token);
    assert.strictEqual(verified.username, 'admin');

    invalidateSession(session.token);
    const afterInvalidation = verifySession(session.token);
    assert.strictEqual(afterInvalidation, null);
  });
});

test('Enquiry Status Transitions & Audit', async (t) => {
  await t.test('creates and updates enquiry status in database', () => {
    const refCode = generateReferenceCode();
    db.prepare(`
      INSERT INTO enquiries (referenceCode, customerName, customerPhone, itemsJson, status)
      VALUES (?, 'Test Patient', '9999999999', '[]', 'Pending')
    `).run(refCode);

    const inserted = db.prepare('SELECT * FROM enquiries WHERE referenceCode = ?').get(refCode);
    assert.strictEqual(inserted.status, 'Pending');

    // Update status to Under Review
    db.prepare('UPDATE enquiries SET status = ?, adminNotes = ? WHERE referenceCode = ?')
      .run('Under Review', 'Verified patient prescription', refCode);

    const updated = db.prepare('SELECT * FROM enquiries WHERE referenceCode = ?').get(refCode);
    assert.strictEqual(updated.status, 'Under Review');
    assert.strictEqual(updated.adminNotes, 'Verified patient prescription');
  });
});
