exports.welcomeEmail = (name) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2>Welcome to TrustFund, ${name}!</h2>
    <p>Thank you for registering. You can now explore campaigns or create your own.</p>
    <p>Best regards,<br>The TrustFund Team</p>
  </div>
`;

exports.resetPasswordEmail = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2>Password Reset Request</h2>
    <p>Please click the link below to reset your password. The link will expire in 10 minutes.</p>
    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;