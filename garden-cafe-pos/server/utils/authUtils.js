const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter (using Gmail - configure in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate random token
exports.generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"Garden & Cafe POS" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email - Garden & Cafe POS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px; text-align: center; }
          .header h1 { color: #d4af37; margin: 0; font-size: 28px; }
          .content { padding: 40px; }
          .button { display: inline-block; padding: 16px 32px; background: #d4af37; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #888; font-size: 14px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Garden & Cafe POS</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${user.name}! 🎉</h2>
            <p>Thank you for signing up. Please verify your email address to activate your account.</p>
            <p>Click the button below to verify:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p style="color: #888; font-size: 14px;">Or copy this link: <br/>${verificationUrl}</p>
            <p style="margin-top: 30px; color: #666;">This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© 2024 Garden & Cafe POS. All rights reserved.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"Garden & Cafe POS" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset Your Password - Garden & Cafe POS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px; text-align: center; }
          .header h1 { color: #d4af37; margin: 0; font-size: 28px; }
          .content { padding: 40px; }
          .button { display: inline-block; padding: 16px 32px; background: #d4af37; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #888; font-size: 14px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Garden & Cafe POS</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p style="color: #888; font-size: 14px;">Or copy this link: <br/>${resetUrl}</p>
            <p style="margin-top: 30px; color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #ef4444; font-weight: 600;">If you didn't request this, please ignore this email and secure your account.</p>
          </div>
          <div class="footer">
            <p>© 2024 Garden & Cafe POS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email
exports.sendWelcomeEmail = async (user, organization) => {
  const mailOptions = {
    from: `"Garden & Cafe POS" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Garden & Cafe POS! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px; text-align: center; }
          .header h1 { color: #d4af37; margin: 0; font-size: 28px; }
          .content { padding: 40px; }
          .feature { display: flex; align-items: start; margin: 20px 0; }
          .feature-icon { font-size: 24px; margin-right: 12px; }
          .button { display: inline-block; padding: 16px 32px; background: #d4af37; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #888; font-size: 14px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Welcome to Garden & Cafe POS!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name}! 👋</h2>
            <p>Your account for <strong>${organization.name}</strong> has been successfully created!</p>
            <p>You're now on a <strong>14-day free trial</strong> of our platform. Here's what you can do:</p>
            
            <div class="feature">
              <span class="feature-icon">🏪</span>
              <div>
                <strong>Manage Your Branches</strong><br/>
                Add multiple locations and manage them all from one dashboard
              </div>
            </div>
            
            <div class="feature">
              <span class="feature-icon">📊</span>
              <div>
                <strong>Real-Time Analytics</strong><br/>
                Track sales, performance, and customer insights instantly
              </div>
            </div>
            
            <div class="feature">
              <span class="feature-icon">👥</span>
              <div>
                <strong>Staff Management</strong><br/>
                Monitor employee performance and manage shifts effortlessly
              </div>
            </div>
            
            <div class="feature">
              <span class="feature-icon">💳</span>
              <div>
                <strong>Multiple Payment Methods</strong><br/>
                Accept Cash, eSewa, Khalti, and more
              </div>
            </div>
            
            <a href="${process.env.CLIENT_URL}/login" class="button">Get Started</a>
            
            <p style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-left: 4px solid #d4af37; border-radius: 8px;">
              <strong>Need Help?</strong><br/>
              Check out our <a href="${process.env.CLIENT_URL}/docs" style="color: #d4af37;">documentation</a> or 
              contact us at <a href="mailto:support@gardencafe.com" style="color: #d4af37;">support@gardencafe.com</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Garden & Cafe POS. All rights reserved.</p>
            <p>Your trial ends on ${new Date(organization.subscription.trialEndsAt).toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};