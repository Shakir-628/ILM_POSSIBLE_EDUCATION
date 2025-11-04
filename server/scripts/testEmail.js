import dotenv from "dotenv";
import { sendEmail, sendPasswordResetEmail } from "../services/mailService.js";

dotenv.config();

const testEmail = async () => {
  console.log("📧 Testing Email Configuration...\n");
  
  // Check environment variables
  console.log("Email Configuration:");
  console.log("  HOST:", process.env.EMAIL_HOST || "❌ Not set");
  console.log("  PORT:", process.env.EMAIL_PORT || "❌ Not set");
  console.log("  USER:", process.env.EMAIL_USER || "❌ Not set");
  console.log("  PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Not set");
  console.log("  CLIENT_URL:", process.env.CLIENT_URL || "❌ Not set");
  console.log("");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ Email not configured! Please add EMAIL_USER and EMAIL_PASS to .env file");
    process.exit(1);
  }

  try {
    console.log("1️⃣ Testing basic email send...");
    
    const result = await sendEmail({
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "✅ ILM Possible - Email Test Successful!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🎉 Email Configuration Successful!</h2>
          <p>Your email system is working perfectly!</p>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32;">✅ Test Results:</h3>
            <p>✔️ SMTP Connection: Working</p>
            <p>✔️ Email Sending: Working</p>
            <p>✔️ HTML Rendering: Working</p>
          </div>
          
          <p>You can now use all email features:</p>
          <ul>
            <li>Password Reset</li>
            <li>Certificate Notifications</li>
            <li>Fee Receipts</li>
            <li>And 11 more email templates!</li>
          </ul>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Sent from: ILM Possible Education System<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: "Email configuration test successful! All email features are ready to use.",
    });

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log("📧 Check your inbox at:", process.env.EMAIL_USER);
      console.log("\n2️⃣ Testing password reset email...\n");
      
      // Test password reset email
      const resetResult = await sendPasswordResetEmail(
        process.env.EMAIL_USER,
        "test-reset-token-12345",
        "Test User"
      );
      
      if (resetResult.success) {
        console.log("✅ Password reset email sent successfully!");
        console.log("\n🎉 All email tests passed!");
        console.log("\nYou should receive 2 emails:");
        console.log("  1. Test email confirming configuration");
        console.log("  2. Password reset email with reset link");
        console.log("\n✅ Email system is fully functional!");
      }
    } else {
      console.log("❌ Email failed:", result.error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nPossible issues:");
    console.error("  - Check your EMAIL_PASS (remove quotes and spaces)");
    console.error("  - Verify Gmail App Password is correct");
    console.error("  - Ensure 2-Factor Auth is enabled");
    console.error("  - Check firewall/antivirus settings");
    process.exit(1);
  }
};

testEmail();

