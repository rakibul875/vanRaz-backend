import cron from "node-cron";

import nodemailer from "nodemailer";
import { AbandonedCart } from "../../models/card/abandonedCart/abandonedCart.model";

// 📧 Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ⏰ প্রতি ১ ঘণ্টা পর পর এই জবটি চলবে
cron.schedule("0 * * * *", async () => {
  console.log("🔍 Checking for abandoned carts...");

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // ১ ঘণ্টার পুরনো, PENDING এবং যাদের ইমেইল পাঠানো হয়নি
  const abandonedCarts = await AbandonedCart.find({
    status: "PENDING",
    recoveryEmailSent: false,
    updatedAt: { $lte: oneHourAgo },
    email: { $exists: true, $ne: "" },
  });

  for (const cart of abandonedCarts) {
    if (cart.email) {
      const mailOptions = {
        from: '"VenRaz E-Commerce" <no-reply@venraz.com>',
        to: cart.email,
        subject: "আপনার কার্টে কিছু প্রোডাক্ট বাকি রয়ে গেছে! 🛒",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>প্রিয় ${cart.name || "গ্রাহক"},</h2>
            <p>আপনি VenRaz-এ চেকআউট সম্পন্ন করতে ভুলে গেছেন। আপনার পছন্দের আইটেমগুলো এখনও কার্টে অপেক্ষা করছে!</p>
            <p><strong>মোট মূল্য: ৳${cart.totalAmount}</strong></p>
            <a href="https://venraz.com/checkout" style="background: #ff594d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">অর্ডার সম্পন্ন করুন</a>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        cart.recoveryEmailSent = true;
        await cart.save();
        console.log(`✉️ Recovery email sent to ${cart.email}`);
      } catch (err) {
        console.error(`Failed to send email to ${cart.email}`, err);
      }
    }
  }
});
