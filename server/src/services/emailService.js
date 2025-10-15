const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationNotification(userEmail, propertyTitle, approved) {
    if (!userEmail) return;

    const subject = approved ? 
      'Property Verification Approved - DeedChain' : 
      'Property Verification Update - DeedChain';
    
    const message = approved ?
      `Your property "${propertyTitle}" has been successfully verified and is now registered on the blockchain.` :
      `Your property "${propertyTitle}" requires additional verification. Please check your dashboard for details.`;

    await this.sendEmail(userEmail, subject, message);
  }

  async sendTransferNotification(userEmail, propertyTitle, isRecipient) {
    if (!userEmail) return;

    const subject = isRecipient ?
      'Property Transfer Received - DeedChain' :
      'Property Transfer Initiated - DeedChain';
    
    const message = isRecipient ?
      `You have received a property transfer for "${propertyTitle}". Please check your dashboard to complete the transfer.` :
      `You have initiated a transfer for "${propertyTitle}". The recipient will need to confirm the transfer.`;

    await this.sendEmail(userEmail, subject, message);
  }

  async sendAdminAlert(subject, message) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    await this.sendEmail(adminEmail, `ADMIN: ${subject}`, message);
  }

  async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: `"DeedChain" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: html || this.wrapInTemplate(subject, text)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${result.messageId}`);
      return result;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error('Email service temporarily unavailable');
    }
  }

  wrapInTemplate(subject, content) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0A192F; color: #64FFDA; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #ddd; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DeedChain</h1>
            <p>Land Ownership & Tokenization Platform</p>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${content}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from DeedChain. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();