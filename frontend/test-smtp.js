const nodemailer = require("nodemailer");

// Manually set SMTP config
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;
const SMTP_USER = "sachin.it.ktm@gmail.com";
const SMTP_PASS = "auqavizagzicbwhs";
const SMTP_FROM = "PhotoFly <sachin.it.ktm@gmail.com>";

async function testSMTP() {
  console.log("Testing SMTP configuration...\n");
  console.log("SMTP_HOST:", SMTP_HOST);
  console.log("SMTP_PORT:", SMTP_PORT);
  console.log("SMTP_USER:", SMTP_USER);
  console.log("SMTP_PASS:", SMTP_PASS ? "***configured***" : "NOT SET");
  console.log();

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_USER, // Send to yourself
      subject: "PhotoFly SMTP Test",
      text: "This is a test email from PhotoFly. SMTP is working correctly!",
      html: "<h1>PhotoFly SMTP Test</h1><p>This is a test email. SMTP is working correctly!</p>",
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\nCheck your inbox:", SMTP_USER);
  } catch (error) {
    console.error("❌ SMTP Error:", error.message);
    if (error.code) console.error("Error Code:", error.code);
    if (error.command) console.error("Failed Command:", error.command);
  }
}

testSMTP();
