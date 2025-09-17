# 🎨 QR Studio – Next-Gen QR Code Generator

[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🚀 **QR Studio** is a modern **QR code generator** with:
- 🎨 Custom colors, gradients, and logos
- 🔒 Password-protected QR codes
- 📂 Private media handling via signed URLs
- 📱 Installable **PWA** (works offline)
- 📤 Export to PNG / SVG
- ⚡ Built with **React + Vite + Supabase Edge Functions**

---

## ✨ Features

✅ Generate multiple QR types: **Text, Links, WiFi, Email, Media, Password-Protected**  
✅ Customize QR: **colors, background, rounded corners, logos**  
✅ 🔒 Secure QRs:
- Password protection
- Server-side hashing (`pgcrypto`)
- Expiry dates  
✅ 📂 Media viewer: Signed Supabase URLs  
✅ 📤 Export options: PNG / SVG download  
✅ 📱 PWA Ready (add to home screen, works offline)  
✅ 🎭 Smooth UI animations with Framer Motion  
✅ 🧩 UI built on [shadcn/ui](https://ui.shadcn.com) + TailwindCSS  

---

## 📸 Screenshots

### Landing Page
![Landing](./docs/screenshots/landing.png)

### QR Generator UI
![Generator](./docs/screenshots/generator.png)

### Password-Protected QR
![Password QR](./docs/screenshots/password-protected.png)

*(Replace with real screenshots from your `src/assets` or take live app screenshots)*

---

## 🛠️ Tech Stack

| Layer           | Tools / Libraries |
|-----------------|------------------|
| **Frontend**    | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion |
| **Backend**     | Supabase Edge Functions (Deno) |
| **Database**    | Supabase Postgres + pgcrypto |
| **Exports**     | qrcode.react, html-to-image |
| **PWA**         | manifest.json + custom service worker |

---

## 🚀 Getting Started

### 1️⃣ Clone repo
```bash
git clone https://github.com/yourusername/qrcraft-studio.git
cd qrcraft-studio

2️⃣ Install dependencies

npm install

3️⃣ Set up environment variables

Create .env file:

# Client-safe vars (commit .env.example only!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Server-side secrets (set in Supabase/hosting platform, never commit)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_ALLOWED_ORIGINS=https://yourdomain.com

⚠️ Never commit SUPABASE_SERVICE_ROLE_KEY.

4️⃣ Run development server

npm run dev

App runs at: http://localhost:5173

5️⃣ Build for production

npm run build
npm run preview


---

🗄️ Supabase Setup

Database migrations

Run migrations via CLI:

supabase db push

This sets up:

qr_codes table

pgcrypto extension

Password hash + verification functions

RLS policies


Deploy Edge Functions

supabase functions deploy createPasswordQR
supabase functions deploy verifyPassword
supabase functions deploy getSignedUrl


---

🔐 Security Notes

Passwords are hashed with pgcrypto in Postgres (never stored in plain text).

Service Role Key is used only in Edge Functions (server-side).

CORS restricted to APP_ALLOWED_ORIGINS.

Recommended: add rate limiting / captcha for password verification.



---

📂 Project Structure

qrcraft-studio/
│── src/
│   ├── App.tsx           # App entry + routes
│   ├── main.tsx          # Bootstrap
│   ├── components/       # UI + Generator
│   │   ├── QrGenerator.tsx
│   │   ├── ui/           # shadcn components
│   │   └── ...
│   ├── pages/            # Routes: Index, SecureQR, MediaViewer
│   └── integrations/     # Supabase client + types
│
│── supabase/
│   ├── migrations/       # SQL migrations
│   └── functions/        # Edge Functions (Deno)
│
│── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/
│
│── package.json
│── tailwind.config.ts
│── vite.config.ts
│── .env.example


---

📦 Available Scripts

npm run dev        # Start dev server
npm run build      # Build production bundle
npm run preview    # Preview built app
npm run lint       # Lint code


---

🛡️ Roadmap

[ ] QR analytics (track scans, clicks)

[ ] User accounts (save QR templates)

[ ] Team / collaboration features

[ ] Short URLs + campaign tracking

[ ] More export formats (PDF, EPS)



---

🤝 Contributing

1. Fork repo


2. Create feature branch (git checkout -b feature/my-feature)


3. Commit changes (git commit -m "Add feature")


4. Push to branch (git push origin feature/my-feature)


5. Open Pull Request




---

📜 License

MIT License © 2025 Dave(DCODE)


---

🌐 Live Demo

👉 https://qrcraftstudio.vercel.app
