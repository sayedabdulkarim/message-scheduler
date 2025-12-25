# Message Scheduler - Project Tasks

> Last Updated: 24 Dec 2024 (Session 2 - Frontend Complete)

---

## Project Overview
A SaaS web application to schedule automated messages across Email, WhatsApp, and Telegram.

---

## Phase 1: Backend Setup

### Project Initialization
- [x] Create project folder structure
- [x] Initialize Express.js backend with TypeScript
- [x] Setup tsconfig.json
- [x] Install dependencies (express, mongoose, jwt, nodemailer, etc.)
- [x] Create .gitignore
- [x] Create .env and .env.example

### Database
- [x] Setup MongoDB connection config
- [x] Create User model
- [x] Create Platform model
- [x] Create Recipient model
- [x] Create Schedule model
- [x] Create Log model
- [x] Create Template model
- [x] Create OTP model

### Authentication
- [x] Create auth middleware (JWT verification)
- [x] Create JWT utility (access & refresh tokens)
- [x] Create OTP utility
- [x] Signup endpoint with OTP email
- [x] Email verification endpoint
- [x] Resend OTP endpoint
- [x] Login endpoint
- [x] Logout endpoint
- [x] Get current user endpoint
- [x] Forgot password endpoint
- [x] Reset password endpoint

### Platform Integration
- [x] Email service (Nodemailer)
- [x] WhatsApp service (whatsapp-web.js with QR)
- [x] Telegram bot service (node-telegram-bot-api)
- [x] Platform controller (connect/disconnect)

### Scheduling
- [x] Agenda.js setup
- [x] Scheduler service
- [x] Schedule controller (CRUD)
- [x] Execute scheduled messages

### API Routes
- [x] Auth routes (/api/auth/*)
- [x] Platform routes (/api/platforms/*)
- [x] Schedule routes (/api/schedules/*)
- [x] Recipient routes (/api/recipients/*)
- [x] Template routes (/api/templates/*)
- [x] Log routes (/api/logs/*)

### Configuration
- [x] SMTP credentials configured (sakarim9124@gmail.com)
- [x] MongoDB Atlas URI configured
- [ ] Telegram Bot Token (pending - need to create bot via @BotFather)

---

## Phase 2: Frontend Setup

### Project Initialization
- [x] Create Next.js app with TypeScript
- [x] Tailwind CSS configured
- [x] Install additional dependencies (shadcn/ui, react-query, zustand, axios)

### Pages to Build
- [x] Login page
- [x] Signup page
- [x] Email verification page
- [x] Dashboard page
- [x] Landing page (home page)
- [x] Platforms connection page
- [x] Recipients management page
- [x] Schedules management page
- [x] Create schedule page
- [x] Templates page
- [x] Logs/History page
- [x] Settings page

### Components to Build
- [x] Navbar/Header
- [x] Sidebar
- [x] Platform connection cards
- [x] WhatsApp QR code modal
- [x] Telegram verification modal
- [x] Schedule form
- [x] Recipient form
- [x] Message template selector
- [x] Days selector
- [x] Logs table with pagination
- [x] Stats dashboard cards

### API Integration
- [x] Setup API client (axios/fetch)
- [x] Auth API integration
- [x] Platform API integration
- [x] Schedule API integration
- [x] Recipient API integration
- [x] Template API integration
- [x] Log API integration

### State Management
- [x] Auth store (Zustand)
- [x] Socket.io integration for real-time QR

---

## Phase 3: Testing & Polish

- [ ] Test signup flow
- [ ] Test email verification
- [ ] Test login/logout
- [ ] Test WhatsApp QR connection
- [ ] Test Telegram bot linking
- [ ] Test schedule creation
- [ ] Test cron job execution
- [ ] Test message delivery (Email)
- [ ] Test message delivery (WhatsApp)
- [ ] Test message delivery (Telegram)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design

---

## Phase 4: Deployment

- [ ] Prepare backend for production
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Setup environment variables on hosting
- [ ] Test production deployment
- [ ] Setup custom domain (optional)

---

## Current Status

```
Backend:  95% Complete (Telegram bot token pending)
Frontend: 100% Complete (All pages and components built)
Overall:  ~95% Complete
```

## Next Steps

1. Create Telegram bot via @BotFather and add token to backend .env
2. Start backend server: cd backend && npm run dev
3. Start frontend server: cd client && npm run dev
4. Test the full application flow:
   - Signup and email verification
   - Login/logout
   - Connect platforms (WhatsApp QR, Telegram)
   - Add recipients
   - Create schedules
   - Test message sending
5. Deploy to production (Render + Vercel)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | MongoDB Atlas |
| Auth | JWT (Access + Refresh tokens) |
| Email | Nodemailer (Gmail SMTP) |
| WhatsApp | whatsapp-web.js |
| Telegram | node-telegram-bot-api |
| Scheduler | Agenda.js |
| Real-time | Socket.io |

---

## File Structure

```
message-scheduler/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── verify-email/
│   │   │   ├── (dashboard)/
│   │   │   │   └── dashboard/
│   │   │   │       ├── platforms/
│   │   │   │       ├── recipients/
│   │   │   │       ├── schedules/
│   │   │   │       ├── templates/
│   │   │   │       ├── logs/
│   │   │   │       └── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── ui/
│   │   │   └── providers.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   └── auth.store.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── next.config.ts
└── TASKS.md
```

---

## Commands

```bash
# Backend
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server

# Frontend
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```
