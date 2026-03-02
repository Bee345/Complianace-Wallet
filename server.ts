import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { AutomationService } from "./src/services/automationService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("compliance_wallet.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_photo_url TEXT,
    role TEXT DEFAULT 'VENDOR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    cac_registration_number TEXT,
    registration_status TEXT DEFAULT 'DRAFT',
    lga_id TEXT NOT NULL,
    address TEXT,
    business_type TEXT,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tax_records (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    date DATETIME NOT NULL,
    turnover_amount REAL NOT NULL,
    turnover_currency TEXT DEFAULT 'NGN',
    calculated_tax_amount REAL NOT NULL,
    calculated_tax_currency TEXT DEFAULT 'NGN',
    lga_band_id TEXT,
    is_synced INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS levy_records (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    date DATETIME NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'NGN',
    lga_id TEXT NOT NULL,
    category TEXT,
    receipt_photo_url TEXT,
    is_synced INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS health_permits (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    permit_number TEXT,
    issue_date DATETIME,
    expiry_date DATETIME,
    photo_url TEXT,
    status TEXT DEFAULT 'COMPLIANT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id)
  );
`);

// RBAC Middleware
const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.headers["x-user-role"] || "VENDOR"; // Default to VENDOR for demo
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "connected" });
  });

  // Admin: Vendor List
  app.get("/api/admin/vendors", authorize(["ADMIN"]), (req, res) => {
    const vendors = db.prepare(`
      SELECT u.*, b.name as business_name, b.registration_status 
      FROM users u 
      LEFT JOIN businesses b ON u.id = b.vendor_id
      WHERE u.role = 'VENDOR'
    `).all();
    res.json(vendors);
  });

  // Vendor Management
  app.get("/api/vendor/:id", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), (req, res) => {
    const { id } = req.params;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const business = db.prepare("SELECT * FROM businesses WHERE vendor_id = ?").get(id);
    const healthPermit = db.prepare("SELECT * FROM health_permits WHERE vendor_id = ?").get(id);
    
    res.json({ user, business, healthPermit });
  });

  app.post("/api/vendor", authorize(["VENDOR", "ADMIN"]), (req, res) => {
    const { id, phoneNumber, name, role, profilePhotoUrl } = req.body;
    db.prepare("INSERT OR REPLACE INTO users (id, phone_number, name, role, profile_photo_url) VALUES (?, ?, ?, ?, ?)")
      .run(id, phoneNumber, name, role, profilePhotoUrl);
    
    // Trigger Automation: Vendor Onboarding
    AutomationService.dispatch('vendor.created', { id, phoneNumber, name, role });
    
    res.json({ status: "ok" });
  });

  // Tax Management
  app.post("/api/tax", authorize(["VENDOR"]), (req, res) => {
    const { id, vendorId, date, turnover, calculatedTax, lgaBandId } = req.body;
    db.prepare(`
      INSERT INTO tax_records (id, vendor_id, date, turnover_amount, calculated_tax_amount, lga_band_id, is_synced)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, vendorId, date, turnover.amount, calculatedTax.amount, lgaBandId);

    // Trigger Automation: Tax Logged
    AutomationService.dispatch('tax.logged', { vendorId, amount: calculatedTax.amount, date });

    res.json({ status: "ok" });
  });

  app.get("/api/tax/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), (req, res) => {
    const { vendorId } = req.params;
    const records = db.prepare("SELECT * FROM tax_records WHERE vendor_id = ? ORDER BY date DESC").all(vendorId);
    res.json(records);
  });

  // Levy Management
  app.post("/api/levy", authorize(["VENDOR"]), (req, res) => {
    const { id, vendorId, date, amount, lgaId, category, receiptPhotoUrl } = req.body;
    db.prepare(`
      INSERT INTO levy_records (id, vendor_id, date, amount, lga_id, category, receipt_photo_url, is_synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, vendorId, date, amount.amount, lgaId, category, receiptPhotoUrl);

    // Trigger Automation: High Value Levy Escalation
    if (amount.amount > 2000) {
      AutomationService.dispatch('levy.high_value_alert', { vendorId, amount: amount.amount, category, lgaId });
    }

    res.json({ status: "ok" });
  });

  app.get("/api/levy/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), (req, res) => {
    const { vendorId } = req.params;
    const records = db.prepare("SELECT * FROM levy_records WHERE vendor_id = ? ORDER BY date DESC").all(vendorId);
    res.json(records);
  });

  // Health Permit Management
  app.post("/api/health-permit", authorize(["VENDOR", "ADMIN"]), (req, res) => {
    const { id, vendorId, permitNumber, issueDate, expiryDate, photoUrl, status } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO health_permits (id, vendor_id, permit_number, issue_date, expiry_date, photo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, vendorId, permitNumber, issueDate, expiryDate, photoUrl, status);

    // Trigger Automation: Permit Updated
    AutomationService.dispatch('permit.updated', { vendorId, permitNumber, expiryDate, status });

    res.json({ status: "ok" });
  });

  app.get("/api/health-permit/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), (req, res) => {
    const { vendorId } = req.params;
    const permit = db.prepare("SELECT * FROM health_permits WHERE vendor_id = ?").get(vendorId);
    if (!permit) return res.status(404).json({ error: "No permit found" });
    res.json(permit);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Seed Demo Data
  const demoVendor = {
    id: 'vendor-123',
    phoneNumber: '+2348012345678',
    name: 'Amara the Food Seller',
    role: 'VENDOR'
  };
  db.prepare("INSERT OR IGNORE INTO users (id, phone_number, name, role) VALUES (?, ?, ?, ?)")
    .run(demoVendor.id, demoVendor.phoneNumber, demoVendor.name, demoVendor.role);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
