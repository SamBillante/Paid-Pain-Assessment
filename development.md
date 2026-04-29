# How to modify/extend software - Pain Paid Assessment by Sam Billante

## Overview
This project is a static web application built with standard web technologies: HTML, CSS, and JavaScript. It can be run locally in a browser via a simple HTTP server. It is built this way to more easily integrate into our client's current website hosted by BigCommerce. 

Use this guide when you want to extend the app, make changes, or understand the project structure.

---

## How to Make Changes

### 1. Get the project running locally
If you already followed the installation instructions, you should have the repository on your machine.

Run a local server from the project root:

- With Python:
  ```bash
  python -m http.server 8080
  ```
- With Node.js (if installed):
  ```bash
  npx serve .
  ```

Then open the app in a browser:

- `http://localhost:8080`

> Note: The 3D model (`assets/human-body2.glb`) must be loaded via HTTP/HTTPS. Opening `index.html` directly with `file://` will break the viewer.


### 2. Find the main source files
Key application files are:

- `index.html` - main landing page and intake form
- `styles.css` - visual design and page layout
- `script.js` - form behavior, EmailJS integration, Calendly injection, submission flow
- `viewer.js` - 3D body map implementation using Three.js
- `upperbodyscan.html` / `lowerbodyscan.html` - MediaPipe webcam scanner pages
- `assets/human-body2.glb` - local 3D model asset

When changing behavior, start by locating the relevant file and confirming whether the feature is handled on the main page or in one of the scanner pages.

---

## Languages and Tools

### Languages
- HTML
- CSS
- JavaScript

### Runtime / Target environment
- Modern web browsers
- Static HTTP server for local testing and deployment

### Compiler / Build management
- Currently: none. This repo is served as static source files.

To add a build setup, one path is to create a `package.json` and use a tool like Vite, then move the current source files into that workflow.

---

## Dependencies

This project relies on browser-based dependencies loaded from CDNs and local assets.

### External dependencies referenced in source files
- `Three.js` — loaded from CDN via `index.html` and used by `viewer.js`
- `EmailJS` — loaded from CDN in `index.html` and used by `script.js`
- `MediaPipe` — loaded from CDN in `upperbodyscan.html` and `lowerbodyscan.html`
- `Calendly` embed script — injected by `script.js`

### Local assets
- `assets/human-body2.glb` — required 3D model file

### Where the dependencies are defined
- `index.html` contains the main script tags and import references for Three.js, EmailJS, and any other browser-side libraries
- `upperbodyscan.html` and `lowerbodyscan.html` contain the MediaPipe script references

If you add a package manager later, dependencies should be listed in `package.json` and/or `package-lock.json`.

---

## Automated Builds and Testing

### Automated builds
- There are no automated builds in this project. The project runs directly from source files.

### Automated testing
- There is no automated test runner.
- Existing test guidance is documented in `Testing.md`, which describes manual test cases.

---

## Backlog and Bug Lists

- Backlogs can be found on the project site [here](https://sambillante.github.io/Paid-Pain-Assessment/deliverables)

### Major upgrade considerations
- `Three.js` version updates can require changes in `viewer.js` and model handling because APIs change frequently.
- `MediaPipe` updates may require scanner page revisions for webcam tracking and pose calculations.
- `EmailJS` version or service changes may require updates to `script.js` and the email template integration.
- If the application is migrated to a build system or framework, expect to refactor `index.html`, split JavaScript into modules, and introduce a package management workflow.
- If you have the resources, the `upperbodyscan.html` and `lowerbodyscan.html` scans could be made more reliable.
- An option to go into fullscreen when using the viewer from `viewer.js` could be convenient for some users, and may require an extensive overhaul.

---

## Style Expectations

### Code style
- Keep JavaScript simple and browser-native.
- Prefer clear, descriptive variable names.
- Keep event listeners grouped near the feature they support.

### HTML
- Keep page structure semantic and accessible.
- Use meaningful IDs and classes for key interactive elements.
- Preserve the existing layout patterns rather than introducing unrelated structural changes.

### CSS
- Use classes for reusable styling.
- Keep layout and presentation separate from behavior.
- Add new styles to `styles.css` unless a new page requires a dedicated stylesheet.

### Comments and documentation
- Document non-obvious behavior in the relevant `.js` file.
- If a feature depends on a specific external service or version, note it in the code comments.

---

## Recommended Workflow for Developers

1. Start the local server.
2. Open the relevant page in the browser.
3. Make a small change in the appropriate file.
4. Refresh the browser and verify the behavior.
5. If you modify external service integration, update the relevant documentation files as well.

### When adding new features
- Add new UI elements in HTML first.
- Add styling in `styles.css`.
- Add behavior in `script.js` or `viewer.js` as appropriate.
- Keep scanner logic inside `upperbodyscan.html`, `lowerbodyscan.html`, or their inline scripts rather than migrating unrelated logic into `index.html`.

---

## Notes for Future Maintainers

- This application is intentionally static and lightweight. The fastest way to extend it is usually by editing the existing `.html`, `.css`, and `.js` files directly.
- If a package manager or build step is added later, keep the user-facing output the same: static HTML/CSS/JS that runs in the browser.
- Be careful when upgrading CDN versions: test the relevant pages thoroughly after any library upgrade.
