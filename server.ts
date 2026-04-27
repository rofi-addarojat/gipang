import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-order-email", async (req, res) => {
    const { orderId, name, email, phone, address, quantity, paymentMethod, totalPrice } = req.body;
    
    console.log(`[Email System] Sending order confirmation for order ${orderId} to ${email || 'Admin'}...`);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    if (!smtpHost || !smtpUser || !smtpPass) {
       console.log("[Email System] SMTP credentials not fully configured in env variables. Skipping actual email dispatch and logging only.");
       res.status(200).json({ success: true, message: "Logged email (no SMTP configs)" });
       return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"Gipang Cilegon" <${smtpUser}>`,
        to: email ? `${email}, ${adminEmail}` : adminEmail,
        subject: `Konfirmasi Pesanan - ${orderId}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #ea580c;">Terima Kasih Atas Pesanan Anda!</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Pesanan Anda telah berhasil kami simpan. Berikut adalah detail pesanan Anda:</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;"><strong>ID Pesanan:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">${orderId}</span></li>
                <li style="margin-bottom: 10px;"><strong>Nama Lengkap:</strong> ${name}</li>
                <li style="margin-bottom: 10px;"><strong>No WhatsApp:</strong> ${phone}</li>
                <li style="margin-bottom: 10px;"><strong>Alamat Pengiriman:</strong> ${address}</li>
                <li style="margin-bottom: 10px;"><strong>Jumlah Pesanan:</strong> ${quantity} Box</li>
                <li style="margin-bottom: 10px;"><strong>Total Tagihan:</strong> Rp ${totalPrice.toLocaleString("id-ID")}</li>
                <li><strong>Metode Pembayaran:</strong> ${paymentMethod === "cod" ? "Cash on Delivery (Bayar di Tempat)" : "QRIS (Pembayaran Digital)"}</li>
              </ul>
            </div>
            <p>Kami akan segera memproses pesanan Anda dan mengirimkannya secepatnya. Jika ada pertanyaan, silakan hubungi kami via WhatsApp.</p>
            <br/>
            <p style="font-size: 12px; color: #888;">
              Email ini dibuat secara otomatis. Harap tidak membalas email ini secara langsung.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Email System] Success sending email to ${mailOptions.to}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[Email System] Failed:", error.message);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Example QRIS Configuration Storage (In memory for demonstration, use database in production)
  const qrisInstances: Record<string, any> = {};

  // Create or Update a QRIS Poller Instance
  app.post("/api/qris/instance", (req, res) => {
    const { apiKey, cookie, webhookUrl, staticQris, nmid } = req.body;
    if (!apiKey) {
      res.status(400).json({ error: "apiKey is required" });
      return;
    }

    qrisInstances[apiKey] = {
      apiKey,
      cookie,
      webhookUrl,
      staticQris,
      nmid, // Optionally autodetect from staticQris
      status: "active",
      lastPolled: null,
    };

    console.log(`QRIS Poller Instance created for API Key: ${apiKey}`);
    res.json({ success: true, message: "Instance configured successfully" });
  });

  // Trigger Poller Manually or Via Cron
  app.post("/api/qris/poll", async (req, res) => {
    const { apiKey } = req.body;
    const instance = qrisInstances[apiKey];

    if (!instance) {
      res.status(404).json({ error: "Instance not found" });
      return;
    }

    // 1. Fetch mutation endpoint (e.g. Dana Bisnis API / riwayat transaksi qris) using instance.cookie
    console.log(`Polling mutations for NMID: ${instance.nmid}`);

    // Mock Response
    const mockMutations = [
      {
        id: "TXN123",
        amount: 55045,
        status: "paid",
        date: new Date().toISOString(),
      },
    ];

    // 2. Parse response and notify Webhook
    if (instance.webhookUrl && mockMutations.length > 0) {
      console.log(`Sending data to webhook ${instance.webhookUrl}`);
      try {
        await fetch(instance.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "mutation_detected",
            apiKey,
            data: mockMutations,
          }),
        });
      } catch (err: any) {
        console.error("Webhook failed:", err.message);
      }
    }

    instance.lastPolled = new Date().toISOString();
    res.json({ success: true, fetchedMutations: mockMutations.length });
  });

  app.post("/api/qris/webhook", async (req, res) => {
    console.log("Received QRIS Webhook payload:", req.body);
    // Real implementation: verify the mutation amount (e.g. 55045) against orders in Firestore
    res.status(200).json({ success: true });
  });

  // Automated background cron
  setInterval(() => {
    Object.values(qrisInstances).forEach((inst) => {
      if (inst.status === "active") {
        console.log(`[Auto-Cron] Keeping session alive for ${inst.apiKey}...`);
        // Refresh token/cookie logic here
      }
    });
  }, 60000); // Check every minute

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
