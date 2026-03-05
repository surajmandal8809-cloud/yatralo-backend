const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL_USER,
    pass: process.env.SMTP_EMAIL_PASSWORD,
  },
});

const FromEmail = `"Booking System Support" <${process.env.SMTP_EMAIL}>`;

/**
 * Send Reset Password Email
 */
const sendResetPasswordEmail = async (to, resetLink) => {
  const mailOptions = {
    from: FromEmail,
    to,
    subject: "Reset Your Password",
    html: `
      <html>
        <body style="font-family:Arial,sans-serif;background:#f4f6f8;margin:0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="600" style="background:#fff;margin:40px auto;border-radius:8px;overflow:hidden;">
                  <tr>
                    <td style="background:#111827;color:#fff;padding:20px;text-align:center;font-size:22px;font-weight:bold;">
                      Booking System
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;color:#333;font-size:16px;line-height:1.6;">
                      <h2>Password Reset Request</h2>
                      <p>Click the button below to reset your password:</p>
                      <div style="text-align:center;margin:30px 0;">
                        <a href="${resetLink}" style="background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                          Reset Password
                        </a>
                      </div>
                      <p>If you didn’t request this, ignore this email.</p>
                      <p style="color:#888;font-size:13px;">This link expires shortly.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f3f4f6;text-align:center;padding:15px;font-size:12px;color:#666;">
                      © ${new Date().getFullYear()} Booking System • All Rights Reserved
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send Confirmation Email After Password Reset
 */
const resetPasswordEmail = async (to, user) => {
  const mailOptions = {
    from: FromEmail,
    to,
    subject: "Password Reset Successful",
    html: `
      <html>
        <body style="font-family:Arial,sans-serif;background:#f4f6f8;margin:0;">
          <table width="100%" align="center">
            <tr>
              <td align="center">
                <table width="600" style="background:#fff;margin:40px auto;border-radius:8px;">
                  <tr>
                    <td style="background:#16a34a;color:#fff;padding:20px;text-align:center;font-size:22px;font-weight:bold;">
                      Password Updated Successfully
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;color:#333;line-height:1.6;">
                      <p>Hi <strong>${user.first_name} ${user.last_name}</strong>,</p>
                      <p>Your password has been successfully changed.</p>
                      <p>If this wasn’t you, contact support immediately.</p>
                      <div style="margin-top:20px;color:#666;font-size:13px;">
                        Security Tip: Never share your password with anyone.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f3f4f6;text-align:center;padding:15px;font-size:12px;color:#777;">
                      Booking System Support
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send OTP Verification Email
 */
const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: FromEmail,
    to,
    subject: "Your Verification Code",
    html: `
      <html>
        <body style="font-family:Arial,sans-serif;background:#f4f6f8;margin:0;">
          <table width="100%">
            <tr>
              <td align="center">
                <table width="600" style="background:#fff;margin:40px auto;border-radius:8px;">
                  <tr>
                    <td style="background:#2563eb;color:#fff;padding:20px;text-align:center;font-size:22px;font-weight:bold;">
                      Verification Required
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;text-align:center;">
                      <p style="font-size:16px;color:#333;">Use the code below:</p>
                      <div style="font-size:32px;font-weight:bold;letter-spacing:6px;background:#f1f5f9;padding:15px;border-radius:6px;display:inline-block;margin:20px 0;">
                        ${otp}
                      </div>
                      <p style="color:#666;font-size:14px;">If you didn’t request this code, contact support.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f3f4f6;text-align:center;padding:15px;font-size:12px;color:#777;">
                      Secure Booking System Notification
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendResetPasswordEmail,
  resetPasswordEmail,
  sendOTPEmail,
};