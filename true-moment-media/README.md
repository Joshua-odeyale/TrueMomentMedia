# TrueMoment Media — Professional Nigerian Videography Website

> **TRUE MOMENT MEDIA — Every Moment Deserves to Be Remembered.**

A complete, modern, elegant and fully responsive website for **TrueMoment Media**,
a premium creative videography and media production brand based in **Lagos, Nigeria**.
The site showcases services, a filterable portfolio with a video lightbox, service
packages, a validated booking/enquiry system, testimonials, and a contact section —
all built with **plain HTML5, CSS3 and vanilla JavaScript**. No frameworks, no build step.

---

## 1. Project Overview

TrueMoment Media captures, produces and preserves important moments through
professional videography, cinematic storytelling and video editing. This website
communicates creativity, professionalism, luxury, trust and quality, and lets
potential clients request bookings and quotations.

**Sections included**

1. Fixed responsive navigation with a gold "Book a Shoot" CTA
2. Cinematic hero with dark overlays and scroll indicator
3. About Us with an expandable brand story
4. Nine service cards (each pre-fills the booking form)
5. Filterable portfolio with a keyboard-accessible video modal
6. Why Choose Us (six selling points)
7. Packages & pricing in Nigerian Naira (illustrative prices)
8. Booking & enquiry form with validation + unique references + LocalStorage demo
9. Testimonial slider (clearly labelled samples)
10. Contact section with configurable details + WhatsApp + contact form
11. Full-width call-to-action
12. Premium dark footer with dynamic copyright year

---

## 2. Folder Structure

```
true-moment-media/
│
├── index.html              # All page markup (single-page site)
│
├── css/
│   ├── style.css           # Design system + all component styling
│   └── responsive.css      # Media queries (1080 / 900 / 640 / 400 px)
│
├── js/
│   ├── main.js             # Navigation, filters, modal, slider, reveals, config
│   └── booking.js          # Form validation, references, LocalStorage demo
│
├── assets/
│   ├── images/             # Placeholder photography (+ CREDITS.md)
│   ├── videos/             # Put your own licensed MP4s here (+ README.md)
│   └── icons/              # SVG logo, logo mark, favicon
│
└── README.md               # This file
```

---

## 3. Technologies Used

| Layer | Technology |
|-------|-----------|
| Structure | Semantic HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox, media queries, animations) |
| Behaviour | Vanilla JavaScript (ES6+), no libraries |
| Fonts | Google Fonts — *Playfair Display* (headings) + *Inter* (body), with system fallbacks |
| Icons/Logo | Inline SVG + standalone SVG files |
| Demo storage | Browser `localStorage` |

The **only external request** is Google Fonts. If it is unavailable (e.g. offline),
headings fall back to Georgia and body text to the system sans-serif, so the site
still works fully.

---

## 4. How to Open and Run

**Option A — just open it**

Double-click `index.html` (or drag it into a modern browser). Everything works
from the file system, including the booking demo and portfolio filters.

**Option B — local server (recommended)**

Some browsers restrict certain features on `file://`. A tiny static server avoids that:

```bash
# Python 3
cd true-moment-media
python3 -m http.server 8000
# then visit http://localhost:8000

# or Node
npx serve .
```

No compilation, bundling or installation is required.

---

## 5. Replacing Images and Videos

### Images
- All images live in `assets/images/` and are **placeholders**, not client work.
- Replace a file with your own photo using the **same filename**, or update the
  `src` in `index.html`.
- Recommended widths: hero/CTA ≈ 1920px, cards/portfolio ≈ 1200px. Compress to
  keep each under ~250 KB.
- Always write meaningful `alt` text.
- See `assets/images/CREDITS.md` for the current placeholder sources.

### Videos
- The portfolio uses short public sample clips so the modal works immediately.
- Put your own **MP4 (H.264/AAC)** files in `assets/videos/`.
- In `index.html`, edit each portfolio item's `data-video` attribute:

  ```html
  <article class="portfolio-item" data-category="weddings"
           data-title="Adaeze & Tunde" data-category-label="Weddings"
           data-video="assets/videos/adaeze-tunde-highlight.mp4">
  ```

- To embed YouTube/Vimeo instead, replace the `<video id="modalVideo">` in the
  modal with an `<iframe>` and set its `src` in `js/main.js` (`initVideoModal`).
- See `assets/videos/README.md` for compression tips.

---

## 6. Editing the Logo and Brand Colours

### Logo
- The aperture mark is **inline SVG** in the header and footer of `index.html`,
  so it stays sharp at any size and inherits the gold colour.
- Standalone files: `assets/icons/logo.svg` (dark backgrounds),
  `logo-light.svg` (light backgrounds), `logo-mark.svg` (mark only),
  `favicon.svg` (browser tab).
- To change the mark, edit the SVG `<circle>`/`<line>` elements. For production,
  convert the SVG text to outlines in a vector editor (Illustrator/Inkscape).

### Colours
All colours are CSS custom properties at the top of `css/style.css`:

```css
:root {
  --black:      #0B0B0B;
  --charcoal:   #171717;
  --gold:       #C9A45C;
  --gold-light: #E2C98F;
  --gold-dark:  #A9853F;
  --cream:      #F5F0E7;
  --white:      #FFFFFF;
  --grey:       #A5A5A5;
}
```

Change a value once and it updates everywhere (buttons, accents, borders, etc.).

---

## 7. Changing Service Descriptions and Package Prices

- **Services:** edit the nine `<article class="service-card">` blocks in
  `index.html` (image, `<h3>`, description, and the `data-book-service` /
  `data-service-name` attributes that pre-fill the booking form).
- **Packages:** edit the three `<article class="package-card">` blocks.
  Prices are **illustrative examples** (₦150,000 / ₦350,000 / ₦650,000) and are
  clearly labelled as such — replace them with your confirmed rates.
- The `data-book-package` value (`Basic`, `Standard`, `Premium`) must match the
  `<option>` values in the booking form's package dropdown.

---

## 8. Configuring Phone, Email, WhatsApp and Social Links

Open `js/main.js` and edit the `TMM_CONFIG` object at the top:

```js
const TMM_CONFIG = {
  phone: '+2348000000000',           // international format, no spaces
  phoneDisplay: '+234 800 000 0000', // shown on the page
  whatsapp: '2348000000000',         // digits only, with country code
  email: 'hello@truemomentmedia.example',
  whatsappMessage: 'Hello TrueMoment Media! ...',
  socials: {
    instagram: 'https://www.instagram.com/yourhandle',
    tiktok: 'https://www.tiktok.com/@yourhandle',
    youtube: 'https://www.youtube.com/@yourchannel'
  }
};
```

Every phone, email, WhatsApp and social link on the page is generated from this
one object (via `data-bind`, `data-whatsapp` and `data-social` attributes), so you
only edit it in one place. **The shipped values are placeholders** — replace them
with the company's real details before launch.

---

## 9. How the Booking Form Works

1. The visitor fills in name, phone, email, event type, optional package, date,
   location and additional information.
2. `js/booking.js` validates required fields, email format, phone format and that
   the event date is **today or in the future**. Helpful inline errors appear and
   the first invalid field is focused.
3. On a valid submit, a **unique booking reference** is generated in the format
   `TMM-YYYYMMDD-XXXX` (e.g. `TMM-20261113-K7Q2`), using `crypto.getRandomValues`
   where available and checked against existing references.
4. The enquiry is appended to a `tmm_bookings` array in **LocalStorage**, and a
   confirmation panel shows the reference and a summary.
5. A "View saved demo enquiries" panel lists stored requests and lets you clear them.
6. A hidden honeypot field silently drops simple bot submissions.
7. The contact form behaves the same way, storing messages under `tmm_contact_messages`.

Service cards and package buttons **pre-fill** the booking form and scroll to it.

---

## 10. Limitations of LocalStorage (Important)

- LocalStorage is **per-browser, per-device**. A booking made on one phone is not
  visible on another device or to the business.
- It is **not sent anywhere** — no email, no database, no notification.
- Data can be cleared by the user, by private-browsing mode, or by storage limits.
- It is **not secure** and must never be used for real customer data in production.

**LocalStorage here is purely a frontend demonstration** of the booking flow.

---

## 11. Connecting a Real Backend

To receive real bookings, replace the LocalStorage step in `js/booking.js`
(the `storage.set(KEY_BOOKINGS, bookings)` call) with a `fetch()` to your endpoint:

```js
fetch('https://api.yourdomain.com/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(record)
})
  .then(res => { if (!res.ok) throw new Error('Request failed'); return res.json(); })
  .then(() => { /* show the success panel */ })
  .catch(() => { /* show a friendly error and keep the form data */ });
```

You will need:

- A **server endpoint** (Node/Express, PHP, Python, a serverless function, etc.)
- A **database** (PostgreSQL, MySQL, MongoDB, Firebase, Supabase…) or an
  **email/CRM service** (SendGrid, Mailgun, Formspree, Google Sheets, HubSpot…)
- **HTTPS**, server-side validation, spam protection (rate limiting, CAPTCHA),
  and appropriate **data-protection/privacy** handling for customer information.

Until then, the site is a polished, fully interactive **demo**.

---

## 12. Accessibility, Performance & SEO

- Semantic HTML5 landmarks and a logical heading hierarchy
- Skip-to-content link, visible focus states, keyboard-accessible nav & modal
  (focus trap + `Esc` to close), ARIA labels and live regions
- `prefers-reduced-motion` support (animations disabled)
- Lazy-loaded images, `fetchpriority` on the hero, optimized JPEGs
- Descriptive `alt` text, SEO title/meta description, Open Graph + Twitter cards,
  and JSON-LD `LocalBusiness` structured data
- No horizontal overflow; tested across desktop, tablet and phone breakpoints

---

## 13. Pre-Launch Checklist

- [ ] Replace all placeholder images with original/licensed photography
- [ ] Replace sample portfolio videos with your own licensed films
- [ ] Replace sample testimonials with genuine client reviews
- [ ] Set real phone, email, WhatsApp and social links in `TMM_CONFIG`
- [ ] Confirm package prices (currently illustrative)
- [ ] Connect the booking/contact forms to a secure backend or email service
- [ ] Update Open Graph `og:url` / `og:image` to the live domain
- [ ] Add a privacy policy if you collect customer data

---

## 14. Browser Support

Works in all modern evergreen browsers (Chrome, Edge, Firefox, Safari) on desktop
and mobile. Uses standard, widely supported web APIs.

---

**TRUE MOMENT MEDIA — Every Moment Deserves to Be Remembered.**
