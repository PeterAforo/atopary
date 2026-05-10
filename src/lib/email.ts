import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("Email service not configured. Missing SMTP credentials.");
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      console.warn("Email service not configured. Email not sent:", options.subject);
      return { success: false, error: "Email service not configured" };
    }

    try {
      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM || "Atopary Properties"} <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  // Email templates
  async sendPasswordReset(email: string, resetUrl: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Atopary Properties</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C41E24; }
            .logo { font-size: 24px; font-weight: bold; color: #C41E24; }
            .content { padding: 30px 0; }
            .button { display: inline-block; background: #C41E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ATOPARY PROPERTIES</div>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for your Atopary Properties account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Atopary Properties. All rights reserved.</p>
            <p>Ghana's Premier Real Estate Platform</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Reset Your Password - Atopary Properties",
      html,
      text: `Reset your password: ${resetUrl}`,
    });
  }

  async sendEmailVerification(email: string, otp: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - Atopary Properties</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C41E24; }
            .logo { font-size: 24px; font-weight: bold; color: #C41E24; }
            .content { padding: 30px 0; }
            .otp { font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ATOPARY PROPERTIES</div>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up with Atopary Properties. Please use the verification code below to complete your registration:</p>
            <div class="otp">${otp}</div>
            <p><strong>This code will expire in 30 minutes.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Atopary Properties. All rights reserved.</p>
            <p>Ghana's Premier Real Estate Platform</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Verify Your Email - Atopary Properties",
      html,
      text: `Your verification code is: ${otp}`,
    });
  }

  async sendInquiryNotification(sellerEmail: string, propertyTitle: string, buyerName: string, message: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Property Inquiry - Atopary Properties</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C41E24; }
            .logo { font-size: 24px; font-weight: bold; color: #C41E24; }
            .content { padding: 30px 0; }
            .message-box { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #C41E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ATOPARY PROPERTIES</div>
          </div>
          <div class="content">
            <h2>New Property Inquiry</h2>
            <p>You have received a new inquiry for your property:</p>
            <h3>${propertyTitle}</h3>
            <p><strong>From:</strong> ${buyerName}</p>
            <div class="message-box">
              <strong>Message:</strong><br>
              ${message.replace(/\n/g, '<br>')}
            </div>
            <a href="${process.env.NEXTAUTH_URL}/seller/inquiries" class="button">View Inquiries</a>
            <p>Please respond to this inquiry through your dashboard to maintain communication records.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Atopary Properties. All rights reserved.</p>
            <p>Ghana's Premier Real Estate Platform</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: sellerEmail,
      subject: `New Inquiry: ${propertyTitle}`,
      html,
      text: `New inquiry from ${buyerName} for ${propertyTitle}: ${message}`,
    });
  }

  async sendInquiryResponse(buyerEmail: string, propertyTitle: string, sellerName: string, response: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Response to Your Inquiry - Atopary Properties</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C41E24; }
            .logo { font-size: 24px; font-weight: bold; color: #C41E24; }
            .content { padding: 30px 0; }
            .response-box { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #C41E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ATOPARY PROPERTIES</div>
          </div>
          <div class="content">
            <h2>Response to Your Inquiry</h2>
            <p>Good news! ${sellerName} has responded to your inquiry about:</p>
            <h3>${propertyTitle}</h3>
            <div class="response-box">
              <strong>Response:</strong><br>
              ${response.replace(/\n/g, '<br>')}
            </div>
            <a href="${process.env.NEXTAUTH_URL}/buyer/inquiries" class="button">View Response</a>
            <p>You can continue the conversation through your dashboard.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Atopary Properties. All rights reserved.</p>
            <p>Ghana's Premier Real Estate Platform</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: buyerEmail,
      subject: `Response to Your Inquiry: ${propertyTitle}`,
      html,
      text: `Response from ${sellerName} regarding ${propertyTitle}: ${response}`,
    });
  }

  async sendMortgageStatusUpdate(email: string, status: string, notes?: string) {
    const statusMessages = {
      PENDING: "Your application is being reviewed",
      UNDER_REVIEW: "Your application is under detailed review",
      APPROVED: "Congratulations! Your mortgage application has been approved",
      REJECTED: "We're sorry, but your mortgage application was not approved",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mortgage Application Update - Atopary Properties</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C41E24; }
            .logo { font-size: 24px; font-weight: bold; color: #C41E24; }
            .content { padding: 30px 0; }
            .status { font-size: 18px; font-weight: bold; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .status.approved { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .status.rejected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .status.pending { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
            .notes { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #C41E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ATOPARY PROPERTIES</div>
          </div>
          <div class="content">
            <h2>Mortgage Application Update</h2>
            <p>Your mortgage application status has been updated:</p>
            <div class="status ${status.toLowerCase()}">
              ${statusMessages[status as keyof typeof statusMessages] || status}
            </div>
            ${notes ? `
              <div class="notes">
                <strong>Notes:</strong><br>
                ${notes.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
            <a href="${process.env.NEXTAUTH_URL}/buyer/mortgages" class="button">View Application</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 Atopary Properties. All rights reserved.</p>
            <p>Ghana's Premier Real Estate Platform</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Mortgage Application Update: ${status}`,
      html,
      text: `Your mortgage application status: ${status}. ${notes ? `Notes: ${notes}` : ''}`,
    });
  }
}

export const emailService = new EmailService();
