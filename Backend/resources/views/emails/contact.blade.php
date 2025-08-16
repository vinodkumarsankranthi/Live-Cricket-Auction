<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333333;
      line-height: 1.6;
      background-color: #f9f9f9;
      padding: 20px;
    }

    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    h2 {
      color: #004e92;
      margin-bottom: 20px;
    }

    p {
      margin: 10px 0;
    }

    .label {
      font-weight: bold;
      color: #222222;
    }

    .footer {
      margin-top: 30px;
      font-size: 0.9rem;
      color: #777777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>📩 New Contact Message</h2>

    <p><span class="label">👤 Name :</span> {{ $data['firstName'] }} {{ $data['lastName'] }}</p>
    <p><span class="label">📧 Email :</span> {{ $data['email'] }}</p>
    <p><span class="label">📱 Mobile :</span> {{ $data['mobile'] }}</p>
    <p><span class="label">Message :</span><br>{{ $data['message'] }}</p>

    <div class="footer">
      This message was sent from your website contact form.
    </div>
  </div>
</body>
</html>
