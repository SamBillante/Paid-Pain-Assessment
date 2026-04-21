# Deployment Documentation - Paid Pain Assessment by Noah Bradley

## Project Overview

This is a **static web application** — no backend server, no database, no build step. It consists of HTML, CSS, and JavaScript files that are served directly to the browser.

**What it does:**
- Presents a multi-section pain consultation intake form
- Links to webcam-based upper and lower body movement scanners (MediaPipe)
- Embeds a 3D anatomical body map (Three.js, loads a `.glb` model) for body part selection
- On submission, sends form data as an email via EmailJS
- Shows a confirmation screen with a Calendly booking widget

Because it is fully static, deployment is simple: put the files on any web server or static hosting provider and point a browser at them.

---

## External Resources & APIs

### Three.js — 3D Body Viewer
- **What:** Renders the interactive 3D anatomical model
- **Source:** CDN importmap in `index.html`
- **CDN:** `https://cdn.jsdelivr.net/npm/three@0.158.0/`
- **Cost:** Free, open source (MIT)
- **Requires account:** No

### EmailJS — Form Submission Emails
- **What:** Sends form submission data to `goode@naturalleegoode.com` when a user submits the form
- **Source:** CDN script tag in `index.html`
- **CDN:** `https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js`
- **Cost:**
  - Free tier: 200 emails/month, 2 email templates
  - Personal tier ($15/month): 1,000 emails/month
  - Professional tier ($35/month): 5,000 emails/month
- **Requires account:** Yes — see EmailJS Setup below
- **Requires API keys:** Yes — 3 values needed (publicKey, serviceId, templateId)

### MediaPipe — Webcam Body Scanners
- **What:** Powers the joint angle detection in `upperbodyscan.html` and `lowerbodyscan.html`
- **Source:** CDN script tags in each scan page
- **CDN:** `https://cdn.jsdelivr.net/npm/@mediapipe/`
- **Cost:** Free, open source (Apache 2.0)
- **Requires account:** No
- **Privacy note:** All processing happens locally in the browser. No video is sent to any server.

### Calendly — Booking Widget
- **What:** Embedded booking calendar shown on the confirmation screen after form submission
- **Source:** Dynamically injected via `script.js` after form submission
- **URL hardcoded in script.js:** `https://calendly.com/goode-naturalleegoode/ortho-pain-assessment-call`
- **Cost:**
  - Free tier: Basic scheduling, limited features
  - Standard ($10/user/month): Customization, reminders, integrations
  - Teams ($16/user/month): Team scheduling features
- **Requires account:** Yes — the Calendly account belongs to the business owner
- **Requires API keys:** No — the widget embeds via a public URL. No code changes needed unless the Calendly URL changes.

### GLB Model File
- **What:** `assets/human-body2.glb` — the 3D anatomical model (~26 MB)
- **Source:** Stored locally in the repo under `assets/`
- **Cost:** N/A (already in the repo)
- **Note:** This file must be present and served alongside the other files. It is not loaded from a CDN.

---

## Running Locally

### Requirements
- A terminal
- Node.js installed (any version ≥ 14) **or** Python 3

Check if Node is installed:
```bash
node -v
```

If not installed:
```bash
brew install node        # macOS
# or download from https://nodejs.org
```

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/SamBillante/Paid-Pain-Assessment.git
cd Paid-Pain-Assessment
```

**2. Start a local server**

With Node (recommended):
```bash
npx serve .
```

With Python:
```bash
python3 -m http.server 8080
```

**3. Open in browser**
```
http://localhost:3000    # npx serve
http://localhost:8080    # python
```

> **Why not just open index.html directly?**
> The 3D viewer loads a `.glb` file via a network request. Browsers block this when using `file://` protocol. A local server is required.

### Sharing Over a Network (ngrok)

To test on a phone or share a temporary public URL:

```bash
# Terminal 1 — run the server
npx serve .

# Terminal 2 — expose it publicly
ngrok http 3000
```

ngrok will print a URL like `https://abc123.ngrok.io` that works on any device.

- **ngrok free tier:** One tunnel, URL changes on restart, rate limited
- **ngrok paid tiers:** Start at $8/month for a stable URL

---

## EmailJS Setup

EmailJS is the only service that requires configuration before the form submission feature will work. Without it, the form still loads and validates, but submissions won't send any email. Refer to EMAILJS_SETUP.md.

---

## Deploying to a Live Environment

Because this is a static site, it can be hosted anywhere that serves static files. No server-side language (Node, PHP, Python) is needed at runtime.

### Option A — GitHub Pages (Free, Easiest)

If the repo is on GitHub:

1. Go to the repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select the `main` branch and `/ (root)` folder
3. Click **Save**
4. GitHub will provide a URL like `https://SamBillante.github.io/`

**Cost:** Free
**Custom domain:** Supported (requires a domain and DNS change)
**HTTPS:** Automatic

> **Important:** GitHub Pages serves files from the repo root. Make sure `assets/human-body2.glb` is committed to the repo. 

### Option B — Traditional Web Host / VPS

Upload all files to the server's web root via FTP/SFTP or rsync:

```bash
rsync -avz --progress ./ user@yourserver.com:/var/www/html/
```

Ensure the web server (Apache/nginx) is configured to serve static files. No additional configuration is needed.

---

## OAuth Server Workflow

**This application does not implement OAuth or any authentication system.** There is no login, no user accounts, and no protected routes. EmailJS uses OAuth internally when you connect a Gmail or Outlook account in their dashboard. This is a one-time setup step done by the account owner, and is not part of the application's runtime flow. 

---

## Environment Checklist

Use this checklist when setting up a new deployment:

**Required — Core Functionality**
- [ ] All files present: `index.html`, `styles.css`, `script.js`, `viewer.js`, `upperbodyscan.html`, `lowerbodyscan.html`
- [ ] `assets/human-body2.glb` present (necessary for body map)
- [ ] Files served via HTTP/HTTPS (not `file://` protocol)
- [ ] HTTPS enabled (required for webcam access on mobile browsers)

**Required — Email Submissions**
- [ ] EmailJS account created at emailjs.com
- [ ] Email service connected (Gmail OAuth completed in EmailJS dashboard)
- [ ] Email template created with correct variable names
- [ ] `script.js` updated with real `publicKey`, `serviceId`, `templateId`

**Optional — Production Hardening**
- [ ] Custom domain configured
- [ ] EmailJS plan upgraded if expecting more than 200 submissions/month

**Summary of Paid Services**

| Service | Free Tier | When to Upgrade |
|---|---|---|
| EmailJS | 200 emails/month | More than ~6 submissions/day |
| Calendly | Basic scheduling | Need reminders, branding, or team features |
| ngrok | Temporary URLs, rate limited | Need a stable public URL for testing |
| GitHub Pages | Generous free tier | High traffic or custom build pipelines |