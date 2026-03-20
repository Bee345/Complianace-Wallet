import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import { AutomationService } from "./src/services/automationService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// RBAC Middleware
const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.headers["x-user-role"] as string;
    const userId = req.headers["x-user-id"] as string;

    if (!userRole || !userId) {
      return res.status(401).json({ error: "Authentication required. Missing user headers." });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Access denied. Role '${userRole}' is not authorized for this action.` });
    }

    // Additional check: Vendors can only access their own data
    if (userRole === 'VENDOR' && req.params.userId && req.params.userId !== userId) {
      return res.status(403).json({ error: "Access denied. Vendors can only access their own records." });
    }
    if (userRole === 'VENDOR' && req.params.vendorId && req.params.vendorId !== userId) {
      return res.status(403).json({ error: "Access denied. Vendors can only access their own records." });
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

  // --- AUTH ROUTES ---
  app.post("/api/register", async (req, res) => {
    const { 
      phoneNumber, email, username, firstName, lastName, 
      dob, state, lga, password, role 
    } = req.body;

    try {
      const id = `user-${Date.now()}`;
      const passwordHash = password; 
      const name = `${firstName} ${lastName}`;

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id, 
          phone_number: phoneNumber, 
          email, 
          username, 
          first_name: firstName, 
          last_name: lastName, 
          name, 
          dob, 
          state, 
          lga, 
          password_hash: passwordHash, 
          role
        })
        .select()
        .single();

      if (error) throw error;

      // Create default settings for user
      await supabase.from('user_settings').insert({ user_id: id });

      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { identifier, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier},phone_number.eq.${identifier}`)
      .eq('password_hash', password)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
  });

  // --- USER PROFILE & SETTINGS ---
  app.get("/api/user/profile/:userId", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { userId } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone_number, email, username, first_name, last_name, dob, state, lga, profile_photo_url, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.put("/api/user/profile/:userId", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber, profilePhotoUrl } = req.body;
    
    const { error } = await supabase
      .from('users')
      .update({ 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        phone_number: phoneNumber, 
        profile_photo_url: profilePhotoUrl 
      })
      .eq('id', userId);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: "ok" });
  });

  app.get("/api/user/settings/:userId", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { userId } = req.params;
    let { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !settings) {
      await supabase.from('user_settings').insert({ user_id: userId });
      const { data: newSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      settings = newSettings;
    }
    res.json(settings);
  });

  app.put("/api/user/settings/:userId", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { userId } = req.params;
    const { notifications_enabled, pidgin_voice_enabled, dark_mode_enabled } = req.body;
    
    const { error } = await supabase
      .from('user_settings')
      .update({ 
        notifications_enabled: notifications_enabled ? true : false, 
        pidgin_voice_enabled: pidgin_voice_enabled ? true : false, 
        dark_mode_enabled: dark_mode_enabled ? true : false 
      })
      .eq('user_id', userId);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: "ok" });
  });

  // --- HELP & FAQ ---
  app.get("/api/help/faq", (req, res) => {
    const faqs = [
      { q: "How I fit register my business?", a: "Go to your dashboard, click 'Register Business', fill the form and upload your shop photo. We go check am and give you CAC number.", pidgin: "How I fit register my business? Go your dashboard, click 'Register Business', fill the form and upload your shop photo. We go check am and give you CAC number." },
      { q: "Wetyn be Daily Tax?", a: "Daily tax na small money wey you go pay based on how much you sell. E go help you get micro-loan later.", pidgin: "Wetyn be Daily Tax? Daily tax na small money wey you go pay based on how much you sell. E go help you get micro-loan later." },
      { q: "How I fit top up my wallet?", a: "Click 'Top Up' for your wallet section. You fit use card or bank transfer.", pidgin: "How I fit top up my wallet? Click 'Top Up' for your wallet section. You fit use card or bank transfer." }
    ];
    res.json(faqs);
  });

  // --- COMPLIANCE REPORT ---
  app.get("/api/reports/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), async (req, res) => {
    const { vendorId } = req.params;
    
    try {
      const [
        { data: taxRecords },
        { data: levyRecords },
        { data: healthPermit },
        { data: business }
      ] = await Promise.all([
        supabase.from('tax_records').select('*').eq('vendor_id', vendorId),
        supabase.from('levy_records').select('*').eq('vendor_id', vendorId),
        supabase.from('health_permits').select('*').eq('vendor_id', vendorId).single(),
        supabase.from('businesses').select('*').eq('vendor_id', vendorId).single()
      ]);

      const taxRecordsList = taxRecords || [];
      const levyRecordsList = levyRecords || [];

      // Calculate scores
      const taxScore = taxRecordsList.length > 0 ? 100 : 0;
      const levyScore = levyRecordsList.length > 0 ? 100 : 0;
      const healthScore = healthPermit ? (new Date(healthPermit.expiry_date as string) > new Date() ? 100 : 50) : 0;
      const cacScore = business?.registration_status === 'APPROVED' ? 100 : business?.registration_status === 'SUBMITTED' ? 50 : 0;

      const overallScore = Math.round((taxScore + levyScore + healthScore + cacScore) / 4);

      res.json({
        overallScore,
        breakdown: {
          tax: { score: taxScore, count: taxRecordsList.length },
          levy: { score: levyScore, count: levyRecordsList.length },
          health: { score: healthScore, status: healthPermit?.status || 'NONE' },
          cac: { score: cacScore, status: business?.registration_status || 'NONE' }
        },
        recentActivity: [...taxRecordsList, ...levyRecordsList].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 10)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/download/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), (req, res) => {
    // Mock download - in a real app, this would generate a PDF
    res.json({ url: `https://example.com/reports/REP-${req.params.vendorId}.pdf`, filename: `Compliance_Report_${req.params.vendorId}.pdf` });
  });

  app.post("/api/reports/share/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), (req, res) => {
    const { email } = req.body;
    // Mock share
    res.json({ status: "ok", message: `Report shared with ${email}` });
  });

  // --- ADMIN ROUTES ---
  // Admin: Full Vendor List & Analytics
  app.get("/api/admin/vendors", authorize(["ADMIN"]), async (req, res) => {
    const { data: vendors, error } = await supabase
      .from('users')
      .select('*, businesses(*)')
      .eq('role', 'VENDOR');
    
    if (error) return res.status(400).json({ error: error.message });
    
    // Flatten businesses for the frontend
    const flattenedVendors = vendors.map(v => ({
      ...v,
      business_name: v.businesses?.[0]?.name,
      registration_status: v.businesses?.[0]?.registration_status,
      cac_registration_number: v.businesses?.[0]?.cac_registration_number
    }));

    res.json(flattenedVendors);
  });

  // Admin: Verification Stats
  app.get("/api/admin/stats", authorize(["ADMIN"]), async (req, res) => {
    const { count: totalVendors } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'VENDOR');
    const { count: pendingCac } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('registration_status', 'SUBMITTED');
    const { count: verifiedCac } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('registration_status', 'APPROVED');
    const { data: taxData } = await supabase.from('tax_records').select('calculated_tax_amount');

    const totalTaxRevenue = taxData?.reduce((sum, r) => sum + r.calculated_tax_amount, 0) || 0;

    res.json({
      totalVendors: totalVendors || 0,
      pendingCac: pendingCac || 0,
      verifiedCac: verifiedCac || 0,
      totalTaxRevenue
    });
  });

  // Admin: CAC Verification Queue
  app.get("/api/admin/cac-queue", authorize(["ADMIN"]), async (req, res) => {
    const { data: queue, error } = await supabase
      .from('businesses')
      .select('*, users(name)')
      .eq('registration_status', 'SUBMITTED');
    
    if (error) return res.status(400).json({ error: error.message });
    
    const flattenedQueue = queue.map(b => ({
      ...b,
      vendor_name: (b.users as any)?.name
    }));

    res.json(flattenedQueue);
  });

  app.post("/api/admin/verify-cac", authorize(["ADMIN"]), async (req, res) => {
    const { businessId, status, cacNumber } = req.body;
    
    const { data: business, error: updateError } = await supabase
      .from('businesses')
      .update({ registration_status: status, cac_registration_number: cacNumber })
      .eq('id', businessId)
      .select('vendor_id, name')
      .single();

    if (updateError) return res.status(400).json({ error: updateError.message });
    
    // Send Notification to Vendor
    if (business) {
      const notificationId = `notif-${Date.now()}`;
      const title = status === 'APPROVED' ? 'CAC Registration Approved!' : 'CAC Registration Rejected';
      const message = status === 'APPROVED' 
        ? `Your business "${business.name}" is now officially registered with CAC number ${cacNumber}.`
        : `Your business registration for "${business.name}" was rejected. Please check your details and re-submit.`;
      
      await supabase.from('notifications').insert({
        id: notificationId,
        user_id: business.vendor_id,
        title,
        message,
        type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR'
      });
    }

    res.json({ status: "ok" });
  });

  // Admin: Analytics Data
  app.get("/api/admin/analytics", authorize(["ADMIN"]), async (req, res) => {
    const { data: revenueByLga } = await supabase.rpc('get_revenue_by_lga');
    // If RPC not available, we can do it manually
    const { data: taxRecords } = await supabase.from('tax_records').select('lga_id, calculated_tax_amount');
    const manualRevenueByLga = taxRecords?.reduce((acc: any, r: any) => {
      const existing = acc.find((item: any) => item.lga_id === r.lga_id);
      if (existing) {
        existing.total += r.calculated_tax_amount;
      } else {
        acc.push({ lga_id: r.lga_id, total: r.calculated_tax_amount });
      }
      return acc;
    }, []) || [];

    const { data: businesses } = await supabase.from('businesses').select('registration_status');
    const registrationsByStatus = businesses?.reduce((acc: any, b: any) => {
      const existing = acc.find((item: any) => item.registration_status === b.registration_status);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ registration_status: b.registration_status, count: 1 });
      }
      return acc;
    }, []) || [];

    res.json({ revenueByLga: manualRevenueByLga, registrationsByStatus });
  });

  app.get("/api/admin/features", authorize(["ADMIN"]), (req, res) => {
    const features = [
      { id: 'loan_integration', name: 'Micro-Loan Integration', status: 'IN_PROGRESS', description: 'Connect vendors to LGA-backed micro-loans based on tax compliance.' },
      { id: 'biometric_id', name: 'Biometric Digital ID', status: 'PLANNED', description: 'Fingerprint-based verification for vendors without smartphones.' },
      { id: 'offline_sync', name: 'Offline Sync Protocol', status: 'COMPLETED', description: 'Allow logging turnover without active internet connection.' }
    ];
    res.json(features);
  });

  // --- OFFICIAL (LGA) ROUTES ---
  // Official: View Vendors in their LGA
  app.get("/api/official/vendors/:lgaId", authorize(["OFFICIAL", "ADMIN"]), async (req, res) => {
    const { lgaId } = req.params;
    const { data: vendors, error } = await supabase
      .from('users')
      .select('*, businesses!inner(*)')
      .eq('businesses.lga_id', lgaId)
      .eq('role', 'VENDOR');
    
    if (error) return res.status(400).json({ error: error.message });
    
    const flattenedVendors = vendors.map(v => ({
      ...v,
      business_name: v.businesses?.[0]?.name,
      registration_status: v.businesses?.[0]?.registration_status
    }));

    res.json(flattenedVendors);
  });

  // Official: Verify Compliance (Read-only access to specific vendor)
  app.get("/api/official/verify/:vendorId", authorize(["OFFICIAL", "ADMIN"]), async (req, res) => {
    const { vendorId } = req.params;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone_number, profile_photo_url')
      .eq('id', vendorId)
      .single();
    
    if (userError || !user) return res.status(404).json({ error: "Vendor not found" });

    const { data: business } = await supabase.from('businesses').select('*').eq('vendor_id', vendorId).single();
    const { data: healthPermit } = await supabase.from('health_permits').select('*').eq('vendor_id', vendorId).single();
    const { data: taxRecords } = await supabase.from('tax_records').select('calculated_tax_amount').eq('vendor_id', vendorId);
    const { data: levyRecords } = await supabase.from('levy_records').select('amount').eq('vendor_id', vendorId);

    const totalTax = taxRecords?.reduce((sum, r) => sum + r.calculated_tax_amount, 0) || 0;
    const totalLevies = levyRecords?.reduce((sum, r) => sum + r.amount, 0) || 0;

    res.json({ 
      user, 
      business, 
      healthPermit, 
      taxSummary: { total_tax: totalTax }, 
      levySummary: { total_levies: totalLevies } 
    });
  });

  app.get("/api/admin/vendors", authorize(["OFFICIAL", "ADMIN"]), async (req, res) => {
    const { data: vendors, error } = await supabase
      .from('users')
      .select('*, businesses(*)')
      .eq('role', 'VENDOR');
    
    if (error) return res.status(400).json({ error: error.message });
    
    const flattenedVendors = vendors.map(v => ({
      ...v,
      business_name: v.businesses?.[0]?.name,
      registration_status: v.businesses?.[0]?.registration_status
    }));

    res.json(flattenedVendors);
  });

  // --- NOTIFICATION ROUTES ---
  app.get("/api/notifications/:userId", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { userId } = req.params;
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(notifications);
  });

  app.post("/api/notifications/read", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { notificationId } = req.body;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: "ok" });
  });

  // --- WALLET ROUTES ---
  app.get("/api/wallet/:userId", authorize(["VENDOR"]), async (req, res) => {
    const { userId } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ balance: user?.wallet_balance || 0 });
  });

  app.post("/api/wallet/topup", authorize(["VENDOR"]), async (req, res) => {
    const { userId, amount } = req.body;
    
    // Get current balance
    const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', userId).single();
    const newBalance = (user?.wallet_balance || 0) + amount;

    const { error } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: "ok" });
  });

  app.post("/api/wallet/pay", authorize(["VENDOR"]), async (req, res) => {
    const { userId, amount, description } = req.body;
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userError || !user) return res.status(400).json({ error: "User not found" });
    
    if (user.wallet_balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const newBalance = user.wallet_balance - amount;
    await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', userId);
    
    // Add notification for payment
    const notificationId = `notif-pay-${Date.now()}`;
    await supabase.from('notifications').insert({
      id: notificationId,
      user_id: userId,
      title: "Payment Successful",
      message: `You paid ₦${amount} for ${description}.`,
      type: "SUCCESS"
    });

    res.json({ status: "ok" });
  });

  // --- LGA BAND ROUTES ---
  app.get("/api/lga-bands", async (req, res) => {
    const { data: bands, error } = await supabase
      .from('lga_bands')
      .select('*');
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(bands);
  });

  app.get("/api/business/:vendorId", authorize(["VENDOR", "OFFICIAL", "ADMIN"]), async (req, res) => {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('vendor_id', req.params.vendorId)
      .single();
    
    if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
    res.json(business || null);
  });

  // --- VENDOR ROUTES ---
  app.get("/api/vendor/dashboard/:userId", authorize(["VENDOR"]), async (req, res) => {
    const { userId } = req.params;
    
    try {
      const [
        { data: business },
        { data: notifications },
        { data: walletUser },
        { data: taxRecords },
        { data: levyRecords },
        { data: healthPermit }
      ] = await Promise.all([
        supabase.from('businesses').select('*').eq('vendor_id', userId).single(),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('users').select('wallet_balance').eq('id', userId).single(),
        supabase.from('tax_records').select('*').eq('vendor_id', userId),
        supabase.from('levy_records').select('*').eq('vendor_id', userId),
        supabase.from('health_permits').select('*').eq('vendor_id', userId).single()
      ]);

      const taxRecordsList = taxRecords || [];
      const levyRecordsList = levyRecords || [];

      // Calculate scores for the report part
      const taxScore = taxRecordsList.length > 0 ? 100 : 0;
      const levyScore = levyRecordsList.length > 0 ? 100 : 0;
      const healthScore = healthPermit ? (new Date(healthPermit.expiry_date as string) > new Date() ? 100 : 50) : 0;
      const cacScore = business?.registration_status === 'APPROVED' ? 100 : business?.registration_status === 'SUBMITTED' ? 50 : 0;
      const overallScore = Math.round((taxScore + levyScore + healthScore + cacScore) / 4);

      res.json({
        business: business || null,
        notifications: notifications || [],
        walletBalance: walletUser?.wallet_balance || 0,
        report: {
          overallScore,
          breakdown: {
            tax: { score: taxScore, count: taxRecordsList.length },
            levy: { score: levyScore, count: levyRecordsList.length },
            health: { score: healthScore, status: healthPermit?.status || 'NONE' },
            cac: { score: cacScore, status: business?.registration_status || 'NONE' }
          },
          recentActivity: [...taxRecordsList, ...levyRecordsList].sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 10)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), async (req, res) => {
    const { vendorId } = req.params;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', vendorId)
      .single();
    
    if (userError || !user) return res.status(404).json({ error: "User not found" });
    
    const { data: business } = await supabase.from('businesses').select('*').eq('vendor_id', vendorId).single();
    const { data: healthPermit } = await supabase.from('health_permits').select('*').eq('vendor_id', vendorId).single();
    
    res.json({ user, business, healthPermit });
  });

  app.post("/api/vendor", authorize(["VENDOR", "ADMIN"]), async (req, res) => {
    const { id, phoneNumber, name, role, profilePhotoUrl } = req.body;
    const { error } = await supabase
      .from('users')
      .upsert({ 
        id, 
        phone_number: phoneNumber, 
        name, 
        role, 
        profile_photo_url: profilePhotoUrl, 
        email: `${id}@example.com`, 
        username: id, 
        password_hash: 'password' 
      });
    
    if (error) return res.status(400).json({ error: error.message });

    // Trigger Automation: Vendor Onboarding
    AutomationService.dispatch('vendor.created', { id, phoneNumber, name, role });
    
    res.json({ status: "ok" });
  });

  // Business Registration (CAC Flow)
  app.post("/api/business", authorize(["VENDOR"]), async (req, res) => {
    const { id, vendorId, name, lgaId, address, businessType, photoUrl } = req.body;
    const { error } = await supabase
      .from('businesses')
      .upsert({ 
        id, 
        vendor_id: vendorId, 
        name, 
        lga_id: lgaId, 
        address, 
        business_type: businessType, 
        photo_url: photoUrl, 
        registration_status: 'SUBMITTED' 
      });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: "ok" });
  });

  // Tax Management
  app.post("/api/tax", authorize(["VENDOR"]), async (req, res) => {
    const { id, vendorId, date, turnover, calculatedTax, lgaBandId } = req.body;
    const { error } = await supabase
      .from('tax_records')
      .insert({ 
        id, 
        vendor_id: vendorId, 
        date, 
        turnover_amount: turnover.amount, 
        calculated_tax_amount: calculatedTax.amount, 
        lga_band_id: lgaBandId, 
        is_synced: true 
      });

    if (error) return res.status(400).json({ error: error.message });

    // Trigger Automation: Tax Logged
    AutomationService.dispatch('tax.logged', { vendorId, amount: calculatedTax.amount, date });

    res.json({ status: "ok" });
  });

  app.get("/api/tax/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), async (req, res) => {
    const { vendorId } = req.params;
    const { data: records, error } = await supabase
      .from('tax_records')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('date', { ascending: false });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(records);
  });

  // Levy Management
  app.post("/api/levy", authorize(["VENDOR"]), async (req, res) => {
    const { id, vendorId, date, amount, lgaId, category, receiptPhotoUrl } = req.body;
    const { error } = await supabase
      .from('levy_records')
      .insert({ 
        id, 
        vendor_id: vendorId, 
        date, 
        amount: amount.amount, 
        lga_id: lgaId, 
        category, 
        receipt_photo_url: receiptPhotoUrl, 
        is_synced: true 
      });

    if (error) return res.status(400).json({ error: error.message });

    // Trigger Automation: High Value Levy Escalation
    if (amount.amount > 2000) {
      AutomationService.dispatch('levy.high_value_alert', { vendorId, amount: amount.amount, category, lgaId });
    }

    res.json({ status: "ok" });
  });

  app.get("/api/levy/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), async (req, res) => {
    const { vendorId } = req.params;
    const { data: records, error } = await supabase
      .from('levy_records')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('date', { ascending: false });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(records);
  });

  // Health Permit Management
  app.post("/api/health-permit", authorize(["VENDOR", "ADMIN"]), async (req, res) => {
    const { id, vendorId, permitNumber, issueDate, expiryDate, photoUrl, status } = req.body;
    const { error } = await supabase
      .from('health_permits')
      .upsert({ 
        id, 
        vendor_id: vendorId, 
        permit_number: permitNumber, 
        issue_date: issueDate, 
        expiry_date: expiryDate, 
        photo_url: photoUrl, 
        status 
      });

    if (error) return res.status(400).json({ error: error.message });

    // Trigger Automation: Permit Updated
    AutomationService.dispatch('permit.updated', { vendorId, permitNumber, expiryDate, status });

    res.json({ status: "ok" });
  });

  app.get("/api/health-permit/:vendorId", authorize(["VENDOR", "ADMIN", "OFFICIAL"]), async (req, res) => {
    const { vendorId } = req.params;
    const { data: permit, error } = await supabase
      .from('health_permits')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();
    
    if (error || !permit) return res.status(404).json({ error: "No permit found" });
    res.json(permit);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
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
    role: 'VENDOR',
    email: 'amara@example.com',
    username: 'amara',
    passwordHash: 'password'
  };
  await supabase.from('users').upsert({ 
    id: demoVendor.id, 
    phone_number: demoVendor.phoneNumber, 
    name: demoVendor.name, 
    role: demoVendor.role, 
    email: demoVendor.email, 
    username: demoVendor.username, 
    password_hash: demoVendor.passwordHash 
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
