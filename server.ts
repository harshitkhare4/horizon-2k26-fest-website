import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAILS = ["khareharshit862@gmail.com"]; // Add more admin emails here

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/notify/registration", async (req, res) => {
    const { registration } = req.body;
    if (!resend) return res.status(500).json({ error: "Resend not configured" });

    try {
      // 1. Send confirmation to user
      await resend.emails.send({
        from: 'Horizon 2k26 <onboarding@resend.dev>', // Use verified domain in production
        to: registration.email,
        subject: `Registration Successful - ${registration.registrationId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #ff007a;">Horizon 2k26</h1>
            <p>Hi <strong>${registration.fullName}</strong>,</p>
            <p>You have successfully registered for Horizon 2k26 Cultural Fest!</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Registration ID:</strong> <span style="color: #ff007a; font-family: monospace;">${registration.registrationId}</span></p>
              <p style="margin: 5px 0 0 0;"><strong>Total Amount Paid:</strong> ₹${registration.totalAmount}</p>
            </div>
            <p>Your registration is currently <strong>PENDING</strong> approval. We will notify you once it's approved.</p>
            <p>Thank you for being a part of Horizon 2k26!</p>
          </div>
        `
      });

      // 2. Notify admins
      await resend.emails.send({
        from: 'Horizon 2k26 Admin <onboarding@resend.dev>',
        to: ADMIN_EMAILS,
        subject: `New Registration: ${registration.registrationId}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>New Registration Received</h2>
            <p><strong>Name:</strong> ${registration.fullName}</p>
            <p><strong>College:</strong> ${registration.collegeName}</p>
            <p><strong>Reg ID:</strong> ${registration.registrationId}</p>
            <p><strong>Amount:</strong> ₹${registration.totalAmount}</p>
            <p><a href="${process.env.APP_URL}/admin">View in Dashboard</a></p>
          </div>
        `
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  app.post("/api/notify/status-update", async (req, res) => {
    const { registration, status } = req.body;
    if (!resend) return res.status(500).json({ error: "Resend not configured" });

    try {
      const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
      
      await resend.emails.send({
        from: 'Horizon 2k26 <onboarding@resend.dev>',
        to: registration.email,
        subject: `Registration ${status.toUpperCase()} - ${registration.registrationId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #ff007a;">Horizon 2k26</h1>
            <p>Hi <strong>${registration.fullName}</strong>,</p>
            <p>Your registration for Horizon 2k26 has been <strong style="color: ${statusColor};">${status.toUpperCase()}</strong>.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Registration ID:</strong> ${registration.registrationId}</p>
            </div>
            ${status === 'approved' ? '<p>We look forward to seeing you at the fest!</p>' : '<p>If you have any questions, please contact the organizing committee.</p>'}
          </div>
        `
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
