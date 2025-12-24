# Message Scheduler - Implementation Document

## Overview
A SaaS web application that allows users to schedule automated messages across multiple platforms (Email, WhatsApp, Telegram) with cron job support.

---

## Table of Contents
1. [Product Features](#product-features)
2. [User Flow](#user-flow)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Platform Integration](#platform-integration)
7. [API Endpoints](#api-endpoints)
8. [Security Considerations](#security-considerations)
9. [Challenges & Solutions](#challenges--solutions)
10. [Deployment Strategy](#deployment-strategy)
11. [Future Enhancements](#future-enhancements)
12. [Project Structure](#project-structure)

---

## Product Features

### Core Features
| Feature | Description |
|---------|-------------|
| User Authentication | Signup/Login with email & password, Google OAuth |
| Platform Verification | Verify ownership of Email, WhatsApp, Telegram |
| Message Scheduling | One-time or recurring (cron) message scheduling |
| Multi-recipient | Send to multiple contacts per platform |
| Message Templates | Pre-defined templates for common messages |
| Dashboard | View all schedules, logs, and status |
| History & Logs | Track sent messages, success/failure status |

### Platform Support
| Platform | Verification Method | Sender |
|----------|---------------------|--------|
| Email | OTP to email | Server's SMTP |
| WhatsApp | QR Code scan | User's number |
| Telegram | Bot verification code | App's Bot |

---

## User Flow

### 1. Authentication Flow
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   New User                      Existing User               │
│      │                              │                       │
│      ▼                              ▼                       │
│   [Signup Page]               [Login Page]                  │
│   • Email                     • Email                       │
│   • Password                  • Password                    │
│   • Confirm Password          [Login] [Google OAuth]        │
│   [Signup] [Google OAuth]           │                       │
│      │                              │                       │
│      ▼                              │                       │
│   [Email OTP Verification]          │                       │
│   • OTP sent to email               │                       │
│   • User enters OTP                 │                       │
│   • Account activated               │                       │
│      │                              │                       │
│      └──────────────┬───────────────┘                       │
│                     ▼                                       │
│              [Dashboard]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Platform Connection Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     DASHBOARD                               │
│                                                             │
│   Connected Platforms:                                      │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ EMAIL          [user@gmail.com]        ✅ Connected │  │
│   │ WHATSAPP       [Not Connected]         [Connect]    │  │
│   │ TELEGRAM       [Not Connected]         [Connect]    │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

WHATSAPP CONNECTION:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Scan QR Code with WhatsApp                               │
│                                                             │
│   ┌─────────────┐                                          │
│   │ ▄▄▄▄▄ ▄▄▄▄▄│   1. Open WhatsApp on phone              │
│   │ █   █ █   █│   2. Go to Settings > Linked Devices     │
│   │ █▄▄▄█ █▄▄▄█│   3. Tap "Link a Device"                 │
│   │ ▄▄▄▄▄ ▄▄▄▄▄│   4. Scan this QR code                   │
│   │ █   █ █   █│                                          │
│   └─────────────┘                                          │
│                                                             │
│   [Cancel]                          Status: Waiting...     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

TELEGRAM CONNECTION:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Connect Telegram                                         │
│                                                             │
│   Step 1: Open Telegram and search for @MsgSchedulerBot    │
│   Step 2: Send /start to the bot                           │
│   Step 3: Bot will reply with a 6-digit code               │
│   Step 4: Enter the code below                             │
│                                                             │
│   Verification Code: [______]                              │
│                                                             │
│   [Verify]                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Schedule Creation Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  CREATE NEW SCHEDULE                        │
│                                                             │
│   Platform: [WhatsApp ▼]                                   │
│                                                             │
│   Recipients:                                              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ +91 98765xxxxx (Mom)                          [x]   │  │
│   │ +91 87654xxxxx (Dad)                          [x]   │  │
│   │ [+ Add Recipient]                                   │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Message:                                                 │
│   [Template ▼] [Good Morning]                              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ Good Morning! Have a wonderful day ahead!           │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Schedule Type:                                           │
│   (•) Recurring (Cron)    ( ) One-time                     │
│                                                             │
│   Time: [07:00 AM]                                         │
│                                                             │
│   Days: [✓] Mon [✓] Tue [✓] Wed [✓] Thu [✓] Fri [ ] Sat [ ] Sun │
│                                                             │
│   [Cancel]                              [Create Schedule]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Shadcn/ui | UI components |
| React Query | Server state management |
| Zustand | Client state management |
| React Hook Form | Form handling |
| Zod | Validation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API framework |
| TypeScript | Type safety |
| Agenda.js | Job scheduling (cron) |
| Socket.io | Real-time updates (QR status) |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB | Primary database |
| Mongoose | ODM |
| Redis | Session cache, rate limiting |

### Platform SDKs
| Platform | Library |
|----------|---------|
| WhatsApp | whatsapp-web.js |
| Telegram | node-telegram-bot-api |
| Email | Nodemailer |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Render / Railway | Backend hosting |
| Vercel | Frontend hosting |
| MongoDB Atlas | Database hosting |
| Upstash Redis | Redis hosting (free tier) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                           (Next.js on Vercel)                          │
│                                                                         │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│   │  Login/   │  │ Dashboard │  │ Schedule  │  │  Logs/    │          │
│   │  Signup   │  │           │  │  Creator  │  │  History  │          │
│   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘          │
│         │              │              │              │                  │
└─────────┼──────────────┼──────────────┼──────────────┼──────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                  │
│                        (Express on Render)                             │
│                                                                         │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│   │   Auth    │  │ Platform  │  │ Schedule  │  │   Logs    │          │
│   │  Routes   │  │  Routes   │  │  Routes   │  │  Routes   │          │
│   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘          │
│         │              │              │              │                  │
│         ▼              ▼              ▼              ▼                  │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                      SERVICES LAYER                         │      │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │      │
│   │  │  Auth    │  │ WhatsApp │  │ Telegram │  │  Email   │   │      │
│   │  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │      │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    JOB SCHEDULER (Agenda.js)                │      │
│   │                                                             │      │
│   │   • Loads all active schedules from DB                     │      │
│   │   • Creates cron jobs for each schedule                    │      │
│   │   • Executes at scheduled time                             │      │
│   │   • Logs success/failure                                   │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
│                                                                         │
│   ┌───────────────────────┐       ┌───────────────────────┐            │
│   │    MongoDB Atlas      │       │    Upstash Redis      │            │
│   │                       │       │                       │            │
│   │  • Users              │       │  • Session cache      │            │
│   │  • Platforms          │       │  • Rate limiting      │            │
│   │  • Schedules          │       │  • OTP storage        │            │
│   │  • Logs               │       │  • WhatsApp sessions  │            │
│   │  • Templates          │       │                       │            │
│   └───────────────────────┘       └───────────────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                │
│                                                                         │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐                │
│   │  WhatsApp │       │ Telegram  │       │   Gmail   │                │
│   │   (User's │       │   Bot     │       │   SMTP    │                │
│   │  Account) │       │   API     │       │           │                │
│   └───────────┘       └───────────┘       └───────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,              // Unique, required
  password: String,           // Hashed with bcrypt
  name: String,
  avatar: String,

  isEmailVerified: Boolean,   // Account verification status

  createdAt: Date,
  updatedAt: Date
}
```

### Platforms Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to Users

  platform: String,           // "email" | "whatsapp" | "telegram"
  isVerified: Boolean,

  // Platform-specific data
  data: {
    // For Email
    email: String,

    // For WhatsApp
    phoneNumber: String,
    sessionData: String,      // Encrypted session

    // For Telegram
    chatId: String,
    username: String
  },

  connectedAt: Date,
  lastUsed: Date
}
```

### Recipients Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  platformId: ObjectId,       // Reference to Platforms

  name: String,               // "Mom", "Dad", etc.
  identifier: String,         // Phone number or email

  createdAt: Date
}
```

### Schedules Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  platformId: ObjectId,

  name: String,               // "Good Morning to Family"
  recipients: [ObjectId],     // Reference to Recipients

  message: String,
  templateId: ObjectId,       // Optional template reference

  scheduleType: String,       // "once" | "recurring"

  // For one-time
  scheduledAt: Date,

  // For recurring (cron)
  cronExpression: String,     // "0 7 * * *"
  timezone: String,           // "Asia/Kolkata"
  days: [String],             // ["mon", "tue", "wed", "thu", "fri"]
  time: String,               // "07:00"

  isEnabled: Boolean,

  // Agenda.js job reference
  agendaJobId: String,

  createdAt: Date,
  updatedAt: Date
}
```

### Logs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  scheduleId: ObjectId,

  platform: String,
  recipient: String,
  message: String,

  status: String,             // "sent" | "failed" | "pending"
  error: String,              // Error message if failed

  sentAt: Date
}
```

### Templates Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // null for system templates

  name: String,               // "Good Morning"
  category: String,           // "greeting" | "reminder" | "custom"
  message: String,

  isSystem: Boolean,          // System templates available to all

  createdAt: Date
}
```

---

## Platform Integration

### Email Integration (Nodemailer)

**Setup:**
- Use Gmail SMTP with App Password
- Or use services like SendGrid, Mailgun for production

**Flow:**
```
1. User's email already verified during signup
2. For sending: Use server's SMTP credentials
3. Messages sent FROM: noreply@yourapp.com
4. Messages sent TO: User's recipients
```

**Rate Limits:**
- Gmail: 500 emails/day
- SendGrid Free: 100 emails/day

---

### WhatsApp Integration (whatsapp-web.js)

**Setup:**
- Each user scans QR to link their WhatsApp
- Session stored encrypted in database
- Session restored on server restart

**Flow:**
```
1. User clicks "Connect WhatsApp"
2. Server creates new WhatsApp client instance
3. QR code generated and sent via Socket.io
4. User scans QR with phone
5. Session established and encrypted
6. Phone number extracted automatically
7. Session data stored in database
```

**Session Management:**
```
┌─────────────────────────────────────────────────────────────┐
│                  WhatsApp Session Manager                   │
│                                                             │
│   • On server start: Load all verified WhatsApp sessions   │
│   • Initialize client for each active user                 │
│   • Handle disconnection events                            │
│   • Re-authenticate if session expires                     │
│   • Notify user if re-scan required                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Challenges:**
- Memory usage: Each client uses ~50-100MB RAM
- Scaling: Max 100-200 concurrent users per server
- Session expiry: WhatsApp may disconnect after days/weeks

---

### Telegram Integration (node-telegram-bot-api)

**Setup:**
1. Create bot via @BotFather
2. Get bot token
3. Bot handles verification and sending

**Flow:**
```
1. User clicks "Connect Telegram"
2. Server generates 6-digit verification code
3. User sends /start to bot
4. Bot asks for verification code
5. User sends code
6. Bot validates with server API
7. Chat ID stored for user
8. User verified
```

**Bot Commands:**
```
/start    - Start verification
/verify   - Verify with code
/status   - Check connection status
/disconnect - Disconnect from app
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/signup          - Create new account
POST   /api/auth/login           - Login
POST   /api/auth/logout          - Logout
POST   /api/auth/verify-email    - Verify email OTP
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
GET    /api/auth/me              - Get current user
POST   /api/auth/google          - Google OAuth
```

### Platforms
```
GET    /api/platforms                  - Get all connected platforms
POST   /api/platforms/whatsapp/connect - Get QR code for WhatsApp
GET    /api/platforms/whatsapp/status  - Check WhatsApp connection status
DELETE /api/platforms/whatsapp         - Disconnect WhatsApp
POST   /api/platforms/telegram/verify  - Verify Telegram code
DELETE /api/platforms/telegram         - Disconnect Telegram
```

### Recipients
```
GET    /api/recipients           - Get all recipients
POST   /api/recipients           - Add new recipient
PUT    /api/recipients/:id       - Update recipient
DELETE /api/recipients/:id       - Delete recipient
```

### Schedules
```
GET    /api/schedules            - Get all schedules
POST   /api/schedules            - Create new schedule
GET    /api/schedules/:id        - Get schedule details
PUT    /api/schedules/:id        - Update schedule
DELETE /api/schedules/:id        - Delete schedule
POST   /api/schedules/:id/toggle - Enable/disable schedule
POST   /api/schedules/:id/test   - Send test message now
```

### Templates
```
GET    /api/templates            - Get all templates
POST   /api/templates            - Create custom template
PUT    /api/templates/:id        - Update template
DELETE /api/templates/:id        - Delete template
```

### Logs
```
GET    /api/logs                 - Get message logs (paginated)
GET    /api/logs/stats           - Get statistics
```

---

## Security Considerations

### Authentication Security
| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with salt rounds 12 |
| JWT Tokens | Access token (15min) + Refresh token (7days) |
| HTTP-Only Cookies | Refresh token stored in HTTP-only cookie |
| CSRF Protection | CSRF tokens for state-changing operations |

### Data Encryption
| Data | Encryption Method |
|------|-------------------|
| Passwords | bcrypt hash |
| WhatsApp Sessions | AES-256-GCM encryption |
| JWT Tokens | RS256 signing |

### Rate Limiting
| Endpoint | Limit |
|----------|-------|
| Login attempts | 5 per 15 minutes |
| OTP requests | 3 per hour |
| Message sending | 100 per hour per user |
| API general | 1000 per hour per user |

---

## Challenges & Solutions

### Challenge 1: WhatsApp Multi-Session Management
```
Problem: Each user needs their own WhatsApp session
         Server memory increases with users

Solution:
- Lazy loading: Initialize session only when needed
- Session pooling: Keep max 50 active sessions
- LRU eviction: Disconnect least recently used sessions
- Background reconnection: Reconnect on next scheduled message
```

### Challenge 2: WhatsApp Session Persistence
```
Problem: Sessions expire, users need to re-scan QR frequently

Solution:
- Store session data in database (encrypted)
- On server restart, restore sessions
- Monitor authentication events
- Notify user via email if re-auth needed
```

### Challenge 3: Timezone Handling
```
Problem: Users in different timezones, cron needs to fire correctly

Solution:
- Store user's timezone preference
- Use Agenda.js with timezone support
- Convert all times to UTC for storage
- Display in user's local timezone
```

### Challenge 4: Message Delivery Failures
```
Problem: Messages may fail due to network, session issues

Solution:
- Implement retry mechanism (3 attempts with exponential backoff)
- Log all attempts with status
- Notify user of persistent failures
- Provide manual retry option
```

---

## Deployment Strategy

### MVP Deployment (Free Tier)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Frontend: Vercel (Free)                                  │
│   Backend: Render (Free - 750 hours/month)                 │
│   Database: MongoDB Atlas (Free - 512MB)                   │
│   Redis: Upstash (Free - 10k commands/day)                 │
│                                                             │
│   Limitations:                                              │
│   - Render sleeps after 15 min inactivity                  │
│   - Need cron ping to keep alive OR upgrade                │
│   - ~50 concurrent WhatsApp sessions max                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Environment Variables
```bash
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...

# JWT
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourapp@gmail.com
SMTP_PASS=app_password

# Telegram
TELEGRAM_BOT_TOKEN=xxx

# Encryption
ENCRYPTION_KEY=32_byte_hex_key

# Frontend URL
FRONTEND_URL=https://yourapp.vercel.app
```

---

## Future Enhancements

| Feature | Description |
|---------|-------------|
| Message Variables | `{name}`, `{date}` placeholders |
| Media Messages | Send images, documents |
| Group Support | Send to WhatsApp/Telegram groups |
| Webhook Integration | Trigger messages via webhook |
| Analytics Dashboard | Charts, trends, insights |
| Mobile App | React Native companion app |
| Slack/Discord | Additional platform support |

---

## Project Structure

```
message-scheduler/
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── platforms/
│   │   │   │   ├── schedules/
│   │   │   │   ├── templates/
│   │   │   │   └── logs/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn components
│   │   │   ├── forms/
│   │   │   ├── dashboard/
│   │   │   └── platforms/
│   │   ├── lib/
│   │   │   ├── api.ts          # API client
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── store/              # Zustand stores
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── backend/                     # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── agenda.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── platform.controller.ts
│   │   │   ├── schedule.controller.ts
│   │   │   └── template.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── platform.model.ts
│   │   │   ├── schedule.model.ts
│   │   │   └── log.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── platform.routes.ts
│   │   │   └── schedule.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── telegram.service.ts
│   │   │   └── scheduler.service.ts
│   │   ├── jobs/
│   │   │   └── message.job.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml           # Local development
├── .env.example
├── implementation.md            # This file
└── README.md
```

---

## Development Phases

### Phase 1: Foundation
- [ ] Setup project structure (monorepo)
- [ ] Backend: Express + MongoDB + Basic auth
- [ ] Frontend: Next.js + Tailwind + Auth pages
- [ ] Database models setup

### Phase 2: Platform Integration
- [ ] Email service (Nodemailer)
- [ ] Telegram bot integration
- [ ] WhatsApp integration (whatsapp-web.js)
- [ ] Platform verification flows

### Phase 3: Scheduling
- [ ] Agenda.js setup
- [ ] Schedule CRUD operations
- [ ] Cron job execution
- [ ] Logging system

### Phase 4: Dashboard & Polish
- [ ] Dashboard UI
- [ ] Schedule management UI
- [ ] Logs & history
- [ ] Testing & bug fixes

### Phase 5: Deployment
- [ ] Environment setup
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring setup

---

## Summary

This Message Scheduler application is a full-stack SaaS product that enables users to automate messages across Email, WhatsApp, and Telegram.

**Key Technical Challenges:**
- WhatsApp session management per user
- Multi-tenant job scheduling
- Real-time QR code updates via WebSocket

**MVP Scope:**
- User authentication
- Email, WhatsApp, Telegram integration
- Basic scheduling (daily cron)
- Simple dashboard

**Start simple, iterate based on usage patterns.**
