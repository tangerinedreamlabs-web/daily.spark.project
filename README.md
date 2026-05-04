# Daily Spark Manager Website

A simple mobile-first single-page website for DailySparkPractice.com.

## Files
- `index.html`
- `styles.css`
- `script.js`
- `assets/images/` app screenshots

Open `index.html` in a browser to preview.


## App Store links and smart detection

The download section is anchored at `#download`.

Included App Store links:
- Daily Spark Manager: https://apple.co/4cHG4O9
- Daily Spark: https://apple.co/4tFrUmq

`script.js` detects iPhone/iPad, Android, or desktop browsers. On iOS, App Store buttons open in the same tab. On Android and desktop, users are shown QR-code-friendly messaging.

## Contact navigation, tracking, and form capture

The top navigation now includes a Contact link that anchors to `#demo`, scrolls the visitor to the request form, and focuses the first form field.

Conversion events are pushed to `window.dataLayer` and sent to `gtag()` when Google Analytics is installed:
- `contact_nav_click`
- `contact_start_here_click`
- `contact_modal_click`
- `contact_form_submit_attempt`
- `contact_form_submit_success`
- `contact_form_submit_error`

To make the contact form send to your inbox or CRM, paste your form/webhook endpoint into `index.html`:

```html
<form class="demo-form" id="contact-form" aria-label="Request a demo" data-endpoint="https://your-form-endpoint.example">
```

Works with Formspree, Zapier Webhooks, Make, Netlify Forms-compatible endpoints, or a Firebase HTTPS function. Until an endpoint is configured, submissions are saved in browser localStorage for testing and the page shows a setup message.


## Revised download center

The download section now uses the launch alert graphics as clickable App Store artwork, with separate App Store badge buttons and QR codes for each app.


## Current package notes

This package includes the cumulative final site state:
- Top getting-started banner
- First-visit pop-up triggered on scroll and stored with localStorage
- Contact menu jump to the demo/contact block
- Contact-field focus behavior and conversion tracking hooks
- Updated pricing: Manager Dashboard featured at $89.99/mo
- Updated feature copy: Structured Assignments and hundreds of clients
- Revised Download Center with launch graphics, App Store buttons, and QR codes
- Full assets/images folder


## Firestore lead capture

This version submits the bottom contact/demo form directly to Cloud Firestore.

### Collections used

- `prospects` — one document per submitted lead
- `conversions` — page view, contact clicks, App Store clicks, first-visit pop-up events, and form submit events

### Setup

1. In Firebase Console, create or select your Firebase project.
2. Add a Web App in Project Settings.
3. Copy the Firebase config object into `firebase-config.js`.
4. Enable Cloud Firestore.
5. Publish the included `firestore.rules` or merge the `prospects` and `conversions` rules into your existing rules.
6. Push the files to GitHub Pages.

### Important security note

A static GitHub Pages site writes from the browser, so the Firebase config is public by design. Security must be enforced by Firestore Rules, App Check, or a Cloud Function relay if you want stronger spam protection.


## Video demo

The demo video is stored locally at:
- `assets/videos/dsmanager-demo.mp4`

The “Watch the 5-min demo” link opens the local MP4 in an on-page modal video player.


## Demo video hosting

The local MP4/modal player has been removed for GitHub Pages reliability.

Upload the demo video to Firebase Storage at a path such as:

`website/videos/dsmanager-demo.mp4`

Then replace this placeholder URL in `index.html`:

`https://firebasestorage.googleapis.com/v0/b/YOUR-PROJECT-ID.appspot.com/o/website%2Fvideos%2Fdsmanager-demo.mp4?alt=media`

with the real Firebase Storage download URL for the file.


## Contact form

Firebase/Firestore lead capture and conversion tracking have been removed.

The contact form now submits to Formspree:

`https://formspree.io/f/YOUR_FORM_ID`

Before deploying, create a Formspree form and replace `YOUR_FORM_ID` in `index.html` with your real Formspree form ID.

The site uses JavaScript to submit the form asynchronously and show:

“Thanks, we’ll be in contact soon!”
