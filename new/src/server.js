// server.js - High-performance Node.js HTTP Server & REST API for Pillcare Medical
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { db } = require('./db');
const { verifyPasswordSync, createSession, verifySession, invalidateSession } = require('./auth');
const {
  sanitizeText,
  isValidPhone,
  isValidEmail,
  generateReferenceCode,
  validatePrescriptionUpload,
  validateEnquiryPayload
} = require('./validator');

const PORT = parseInt(process.env.PORT || '3000', 10);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

// Parse JSON request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      // Limit to 15MB to allow base64 uploaded prescriptions
      if (raw.length > 15 * 1024 * 1024) {
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Send standard JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Extract bearer token from Authorization header or cookie
function getAuthToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  // Check cookie
  const cookie = req.headers['cookie'];
  if (cookie) {
    const match = cookie.match(/pcm_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

// Require admin authentication middleware
function requireAdmin(req, res) {
  const token = getAuthToken(req);
  const session = verifySession(token);
  if (!session) {
    sendJson(res, 401, { error: 'Unauthorized. Admin session required.' });
    return null;
  }
  return session;
}

// Get active store configuration
function getStoreConfig() {
  const row = db.prepare('SELECT value FROM store_settings WHERE key = ?').get('store_config');
  if (row) {
    try {
      return JSON.parse(row.value);
    } catch {
      // fallback
    }
  }
  const configPath = path.join(__dirname, '..', 'config', 'store.config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return {};
}

// HTTP request handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Add CORS headers for flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // -------------------------------------------------------------
    // API ROUTES
    // -------------------------------------------------------------

    // GET /api/config - Public store configuration
    if (method === 'GET' && pathname === '/api/config') {
      const config = getStoreConfig();
      return sendJson(res, 200, config);
    }

    // PUT /api/config - Admin update store configuration
    if (method === 'PUT' && pathname === '/api/config') {
      const session = requireAdmin(req, res);
      if (!session) return;

      const body = await parseRequestBody(req);
      db.prepare(`
        INSERT INTO store_settings (key, value, updatedAt)
        VALUES ('store_config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP
      `).run(JSON.stringify(body));

      return sendJson(res, 200, { success: true, message: 'Store configuration updated successfully.' });
    }

    // POST /api/admin/login
    if (method === 'POST' && pathname === '/api/admin/login') {
      const body = await parseRequestBody(req);
      const { username, password } = body;

      if (!username || !password) {
        return sendJson(res, 400, { error: 'Username and password are required.' });
      }

      const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
      if (!user || !verifyPasswordSync(password, user.passwordHash, user.salt)) {
        return sendJson(res, 401, { error: 'Invalid credentials. Please verify username and password.' });
      }

      const session = createSession(user.username, user.role);
      return sendJson(res, 200, {
        success: true,
        token: session.token,
        expiresAt: session.expiresAt,
        user: { username: user.username, role: user.role }
      });
    }

    // POST /api/admin/logout
    if (method === 'POST' && pathname === '/api/admin/logout') {
      const token = getAuthToken(req);
      if (token) invalidateSession(token);
      return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
    }

    // GET /api/admin/stats
    if (method === 'GET' && pathname === '/api/admin/stats') {
      const session = requireAdmin(req, res);
      if (!session) return;

      const totalEnquiries = db.prepare('SELECT COUNT(*) as count FROM enquiries').get().count;
      const pendingEnquiries = db.prepare("SELECT COUNT(*) as count FROM enquiries WHERE status = 'Pending'").get().count;
      const underReviewEnquiries = db.prepare("SELECT COUNT(*) as count FROM enquiries WHERE status = 'Under Review'").get().count;
      const confirmedEnquiries = db.prepare("SELECT COUNT(*) as count FROM enquiries WHERE status = 'Confirmed'").get().count;
      const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
      const rxProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE prescriptionRequired = 1').get().count;
      const lowStockProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE stockStatus != 'In Stock'").get().count;

      return sendJson(res, 200, {
        totalEnquiries,
        pendingEnquiries,
        underReviewEnquiries,
        confirmedEnquiries,
        totalProducts,
        rxProducts,
        lowStockProducts
      });
    }

    // GET /api/products - Catalogue listing with search and filters
    if (method === 'GET' && pathname === '/api/products') {
      const search = parsedUrl.searchParams.get('search') || '';
      const category = parsedUrl.searchParams.get('category') || '';
      const rxOnly = parsedUrl.searchParams.get('prescriptionRequired');
      const featured = parsedUrl.searchParams.get('isFeatured');

      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (rxOnly !== null && rxOnly !== undefined && rxOnly !== '') {
        query += ' AND prescriptionRequired = ?';
        params.push(rxOnly === 'true' || rxOnly === '1' ? 1 : 0);
      }

      if (featured === 'true' || featured === '1') {
        query += ' AND isFeatured = 1';
      }

      if (search.trim()) {
        query += ' AND (name LIKE ? OR brand LIKE ? OR composition LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      query += ' ORDER BY isFeatured DESC, name ASC';

      const products = db.prepare(query).all(...params);
      return sendJson(res, 200, products);
    }

    // GET /api/products/:id
    const singleProductMatch = pathname.match(/^\/api\/products\/(\d+)$/);
    if (method === 'GET' && singleProductMatch) {
      const id = parseInt(singleProductMatch[1], 10);
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!product) {
        return sendJson(res, 404, { error: 'Product not found.' });
      }
      return sendJson(res, 200, product);
    }

    // POST /api/products - Admin add new product
    if (method === 'POST' && pathname === '/api/products') {
      const session = requireAdmin(req, res);
      if (!session) return;

      const body = await parseRequestBody(req);
      if (!body.name || !body.brand || !body.category || body.price === undefined) {
        return sendJson(res, 400, { error: 'Name, brand, category, and price are required fields.' });
      }

      const insert = db.prepare(`
        INSERT INTO products (
          name, brand, category, composition, strength, price,
          stockStatus, prescriptionRequired, packSize, description,
          dosageInstructions, isFeatured, imageUrl
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      const result = insert.run(
        sanitizeText(body.name),
        sanitizeText(body.brand),
        sanitizeText(body.category),
        sanitizeText(body.composition || ''),
        sanitizeText(body.strength || ''),
        parseFloat(body.price) || 0,
        body.stockStatus || 'In Stock',
        body.prescriptionRequired ? 1 : 0,
        sanitizeText(body.packSize || ''),
        sanitizeText(body.description || ''),
        sanitizeText(body.dosageInstructions || ''),
        body.isFeatured ? 1 : 0,
        sanitizeText(body.imageUrl || '')
      );

      return sendJson(res, 201, {
        success: true,
        productId: Number(result.lastInsertRowid),
        message: 'Product added successfully.'
      });
    }

    // PUT /api/products/:id - Admin update product
    if (method === 'PUT' && singleProductMatch) {
      const session = requireAdmin(req, res);
      if (!session) return;

      const id = parseInt(singleProductMatch[1], 10);
      const body = await parseRequestBody(req);

      const update = db.prepare(`
        UPDATE products SET
          name = ?, brand = ?, category = ?, composition = ?,
          strength = ?, price = ?, stockStatus = ?, prescriptionRequired = ?,
          packSize = ?, description = ?, dosageInstructions = ?,
          isFeatured = ?, imageUrl = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = update.run(
        sanitizeText(body.name),
        sanitizeText(body.brand),
        sanitizeText(body.category),
        sanitizeText(body.composition || ''),
        sanitizeText(body.strength || ''),
        parseFloat(body.price) || 0,
        body.stockStatus || 'In Stock',
        body.prescriptionRequired ? 1 : 0,
        sanitizeText(body.packSize || ''),
        sanitizeText(body.description || ''),
        sanitizeText(body.dosageInstructions || ''),
        body.isFeatured ? 1 : 0,
        sanitizeText(body.imageUrl || ''),
        id
      );

      if (result.changes === 0) {
        return sendJson(res, 404, { error: 'Product not found.' });
      }

      return sendJson(res, 200, { success: true, message: 'Product updated successfully.' });
    }

    // DELETE /api/products/:id - Admin delete product
    if (method === 'DELETE' && singleProductMatch) {
      const session = requireAdmin(req, res);
      if (!session) return;

      const id = parseInt(singleProductMatch[1], 10);
      const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);

      if (result.changes === 0) {
        return sendJson(res, 404, { error: 'Product not found.' });
      }

      return sendJson(res, 200, { success: true, message: 'Product removed from catalogue.' });
    }

    // POST /api/enquiries - Customer submit medicine enquiry
    if (method === 'POST' && pathname === '/api/enquiries') {
      const body = await parseRequestBody(req);
      const validation = validateEnquiryPayload(body);

      if (!validation.isValid) {
        return sendJson(res, 400, {
          error: 'Validation failed',
          details: validation.errors
        });
      }

      let prescriptionFilePath = null;

      // Handle uploaded prescription if provided as base64
      if (body.prescriptionBase64 && body.prescriptionFileName) {
        const uploadValidation = validatePrescriptionUpload(
          body.prescriptionFileName,
          Math.floor((body.prescriptionBase64.length * 3) / 4)
        );

        if (!uploadValidation.valid) {
          return sendJson(res, 400, { error: uploadValidation.error });
        }

        const ext = path.extname(body.prescriptionFileName).toLowerCase();
        const safeBaseName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const targetPath = path.join(UPLOADS_DIR, safeBaseName);

        // Strip data URI header if present
        const base64Data = body.prescriptionBase64.replace(/^data:[^;]+;base64,/, '');
        fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
        prescriptionFilePath = safeBaseName;
      }

      const referenceCode = generateReferenceCode();
      const insert = db.prepare(`
        INSERT INTO enquiries (
          referenceCode, customerName, customerPhone, customerEmail,
          preference, notes, itemsJson, prescriptionFile, status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, 'Pending'
        )
      `);

      insert.run(
        referenceCode,
        sanitizeText(body.customerName),
        sanitizeText(body.customerPhone),
        sanitizeText(body.customerEmail || ''),
        sanitizeText(body.preference || 'Counter Pickup'),
        sanitizeText(body.notes || ''),
        JSON.stringify(body.items),
        prescriptionFilePath
      );

      return sendJson(res, 201, {
        success: true,
        referenceCode,
        status: 'Pending',
        message: 'Your medicine enquiry has been submitted. Our pharmacist will review availability and contact you shortly.'
      });
    }

    // GET /api/enquiries - Admin list customer enquiries
    if (method === 'GET' && pathname === '/api/enquiries') {
      const session = requireAdmin(req, res);
      if (!session) return;

      const statusFilter = parsedUrl.searchParams.get('status');
      let query = 'SELECT * FROM enquiries';
      const params = [];

      if (statusFilter && statusFilter !== 'All') {
        query += ' WHERE status = ?';
        params.push(statusFilter);
      }

      query += ' ORDER BY createdAt DESC';
      const enquiries = db.prepare(query).all(...params);

      // Parse itemsJson for each record
      const formatted = enquiries.map(e => ({
        ...e,
        items: JSON.parse(e.itemsJson || '[]')
      }));

      return sendJson(res, 200, formatted);
    }

    // PATCH /api/enquiries/:id/status - Admin update enquiry status
    const enquiryStatusMatch = pathname.match(/^\/api\/enquiries\/(\d+)\/status$/);
    if (method === 'PATCH' && enquiryStatusMatch) {
      const session = requireAdmin(req, res);
      if (!session) return;

      const id = parseInt(enquiryStatusMatch[1], 10);
      const body = await parseRequestBody(req);
      const { status, adminNotes } = body;

      const validStatuses = ['Pending', 'Under Review', 'Confirmed', 'Rejected', 'Completed'];
      if (!validStatuses.includes(status)) {
        return sendJson(res, 400, { error: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
      }

      const update = db.prepare(`
        UPDATE enquiries SET
          status = ?,
          adminNotes = COALESCE(?, adminNotes),
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = update.run(status, adminNotes ? sanitizeText(adminNotes) : null, id);
      if (result.changes === 0) {
        return sendJson(res, 404, { error: 'Enquiry record not found.' });
      }

      return sendJson(res, 200, { success: true, message: `Enquiry status updated to '${status}'.` });
    }

    // GET /api/uploads/:filename - Protected prescription download for authenticated admin only
    const uploadFileMatch = pathname.match(/^\/api\/uploads\/([^/]+)$/);
    if (method === 'GET' && uploadFileMatch) {
      const session = requireAdmin(req, res);
      if (!session) return;

      const filename = path.basename(uploadFileMatch[1]);
      const filePath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { error: 'Prescription document not found.' });
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // POST /api/contact - General contact form enquiry
    if (method === 'POST' && pathname === '/api/contact') {
      const body = await parseRequestBody(req);
      if (!body.name || !isValidPhone(body.phone) || !body.message) {
        return sendJson(res, 400, { error: 'Name, valid phone number, and message are required.' });
      }

      // Log contact enquiry as an audit item or enquiry record
      const referenceCode = generateReferenceCode();
      db.prepare(`
        INSERT INTO enquiries (
          referenceCode, customerName, customerPhone, customerEmail,
          preference, notes, itemsJson, status
        ) VALUES (
          ?, ?, ?, ?, 'Contact Enquiry', ?, '[]', 'Pending'
        )
      `).run(
        referenceCode,
        sanitizeText(body.name),
        sanitizeText(body.phone),
        sanitizeText(body.email || ''),
        `[Subject: ${sanitizeText(body.subject || 'General Enquiry')}] ${sanitizeText(body.message)}`
      );

      return sendJson(res, 200, {
        success: true,
        referenceCode,
        message: 'Thank you! Your message has been received by Pillcare Medical. We will respond promptly.'
      });
    }

    // -------------------------------------------------------------
    // STATIC FILE SERVING
    // -------------------------------------------------------------
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access Denied');
      return;
    }

    // Check if file exists, if not and request is for an HTML/route view, serve index.html (SPA routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const indexFallback = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexFallback)) {
        filePath = indexFallback;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[SERVER ERROR]', err);
    sendJson(res, 500, { error: 'Internal server error', message: err.message });
  }
});

// Export server instance for testing
module.exports = server;

// Start server if executed directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`
=====================================================
  PILLCARE MEDICAL PHARMACY PLATFORM
=====================================================
  Server running at: http://localhost:${PORT}
  Environment:       ${process.env.NODE_ENV || 'development'}
  Admin Login:       http://localhost:${PORT}/#admin
  Default Admin:     admin / pillcare2026!
=====================================================
    `);
  });
}
