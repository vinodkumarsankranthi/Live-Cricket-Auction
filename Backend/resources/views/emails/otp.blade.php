<!DOCTYPE html>
<html>
<head>
    <title>Your One-Time Password (OTP)</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            max-width: 600px;
            margin: auto;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hello,</h2>
        <p>We received a request to verify your identity or reset your password on <strong>Live Cricket Auction</strong>.</p>
        
        <p>Please use the following One-Time Password (OTP) to proceed:</p>

        <p class="otp">{{ $otp }}</p>

        <p>This OTP is valid for the next <strong>5 minutes</strong>. For security reasons, do not share this code with anyone.</p>

        <p>If you didn’t request this OTP, you can safely ignore this email.</p>

        <p>Thank you,<br>
        <strong>The Live Cricket Auction Team</strong></p>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
