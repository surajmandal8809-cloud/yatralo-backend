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

const FromEmail = `"Yatralo Support" <${process.env.SMTP_EMAIL}>`;

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
                      Yatralo
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
                      © ${new Date().getFullYear()} Yatralo • All Rights Reserved
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
                      Yatralo Support
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
                      Secure Yatralo Notification
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
 * Send Booking Confirmation Email
 */
const sendBookingConfirmationEmail = async (to, booking) => {
  const isHotel = booking.type === 'hotel';
  const isFlight = booking.type === 'flight';
  
  const typeLabel = isHotel ? 'Stay' : isFlight ? 'Flight' : 'Journey';
  const categoryIcon = isHotel ? '🏨' : isFlight ? '✈️' : '🚆';

  const mailOptions = {
    from: FromEmail,
    to,
    subject: `${typeLabel} Confirmed - ${booking.bookingRef}`,
    html: `
      <html>
        <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:20px;margin:0;">
          <div style="max-width:600px;background:#fff;margin:auto;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
            <div style="background:#0f172a;color:#fff;padding:40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:10px;">${categoryIcon}</div>
              <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;font-style:italic;">${typeLabel} Confirmed!</h1>
              <p style="margin:10px 0 0;opacity:0.6;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;font-weight:bold;">Thank you for choosing Yatralo</p>
            </div>
            
            <div style="padding:40px;color:#1e293b;">
              <div style="display:table;width:100%;margin-bottom:30px;border-bottom:2px solid #f1f5f9;padding-bottom:25px;">
                <div style="display:table-cell;vertical-align:bottom;">
                  <p style="font-size:10px;color:#64748b;margin:0;text-transform:uppercase;font-weight:bold;letter-spacing:0.1em;margin-bottom:5px;">Booking Reference</p>
                  <p style="font-size:20px;font-weight:900;margin:0;color:#0f172a;font-style:italic;">${booking.bookingRef}</p>
                </div>
                <div style="display:table-cell;text-align:right;vertical-align:bottom;">
                  <p style="font-size:10px;color:#64748b;margin:0;text-transform:uppercase;font-weight:bold;letter-spacing:0.1em;margin-bottom:5px;">Amount Paid</p>
                  <p style="font-size:22px;font-weight:900;margin:0;color:#2563eb;">₹${booking.totalPrice.toLocaleString()}</p>
                </div>
              </div>
              
              <div style="background:#f8fafc;padding:25px;border-radius:16px;margin-bottom:30px;border:1px solid #f1f5f9;">
                <h3 style="margin:0 0 20px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;font-weight:bold;">Reservation Overview</h3>
                
                <div style="display:table;width:100%;margin-bottom:15px;">
                   <div style="display:table-cell;">
                      <p style="margin:0;font-size:24px;font-weight:900;color:#0f172a;font-style:italic;line-height:1;">${booking.from}</p>
                      <p style="margin:5px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:bold;">${isHotel ? 'City' : 'Origin'}</p>
                   </div>
                   <div style="display:table-cell;text-align:center;color:#cbd5e1;font-size:20px;width:60px;">→</div>
                   <div style="display:table-cell;text-align:right;">
                      <p style="margin:0;font-size:24px;font-weight:900;color:#0f172a;font-style:italic;line-height:1;">${booking.to}</p>
                      <p style="margin:5px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:bold;">${isHotel ? 'Property' : 'Destination'}</p>
                   </div>
                </div>
                
                <div style="height:1px;background:#e2e8f0;margin:20px 0;"></div>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:10px;">
                      <p style="margin:0;font-size:13px;color:#475569;"><strong>${isHotel ? 'Check-in' : 'Travel Date'}:</strong> ${booking.travelDate}</p>
                    </td>
                    <td style="text-align:right;padding-bottom:10px;">
                      <p style="margin:0;font-size:13px;color:#475569;"><strong>Provider:</strong> ${booking.providerName}</p>
                    </td>
                  </tr>
                  ${isHotel ? `
                  <tr>
                    <td><p style="margin:0;font-size:13px;color:#475569;"><strong>Room Type:</strong> ${booking.details?.hotel?.roomType || 'Standard'}</p></td>
                    <td style="text-align:right;"><p style="margin:0;font-size:13px;color:#475569;"><strong>Guests:</strong> ${booking.passengers || '2 Adults'}</p></td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <div style="background:#fff7ed;padding:20px;border-radius:12px;border:1px solid #ffedd5;margin-bottom:30px;">
                 <p style="margin:0;font-size:12px;color:#9a3412;line-height:1.6;font-weight:bold;">IMPORTANT: Please carry a valid Photo ID for all travelers. For hotel bookings, check-in time is usually 2:00 PM and check-out is 11:00 AM.</p>
              </div>
              
              <div style="text-align:center;margin-top:20px;">
                 <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings" style="background:#0f172a;color:#fff;padding:16px 40px;border-radius:12px;text-decoration:none;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;box-shadow:0 10px 20px rgba(0,0,0,0.1);">Manage Trip in Dashboard</a>
              </div>
            </div>
            
            <div style="background:#f8fafc;padding:30px;text-align:center;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:bold;border-top:1px solid #f1f5f9;">
               © ${new Date().getFullYear()} Yatralo Travels • Luxury Redefined • 24/7 Concierge Support
            </div>
          </div>
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
  sendBookingConfirmationEmail,
};