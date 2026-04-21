# EmailJS Setup Guide

This guide explains how to set up EmailJS so form submissions from your website are sent directly to your email.

## Overview

EmailJS is a service that allows your website to send emails without needing a backend server. When someone submits the pain assessment form, you'll receive an email with all their answers.

---

## Step 1: Create an EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com)
2. Click **Sign Up** → **Sign Up Free**
3. Sign up with your Google account or email
4. Complete the registration

---

## Step 2: Add Your Email Service

1. In the EmailJS dashboard, click **Email Services** in the left sidebar
2. Click **Add New Service** (or the **+** button)
3. Choose your email provider:
   - **Gmail** (easiest if you have a Google account)
   - **Outlook** (if using Microsoft)
   - **SMTP** (for any other email provider)
4. Follow the prompts to connect your email account
   - For Gmail: Click "Connect Gmail Account" and authorize
   - For Outlook: Sign in with your Microsoft account
5. Give it a name (e.g., "Naturallee Goode Email")
6. Click **Create Service**
7. **Copy the Service ID** — you'll need it later (looks like `gmail` or a random ID)

---

## Step 3: Create an Email Template

1. In the EmailJS dashboard, click **Email Templates** in the left sidebar
2. Click **Create New Template**
3. Use the visual editor to design your email. Here's a suggested format:

```
New Pain Assessment Submission

Contact Information:
- Name: {{from_name}}
- Email: {{from_email}}
- Phone: {{phone}}

Pain Details:
- Body Area: {{body_area}}
- Side: {{pain_side}}
- Duration: {{pain_duration}}
- Discomfort Type: {{discomfort_type}}
- Pain Level: {{pain_level}}/10

Triggers: {{triggers}}

Notes: {{notes}}

Wellness Goal: {{wellness_goal}}

Consultation Preference: {{consultation_preference}}

Product Interest: {{product_interest}}

Submitted: {{submitted_at}}
```

4. Click **Save** in the top right
5. **Copy the Template ID** — you'll need it later (shown in the template list)

---

## Step 4: Get Your Public Key

1. In the EmailJS dashboard, click **Account** in the left sidebar
2. Look for **Public Key** (or API Key)
3. **Copy the Public Key** — you'll need it later

---

## Step 5: Update the Website Code

1. Open `script.js` in your project
2. Find the EmailJS configuration section near the top:

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID'
};
```

3. Replace the placeholder values with your actual credentials:
   - `YOUR_PUBLIC_KEY` → your Public Key from Step 4
   - `YOUR_SERVICE_ID` → your Service ID from Step 2
   - `YOUR_TEMPLATE_ID` → your Template ID from Step 3

4. Save the file

---

## Step 6: Test It

1. Open your website
2. Fill out the pain assessment form
3. Submit the form
4. Check your email — you should receive the submission details

---

## Troubleshooting

**Not receiving emails?**
- Check your spam folder
- Verify the credentials in `script.js` are correct
- Check the browser console (F12) for any error messages

**Getting a "service not found" error?**
- Make sure the Service ID in the code matches exactly what's in EmailJS dashboard

**Template variables not showing data?**
- Make sure the variable names in your template match what's in `script.js` (e.g., `{{from_name}}`, `{{phone}}`)

---

## Managing Your EmailJS Account

- **View sent emails**: EmailJS dashboard → "Sent Emails"
- **Change email template**: EmailJS dashboard → Templates → Edit
- **Change connected email**: EmailJS dashboard → Email Services → Edit
- **Upgrade plan**: Account → Plans (free tier is 200 emails/month)

---

## Need Help?

If you run into issues, the EmailJS documentation is at [docs.emailjs.com](https://www.emailjs.com/docs/)