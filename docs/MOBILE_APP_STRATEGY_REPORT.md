# Atopary Properties — Mobile App Strategy Report

**Generated:** 2026-03-19
**Project:** Atopary Properties — Premium Real Estate Platform (Ghana)
**Repository:** https://github.com/PeterAforo/atopary.git

---

## 1. Executive Summary

Atopary Properties is a full-stack real estate web platform for the Ghanaian market. Buyers browse/search/inquire about properties, sellers list and manage properties, and admins oversee users, CMS, inquiries, and mortgage applications.

**Primary Recommendation:** React Native with Expo — shares TypeScript, React patterns, Zod validation, and utility logic with the existing Next.js app. Single codebase for iOS + Android.

**Secondary Recommendation:** Capacitor — fastest path to app stores by wrapping the existing responsive web app in a native shell.

**Estimated Timeline:** 12–19 weeks (solo developer) or 8–12 weeks (2-person team).

---

## 2. Web App Analysis

### 2.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion, GSAP + ScrollTrigger |
| State | React Hook Form + Zod, useState/useEffect |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL (Neon) via Prisma 7 ORM |
| Auth | NextAuth.js v4 (CredentialsProvider, JWT) |
| File Upload | Uploadthing (configured, keys pending) |
| Deployment | Vercel |

### 2.2 Feature Inventory

| Feature | Type | API | Device HW |
|---------|------|-----|-----------|
| Landing page (Hero, Featured, Services, Testimonials) | UI + API | Yes | No |
| Property listing (search, filters, pagination, grid/list) | UI + API | Yes | No |
| Property detail (gallery, lightbox, inquiry form) | UI + API | Yes | No |
| Mortgage calculator | Pure UI logic | No | No |
| Mortgage application | API | Yes | No |
| User registration & login | API | Yes | Biometrics potential |
| Profile management (view/edit, password change) | API | Yes | Camera (avatar) |
| Seller dashboard (stats, properties, inquiries) | API | Yes | No |
| Buyer dashboard (stats, inquiries, mortgages) | API | Yes | No |
| Admin dashboard (stats, users, properties, CMS, inquiries) | API | Yes | No |
| Property creation with image upload | API | Yes | Camera, Gallery |
| Contact form | API | Yes | No |
| About page | Static UI | No | No |

### 2.3 API Endpoints Catalog

| Endpoint | Methods | Auth | Role |
|----------|---------|------|------|
| `/api/properties` | GET, POST | POST: Seller/Admin | Public GET |
| `/api/properties/[id]` | GET, PUT, DELETE | PUT/DEL: Owner/Admin | Public GET |
| `/api/inquiries` | GET, POST | All authenticated | Role-scoped GET |
| `/api/inquiries/[id]` | PUT | Seller/Admin | Owner check |
| `/api/mortgage` | GET, POST | Authenticated | Buyer-scoped GET |
| `/api/mortgage/[id]` | PUT | Admin only | — |
| `/api/contact` | POST | Public | — |
| `/api/profile` | GET, PUT | Authenticated | Self only |
| `/api/auth/register` | POST | Public | — |
| `/api/auth/[...nextauth]` | GET, POST | Public | — |
| `/api/admin/stats` | GET | Admin | — |
| `/api/admin/users` | GET | Admin | — |
| `/api/admin/users/[id]` | PUT, DELETE | Admin | — |
| `/api/admin/cms` | GET, POST | Admin | — |
| `/api/admin/cms/[id]` | PUT, DELETE | Admin | — |
| `/api/seller/stats` | GET | Seller/Admin | — |
| `/api/buyer/stats` | GET | Authenticated | — |
| `/api/uploadthing` | GET, POST | Authenticated | — |

### 2.4 Authentication Flow

- CredentialsProvider only (email + password) — no social OAuth
- JWT strategy with 30-day session maxAge
- Session stored in HTTP-only cookies (managed by NextAuth)
- Role embedded in JWT token (ADMIN, SELLER, BUYER)
- No refresh token rotation — JWT is self-contained
- No CORS configuration (same-origin via Next.js)

### 2.5 Business Logic Location

Server-heavy: All CRUD operations, authorization checks, and data transformations happen in API routes. Client has validation (Zod) and UI state only.

### 2.6 Shared Pure Functions (in `src/lib/utils.ts`)

- `formatCurrency()` — GHS formatting
- `formatDate()` — date formatting
- `slugify()` — text to URL slug
- `calculateMortgage()` — mortgage payment calculator
- `checkMortgageEligibility()` — DTI ratio check
- `truncateText()` — text truncation
- `getPropertyTypeLabel()` — enum to label mapping
- `getStatusColor()` — status to CSS class mapping
- `cn()` — Tailwind class merge

### 2.7 Shared Validation Schemas (in `src/lib/validations.ts`)

- `loginSchema`, `registerSchema`, `propertySchema`
- `inquirySchema`, `mortgageCalculatorSchema`, `mortgageApplicationSchema`
- `contactSchema`

All written in Zod — directly reusable in React Native.

---

## 3. Technology Recommendation

### 3.1 Ranking (Most to Least Recommended)

| Rank | Approach | Score | Rationale |
|------|----------|-------|-----------|
| 1 | **React Native (Expo)** | 9.5/10 | Same language (TS), same patterns (React, Zod, RHF), max code reuse |
| 2 | Capacitor | 7/10 | Fastest path but WebView performance limits, not truly native feel |
| 3 | Flutter | 6.5/10 | Great performance but requires Dart, zero code sharing |
| 4 | KMM | 4/10 | Requires Kotlin, no web code reuse, complex setup |
| 5 | Native (Kotlin+Swift) | 3/10 | Two codebases, highest cost, no code sharing |

### 3.2 Primary: React Native with Expo

**Why this is the best fit:**

1. **Language match:** Existing codebase is 100% TypeScript — team already knows it
2. **Pattern match:** React components, hooks, React Hook Form, Zod — all transfer directly
3. **Code reuse:** Validation schemas (`validations.ts`), utility functions (`utils.ts`), TypeScript types — all shareable via a monorepo
4. **Expo ecosystem:** Managed workflow handles camera, push notifications, file system, biometrics, OTA updates without native module complexity
5. **Single codebase:** One React Native project deploys to both iOS and Android
6. **NativeWind:** Tailwind CSS syntax works in React Native — team's styling knowledge transfers
7. **Community:** Largest cross-platform community, extensive library ecosystem

**Tradeoffs:**
- Not pixel-perfect native UI by default (but NativeWind + custom components close the gap)
- Some complex native features may need ejecting from Expo managed workflow

### 3.3 Secondary: Capacitor

**When to choose this instead:**
- If the goal is app store presence in < 4 weeks
- If the web app is already fully responsive and mobile-optimized
- If performance demands are modest (property browsing, not real-time heavy)

---

## 4. Architecture Blueprint

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────┐
│                   Clients                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Web App  │  │ iOS (Expo)   │  │ Android   │ │
│  │ Next.js  │  │ React Native │  │ (Expo)    │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬─────┘ │
│       │               │                │        │
└───────┼───────────────┼────────────────┼────────┘
        │               │                │
        ▼               ▼                ▼
┌─────────────────────────────────────────────────┐
│              API Layer (Next.js)                  │
│  /api/properties  /api/inquiries  /api/mortgage  │
│  /api/auth        /api/profile    /api/admin     │
│  /api/contact     /api/uploadthing               │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌───────────┐  ┌──────────┐
   │ Neon PG │  │Uploadthing│  │ Firebase │
   │ Database│  │ (Storage) │  │ (FCM/APNs│
   └─────────┘  └───────────┘  │ Analytics│
                               └──────────┘
```

### 4.2 Mobile App Data Flow

```
User Action → Screen Component → API Service (fetch + token)
                                        │
                                        ▼
                              Next.js API Route
                                        │
                                        ▼
                              Prisma ORM → PostgreSQL
                                        │
                                        ▼
                              JSON Response → TanStack Query Cache
                                        │
                                        ▼
                              Screen Component Re-render
```

### 4.3 Authentication Flow (Mobile)

```
1. User enters email + password
2. App calls POST /api/auth/callback/credentials
3. Server validates, returns JWT in Set-Cookie
4. Mobile client extracts token, stores in expo-secure-store
5. All subsequent requests include Authorization: Bearer <token>
6. On 401 response → redirect to login screen
7. Biometric unlock → retrieve stored token without re-login
```

**Key change needed:** NextAuth currently uses HTTP-only cookies. Mobile apps need a token-based flow. See Section 6 for the full auth strategy.

### 4.4 Navigation Architecture

```
Root Navigator (Stack)
├── Auth Stack (unauthenticated)
│   ├── Login Screen
│   ├── Register Screen
│   └── Forgot Password Screen
│
├── Main Tab Navigator (authenticated)
│   ├── Home Tab (Stack)
│   │   ├── Home / Featured Properties
│   │   ├── Property Detail
│   │   └── Inquiry Form
│   │
│   ├── Search Tab (Stack)
│   │   ├── Property Listing (filters, search)
│   │   └── Property Detail
│   │
│   ├── Dashboard Tab (Stack) — role-based
│   │   ├── [Buyer] My Inquiries, My Mortgages
│   │   ├── [Seller] My Properties, Add Property, Inquiries
│   │   └── [Admin] Stats, Users, Properties, CMS
│   │
│   ├── Notifications Tab
│   │   └── Notification List
│   │
│   └── Profile Tab (Stack)
│       ├── Profile View/Edit
│       ├── Change Password
│       └── Settings / Preferences
│
└── Modals
    ├── Mortgage Calculator
    ├── Image Viewer / Lightbox
    └── Contact Form
```

### 4.5 Deep Linking Scheme

| URL Pattern | Mobile Screen |
|------------|---------------|
| `atopary://properties/:slug` | Property Detail |
| `atopary://profile` | Profile Screen |
| `atopary://dashboard` | Dashboard (role-based) |
| `atopary://inquiries/:id` | Inquiry Detail |
| `atopary://mortgage/apply` | Mortgage Application |

---

## 5. API Readiness & Gap Analysis

### 5.1 Existing Endpoints Assessment

| Endpoint | Mobile Ready? | Issue | Priority |
|----------|--------------|-------|----------|
| `GET /api/properties` | ✅ READY | Has pagination, search, filters | — |
| `GET /api/properties/[id]` | ✅ READY | Returns full detail with images | — |
| `POST /api/properties` | ✅ READY | Accepts JSON with images array | — |
| `PUT /api/properties/[id]` | ✅ READY | Owner/admin check works | — |
| `DELETE /api/properties/[id]` | ✅ READY | Owner/admin check works | — |
| `GET /api/inquiries` | ✅ READY | Role-scoped, paginated | — |
| `POST /api/inquiries` | ✅ READY | Standard JSON body | — |
| `PUT /api/inquiries/[id]` | ✅ READY | Seller/admin only | — |
| `GET /api/mortgage` | ✅ READY | Role-scoped, paginated | — |
| `POST /api/mortgage` | ✅ READY | Standard JSON body | — |
| `PUT /api/mortgage/[id]` | ✅ READY | Admin only | — |
| `POST /api/contact` | ✅ READY | Public, Zod validated | — |
| `GET /api/profile` | ✅ READY | Returns user data | — |
| `PUT /api/profile` | ✅ READY | Updates name, phone, avatar, password | — |
| `POST /api/auth/register` | ✅ READY | Zod validated | — |
| `POST /api/auth/callback/credentials` | ⚠️ NEEDS MODIFICATION | Cookie-based, needs token endpoint | CRITICAL |
| `GET /api/admin/stats` | ✅ READY | Admin role check | — |
| `GET /api/admin/users` | ✅ READY | Paginated, searchable | — |
| `PUT /api/admin/users/[id]` | ✅ READY | Role/status update | — |
| `DELETE /api/admin/users/[id]` | ✅ READY | Self-delete prevented | — |
| `GET /api/admin/cms` | ✅ READY | Returns all pages | — |
| `POST /api/admin/cms` | ✅ READY | Standard JSON | — |
| `PUT /api/admin/cms/[id]` | ✅ READY | Admin only | — |
| `DELETE /api/admin/cms/[id]` | ✅ READY | Admin only | — |
| `GET /api/seller/stats` | ✅ READY | Seller/admin role check | — |
| `GET /api/buyer/stats` | ✅ READY | Authenticated | — |
| `POST /api/uploadthing` | ⚠️ NEEDS MODIFICATION | Needs mobile multipart support | HIGH |

### 5.2 Missing Endpoints (New)

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/auth/mobile/login` | POST | Returns JWT token directly (not cookie) | CRITICAL |
| `/api/auth/mobile/refresh` | POST | Refresh JWT token before expiry | CRITICAL |
| `/api/auth/mobile/revoke` | POST | Invalidate refresh token on logout | HIGH |
| `/api/devices/register` | POST | Store FCM/APNs device token for push notifications | HIGH |
| `/api/devices/unregister` | DELETE | Remove device token on logout | HIGH |
| `/api/notifications/preferences` | GET, PUT | User notification opt-in/out preferences | MEDIUM |
| `/api/properties/favorites` | GET, POST, DELETE | Save/unsave favorite properties (new feature) | MEDIUM |
| `/api/health` | GET | Health check for mobile connectivity detection | LOW |
| `/api/app/version` | GET | Return minimum app version for forced updates | LOW |

### 5.3 Other API Concerns

- **No API versioning** — recommend adding `/api/v1/` prefix or `X-API-Version` header
- **No rate limiting** — recommend adding per-user/IP rate limits for mobile polling
- **No CORS config** — not needed for native apps, but needed if using Capacitor/WebView
- **No OpenAPI/Swagger spec** — recommend generating one from the route handlers
- **Pagination:** Offset-based (page + limit) — sufficient, but cursor-based preferred for infinite scroll

---

## 6. Authentication Strategy

### 6.1 Current Web Auth

- NextAuth.js CredentialsProvider with email/password
- JWT stored in HTTP-only cookie (30-day maxAge)
- Role embedded in JWT token
- No social login providers
- No refresh token rotation

### 6.2 Mobile Auth Design

#### 6.2.1 New Mobile Login Endpoint

```
POST /api/auth/mobile/login
Body: { email: string, password: string }
Response: {
  accessToken: string,    // JWT, 15-min expiry
  refreshToken: string,   // opaque token, 30-day expiry
  user: { id, name, email, role, avatar }
}
```

#### 6.2.2 Token Refresh

```
POST /api/auth/mobile/refresh
Body: { refreshToken: string }
Response: {
  accessToken: string,    // new JWT
  refreshToken: string    // rotated refresh token
}
```

#### 6.2.3 Token Storage

| Data | Storage | Why |
|------|---------|-----|
| Access token (JWT) | `expo-secure-store` | Encrypted, hardware-backed on iOS (Keychain) and Android (Keystore) |
| Refresh token | `expo-secure-store` | Must be stored securely — used to obtain new access tokens |
| User profile cache | MMKV | Fast key-value store for non-sensitive data |

#### 6.2.4 Biometric Authentication

1. After first successful login, prompt user to enable biometrics
2. Store credential reference in secure store linked to biometric
3. On app open, check for stored token → if valid, auto-login
4. If token expired, use `expo-local-authentication` to verify fingerprint/face
5. On success, use refresh token to get new access token
6. On failure, show login form

#### 6.2.5 Logout Flow

1. Call `POST /api/auth/mobile/revoke` with refresh token
2. Call `DELETE /api/devices/unregister` with device push token
3. Clear all tokens from `expo-secure-store`
4. Clear cached user data from MMKV
5. Navigate to login screen

#### 6.2.6 Apple Sign-In

**CRITICAL:** Apple Sign-In is **NOT currently required** because the web app has no social login providers. It only uses email/password via CredentialsProvider. However, if Google or Facebook OAuth is ever added, Apple Sign-In becomes **MANDATORY** for iOS App Store approval.

---

## 7. Push Notification Architecture

### 7.1 Notification Types

| Web Event | Mobile Push Notification |
|-----------|------------------------|
| New inquiry on seller's property | "New inquiry on [Property Title]" |
| Seller responds to buyer's inquiry | "Your inquiry received a response" |
| Property status changed (approved/rejected) | "Your property [Title] has been [status]" |
| Mortgage application status updated | "Your mortgage application status: [status]" |
| New property matching buyer's interests | "New property in [City]: [Title]" |
| Admin: new property pending review | "New property pending approval" |
| Admin: new mortgage application | "New mortgage application from [Name]" |

### 7.2 Architecture

```
Event Trigger (API Route) → Notification Service
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              FCM (Android)    APNs (iOS)     In-App Store
                    │               │               │
                    ▼               ▼               ▼
              Device Push     Device Push    Notification
              Notification    Notification   Center Screen
```

### 7.3 Recommended Service: Firebase Cloud Messaging (FCM)

- Free, handles both Android (native) and iOS (via APNs proxy)
- Integrates with `expo-notifications`
- Supports silent push for background data sync
- Topic-based messaging for role-specific notifications

### 7.4 Device Token Registration Flow

1. On app launch after login, request notification permission
2. Get device push token via `expo-notifications.getExpoPushTokenAsync()`
3. Call `POST /api/devices/register { token, platform: "ios"|"android" }`
4. Backend stores token in `device_tokens` table linked to user
5. On logout, call `DELETE /api/devices/unregister` to remove token

### 7.5 Notification Payload Schema

```json
{
  "title": "New Inquiry",
  "body": "John Doe inquired about Modern Villa in East Legon",
  "data": {
    "type": "INQUIRY_NEW",
    "resource_id": "inquiry_abc123",
    "deep_link": "atopary://inquiries/inquiry_abc123",
    "action": "VIEW"
  },
  "badge": 3,
  "sound": "default",
  "image": "https://images.unsplash.com/photo-123..."
}
```

### 7.6 Permission Request Strategy

Do NOT request notification permission on first app launch. Instead:
1. After user completes first meaningful action (e.g., submits an inquiry, lists a property)
2. Show an in-app "pre-permission" modal explaining the benefit
3. Only then trigger the OS permission dialog

---

## 8. Offline Support & Data Sync

### 8.1 Feature Classification

| Feature | Offline Mode |
|---------|-------------|
| Property listing (previously loaded) | CACHED_READ |
| Property detail (previously viewed) | CACHED_READ |
| Property search/filter | ONLINE_ONLY |
| Submit inquiry | OFFLINE_QUEUE (sync when online) |
| Mortgage calculator | OFFLINE_READ_WRITE (pure logic) |
| Submit mortgage application | ONLINE_ONLY |
| Dashboard stats | CACHED_READ |
| Profile view | CACHED_READ |
| Profile edit | OFFLINE_QUEUE |
| Property creation | ONLINE_ONLY |
| Contact form | OFFLINE_QUEUE |

### 8.2 Caching Strategy

| Data | Cache Duration | Storage |
|------|---------------|---------|
| Property list (page 1) | 10 minutes | TanStack Query in-memory + MMKV |
| Property detail | 30 minutes | TanStack Query + MMKV |
| User profile | Until logout | MMKV |
| Dashboard stats | 5 minutes | TanStack Query in-memory |
| Featured properties | 15 minutes | TanStack Query + MMKV |

### 8.3 Offline Queue

When offline, write operations are queued in MMKV:
1. User submits inquiry → saved to local queue with timestamp
2. Connectivity restored → queue replayed in order
3. On success → remove from queue, show confirmation
4. On failure → retry with exponential backoff (max 3 attempts)
5. On permanent failure → notify user

### 8.4 Connectivity Detection

- Use `@react-native-community/netinfo` to monitor network state
- Show a non-intrusive banner when offline: "You're offline. Some features are limited."
- Disable submit buttons for ONLINE_ONLY features when offline

---

## 9. Native Device Features Plan

### 9.1 Required Features

| Feature | Use Case | Expo Package | Permissions |
|---------|----------|-------------|-------------|
| **Camera** | Property photos (seller), avatar upload | `expo-image-picker` | iOS: `NSCameraUsageDescription` "Take photos of your property" / Android: `CAMERA` |
| **Photo Library** | Select existing images for listings | `expo-image-picker` | iOS: `NSPhotoLibraryUsageDescription` "Select property images from your library" / Android: `READ_MEDIA_IMAGES` |
| **Push Notifications** | Inquiry alerts, status updates | `expo-notifications` | iOS: Push notification entitlement / Android: `POST_NOTIFICATIONS` (API 33+) |
| **Biometric Auth** | Quick login with Face ID/fingerprint | `expo-local-authentication` | iOS: `NSFaceIDUsageDescription` "Use Face ID for quick sign-in" |
| **Geolocation** | Show properties on map, distance calc | `expo-location` | iOS: `NSLocationWhenInUseUsageDescription` "Find properties near you" / Android: `ACCESS_FINE_LOCATION` |
| **Share** | Share property listings via native share | `expo-sharing` or RN `Share` | None |
| **Deep Linking** | Open app from links, push notifications | `expo-linking` | None (URL scheme registration) |
| **Haptics** | Tactile feedback on actions | `expo-haptics` | None |
| **Clipboard** | Copy property link, contact info | `expo-clipboard` | None |
| **Secure Storage** | Token storage | `expo-secure-store` | None |

### 9.2 Optional / Future Features

| Feature | Use Case | Package |
|---------|----------|---------|
| Maps | Property location visualization | `react-native-maps` |
| Calendar | Schedule property viewings | `expo-calendar` |
| File Download | Download mortgage documents | `expo-file-system` |
| QR Scanner | Scan property QR codes | `expo-camera` (barcode) |

### 9.3 iOS Info.plist Permission Strings

```xml
<key>NSCameraUsageDescription</key>
<string>Atopary needs camera access to take photos of your property listings.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Atopary needs photo library access to select images for property listings.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Atopary uses your location to show nearby properties and calculate distances.</string>
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID for quick and secure sign-in to your Atopary account.</string>
```

---

## 10. Shared Code Strategy

### 10.1 Monorepo Structure

```
atopary/
├── apps/
│   ├── web/              ← existing Next.js app (move here)
│   └── mobile/           ← new React Native (Expo) app
│
├── packages/
│   ├── types/            ← shared TypeScript interfaces
│   │   ├── user.ts       (User, Role)
│   │   ├── property.ts   (Property, PropertyType, PropertyStatus)
│   │   ├── inquiry.ts    (Inquiry, InquiryStatus)
│   │   ├── mortgage.ts   (MortgageApplication, MortgageStatus)
│   │   └── index.ts
│   │
│   ├── validations/      ← shared Zod schemas
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── property.ts
│   │   ├── inquiry.ts
│   │   ├── mortgage.ts
│   │   ├── contact.ts
│   │   └── index.ts
│   │
│   ├── utils/            ← shared pure functions
│   │   ├── currency.ts   (formatCurrency)
│   │   ├── date.ts       (formatDate)
│   │   ├── mortgage.ts   (calculateMortgage, checkEligibility)
│   │   ├── text.ts       (slugify, truncateText)
│   │   ├── property.ts   (getPropertyTypeLabel, getStatusColor)
│   │   └── index.ts
│   │
│   └── config/           ← shared constants
│       ├── roles.ts
│       ├── property-types.ts
│       └── api-endpoints.ts
│
├── package.json          ← workspace root (pnpm/yarn workspaces)
├── turbo.json            ← Turborepo config
└── tsconfig.base.json
```

### 10.2 Directly Shareable Code

| Source File | Shared Package | Effort |
|-------------|---------------|--------|
| `src/lib/validations.ts` (all Zod schemas) | `packages/validations` | Copy, zero changes |
| `src/lib/utils.ts` — `formatCurrency`, `formatDate`, `slugify`, `calculateMortgage`, `checkMortgageEligibility`, `truncateText`, `getPropertyTypeLabel` | `packages/utils` | Copy, zero changes |
| `cn()` (clsx + twMerge) | Keep in each app | Different styling systems |
| `getStatusColor()` | `packages/utils` (return color values instead of Tailwind classes) | Minor refactor |
| Prisma-generated types | `packages/types` | Extract interfaces |
| Constants (property types, roles, cities) | `packages/config` | Copy |

### 10.3 Design Tokens

| Token | Web (Tailwind) | Mobile (NativeWind) |
|-------|---------------|-------------------|
| Primary Red | `#C41E24` | `#C41E24` |
| Secondary Black | `#1A1A1A` | `#1A1A1A` |
| White | `#FFFFFF` | `#FFFFFF` |
| Font | Geist (Google Fonts) | System font or bundled Geist |
| Border Radius | `rounded-xl` (12px) | 12 |
| Spacing Scale | Tailwind default | NativeWind default |

---

## 11. Backend Changes Required

### 11.1 Authentication (CRITICAL)

| Change | Endpoint | Schema |
|--------|----------|--------|
| Mobile login endpoint | `POST /api/auth/mobile/login` | Request: `{ email, password, deviceId? }` → Response: `{ accessToken, refreshToken, user }` |
| Token refresh | `POST /api/auth/mobile/refresh` | Request: `{ refreshToken }` → Response: `{ accessToken, refreshToken }` |
| Token revocation | `POST /api/auth/mobile/revoke` | Request: `{ refreshToken }` → Response: `{ success: true }` |

**Database addition:**
```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);
```

### 11.2 Push Notifications (HIGH)

| Change | Endpoint | Schema |
|--------|----------|--------|
| Register device | `POST /api/devices/register` | Request: `{ token, platform: "ios"|"android" }` |
| Unregister device | `DELETE /api/devices/:token` | — |
| Notification preferences | `GET /PUT /api/notifications/preferences` | `{ inquiries: bool, statusUpdates: bool, newProperties: bool, marketing: bool }` |

**Database addition:**
```sql
CREATE TABLE device_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inquiries BOOLEAN DEFAULT TRUE,
  status_updates BOOLEAN DEFAULT TRUE,
  new_properties BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE
);
```

**Backend integration:** Add `firebase-admin` SDK to send push notifications on:
- New inquiry created → notify property seller
- Inquiry response → notify buyer
- Property status change → notify seller
- Mortgage status change → notify buyer

### 11.3 API Enhancements (MEDIUM)

| Change | Details |
|--------|---------|
| Add API versioning | Prefix all routes with `/api/v1/` or accept `X-API-Version` header |
| Add health endpoint | `GET /api/health` → `{ status: "ok", timestamp }` |
| Add app version check | `GET /api/app/version` → `{ minVersion: "1.0.0", latestVersion: "1.2.0" }` |
| Add favorites feature | `POST/DELETE /api/properties/favorites` + `GET /api/properties/favorites` |
| Add rate limiting | Use `next-rate-limit` or Vercel's built-in Edge rate limiting |

### 11.4 File Handling (MEDIUM)

| Change | Details |
|--------|---------|
| Mobile file upload | Ensure Uploadthing accepts `multipart/form-data` from mobile (should work with `expo-image-picker` + `fetch`) |
| Image compression | Add server-side image resizing with `sharp` (already installed) for mobile uploads |
| Avatar upload | Add avatar upload to profile PUT endpoint (already supports `avatar` field) |

### 11.5 Security (LOW — for v2)

| Change | Details |
|--------|---------|
| Certificate pinning | Configure SSL pinning in Expo for production API calls |
| Rate limiting per device | Track request rates by device token |
| Sensitive re-auth | Require password re-entry for: email change, password change, account deletion |

---

## 12. App Store & Play Store Requirements

### 12.1 Apple App Store

**Account:** Apple Developer Program — $99/year

| Requirement | Status |
|-------------|--------|
| Apple Developer Account | NEEDED |
| App ID registered | NEEDED |
| Provisioning profiles | Auto-managed by Expo EAS |
| Privacy Policy URL | NEEDED (host on atopary.com/privacy) |
| App icon: 1024x1024px PNG, no alpha | NEEDED (generate from brand "A" icon) |
| Screenshots: 6.7", 6.5", 5.5" | NEEDED |
| App description (4000 chars max) | NEEDED |
| Keywords (100 chars max) | NEEDED |
| Support URL | atopary.com/contact |
| Age rating questionnaire | NEEDED |
| Export compliance (encryption) | Yes — uses HTTPS |
| Sign in with Apple | **NOT required** (no social login) |
| Demo account for App Review | admin@atopary.com / admin123 |
| TestFlight build | NEEDED before submission |

**Common rejection risks for Atopary:**
- Missing privacy policy
- Broken demo account during review
- App perceived as a "web browser wrapper" if Capacitor approach is used (not a risk with React Native)

### 12.2 Google Play Store

**Account:** Google Play Developer Account — $25 one-time

| Requirement | Status |
|-------------|--------|
| Play Console account | NEEDED |
| Privacy Policy URL | NEEDED |
| Data Safety section | NEEDED — must disclose: email, name, phone collected |
| App icon: 512x512px | NEEDED |
| Feature graphic: 1024x500px | NEEDED |
| Screenshots (min 2 phone) | NEEDED |
| Short description (80 chars) | NEEDED |
| Full description (4000 chars) | NEEDED |
| Content rating questionnaire | NEEDED |
| Target audience settings | Adults (real estate) |
| App signing (Play App Signing) | RECOMMENDED |
| Release tracks | Internal → Closed → Open → Production |
| Target API level | API 34+ (Android 14) |

**Data Safety declarations:**
- Personal info collected: Name, email, phone
- Location: approximate (city-based property search)
- Financial info: mortgage application data
- Data shared with third parties: None (or Uploadthing for images)
- Data encrypted in transit: Yes (HTTPS)
- Data deletion: User can request via contact

---

## 13. Recommended Tech Stack

### React Native (Expo) — Full Stack

| Category | Technology | Why |
|----------|-----------|-----|
| **Framework** | React Native + Expo SDK 52+ | Managed workflow, OTA updates, native APIs |
| **Language** | TypeScript | Matches web app |
| **Navigation** | React Navigation v7 (Stack + Tabs + Drawer) | Industry standard, deep linking support |
| **State (server)** | TanStack Query (React Query) v5 | Caching, background refetch, optimistic updates |
| **State (client)** | Zustand | Lightweight, matches React patterns |
| **API Client** | Axios with interceptors | Token refresh, error handling, retry logic |
| **Styling** | NativeWind v4 (Tailwind for RN) | Team already knows Tailwind |
| **UI Components** | Custom + React Native Paper or Tamagui | Material Design or cross-platform components |
| **Forms** | React Hook Form + Zod | Identical to web app |
| **Auth** | Custom JWT + `expo-secure-store` + `expo-local-authentication` | Secure token storage + biometrics |
| **Push Notifications** | `expo-notifications` + Firebase FCM | Cross-platform push |
| **Analytics** | Firebase Analytics or PostHog | User behavior tracking |
| **Crash Reporting** | Sentry for React Native | Error tracking, performance monitoring |
| **Maps** | `react-native-maps` | Property location display |
| **Image Handling** | `expo-image-picker` + `expo-image` | Camera, gallery, optimized display |
| **Local Storage** | MMKV (non-sensitive) + `expo-secure-store` (sensitive) | Fast KV store + encrypted store |
| **Testing** | Jest + React Native Testing Library + Detox | Unit, component, E2E |
| **OTA Updates** | Expo EAS Update | Push JS updates without app store review |
| **CI/CD** | Expo EAS Build + GitHub Actions | Cloud builds for iOS and Android |
| **Deep Linking** | Expo Linking + React Navigation linking | Universal links |

---

## 14. Implementation Roadmap

### Phase 0 — Pre-Development Preparation (1–2 weeks)

- [ ] Register Apple Developer Account ($99/year)
- [ ] Register Google Play Developer Account ($25 one-time)
- [ ] Set up Firebase project (FCM, Analytics)
- [ ] Implement backend changes: mobile login endpoint, refresh token, device registration
- [ ] Add `refresh_tokens` and `device_tokens` tables to Prisma schema
- [ ] Set up monorepo with Turborepo (or keep separate repo)
- [ ] Extract shared code into packages (validations, utils, types)
- [ ] Initialize Expo project: `npx create-expo-app atopary-mobile`
- [ ] Configure EAS Build: `eas init`
- [ ] Set up Sentry for React Native
- [ ] Design app icon (1024x1024) and splash screen using brand assets
- [ ] Configure deep linking scheme: `atopary://`

### Phase 1 — Foundation & Authentication (2–3 weeks)

- [ ] Project structure: folder layout, navigation scaffold, theme setup
- [ ] Design system: colors, typography, spacing tokens via NativeWind
- [ ] API client with Axios: base URL, interceptors, token refresh
- [ ] Secure token storage with `expo-secure-store`
- [ ] Login screen: email/password form with React Hook Form + Zod
- [ ] Registration screen: buyer/seller role selection
- [ ] Biometric authentication setup (Face ID / Fingerprint)
- [ ] Auth state management with Zustand
- [ ] Session persistence (auto-login on app open if token valid)
- [ ] Logout flow (revoke token, clear storage, unregister device)
- [ ] Tab navigator with role-based dashboard tab
- [ ] Deep link handler setup

### Phase 2 — Core Features (5–7 weeks)

**Week 1–2: Property Browsing**
- [ ] Home screen: featured properties, search bar, categories
- [ ] Property listing screen: infinite scroll, filters, search
- [ ] Property detail screen: image gallery, info, features, seller
- [ ] Image viewer / lightbox modal
- [ ] Share property via native share sheet

**Week 3: Inquiries & Mortgage**
- [ ] Inquiry submission form on property detail
- [ ] Inquiry list screen (buyer: my inquiries, seller: received)
- [ ] Inquiry response screen (seller)
- [ ] Mortgage calculator (port pure logic from web)
- [ ] Mortgage application form
- [ ] Mortgage application tracking screen

**Week 4–5: Dashboard Screens**
- [ ] Buyer dashboard: stats, recent inquiries, mortgages
- [ ] Seller dashboard: stats, properties, inquiries
- [ ] Seller: add property screen with image picker + upload
- [ ] Admin dashboard: stats overview
- [ ] Admin: user management list
- [ ] Admin: property moderation (approve/reject)

**Week 5–7: Profile & Notifications**
- [ ] Profile view screen
- [ ] Profile edit screen (name, phone, avatar with camera/gallery)
- [ ] Change password screen
- [ ] Push notification permission request flow
- [ ] Push notification handler (tap → deep link to relevant screen)
- [ ] Notification center / list screen
- [ ] Contact form screen
- [ ] About screen

### Phase 3 — Polish & UX (2–3 weeks)

- [ ] Skeleton loaders for all list screens
- [ ] Empty states (no properties, no inquiries, etc.)
- [ ] Error states with retry buttons
- [ ] Pull-to-refresh on all list screens
- [ ] Haptic feedback on key interactions
- [ ] Screen transition animations
- [ ] Splash screen finalization
- [ ] Offline banner ("You're offline")
- [ ] Connectivity-aware disabled states
- [ ] Accessibility: screen reader labels, tap target sizes
- [ ] Dark mode support (optional v1)
- [ ] App rating prompt after positive interactions
- [ ] Onboarding carousel for new users (optional v1)

### Phase 4 — Testing & QA (1–2 weeks)

- [ ] Unit tests: shared utils, validation schemas, API client
- [ ] Component tests: key screens (login, property detail, dashboard)
- [ ] Integration tests: auth flow, CRUD operations
- [ ] E2E tests with Detox: login → browse → inquire → logout
- [ ] Manual testing: iPhone SE, iPhone 15, Android budget + flagship
- [ ] Push notification E2E test
- [ ] Deep link testing from browser, email, push notification
- [ ] Offline mode testing: airplane mode, slow 3G
- [ ] Performance profiling: startup time, scroll FPS, memory
- [ ] Beta testing: TestFlight (iOS) + Play Store Internal Testing (Android)

### Phase 5 — App Store Launch (1–2 weeks)

- [ ] Generate production certificates (iOS) and keystore (Android) via EAS
- [ ] Build production releases via `eas build --platform all`
- [ ] Prepare App Store metadata: description, screenshots, keywords
- [ ] Prepare Play Store metadata: description, screenshots, Data Safety
- [ ] Upload to TestFlight for final internal review
- [ ] Submit to Apple App Review (1–3 day review cycle)
- [ ] Submit to Google Play Review (1–7 day review cycle)
- [ ] Staged rollout on Google Play (10% → 50% → 100%)
- [ ] Monitor Sentry crash reports post-launch
- [ ] Monitor Firebase Analytics for engagement
- [ ] Plan v1.1 based on user feedback

---

## 15. Cost & Effort Estimate

### 15.1 Project Size Classification

**MEDIUM** — 20–25 screens, role-based dashboards, file uploads, push notifications, mortgage calculator, CRUD operations.

### 15.2 Development Time

| Scenario | Total Duration |
|----------|---------------|
| Solo developer (experienced RN) | 12–19 weeks |
| 2-person team | 8–12 weeks |
| 3-person team (1 backend + 2 mobile) | 6–9 weeks |

### 15.3 Per-Phase Breakdown

| Phase | Solo Dev | 2-Person Team |
|-------|---------|---------------|
| Phase 0 — Preparation | 1–2 weeks | 1 week |
| Phase 1 — Foundation | 2–3 weeks | 1.5–2 weeks |
| Phase 2 — Core Features | 5–7 weeks | 3–4 weeks |
| Phase 3 — Polish | 2–3 weeks | 1.5–2 weeks |
| Phase 4 — Testing | 1–2 weeks | 1–2 weeks |
| Phase 5 — Launch | 1–2 weeks | 1–2 weeks |

### 15.4 Recurring Service Costs

| Service | Cost |
|---------|------|
| Apple Developer Program | $99/year |
| Google Play Developer | $25 one-time |
| Firebase (Spark plan) | Free (generous limits) |
| Expo EAS Build | Free tier: 30 builds/month; Pro: $29/month |
| Sentry | Free tier: 5K errors/month; Team: $26/month |
| Vercel (existing) | Free tier or Pro: $20/month |
| Neon PostgreSQL (existing) | Free tier or Pro |
| Uploadthing (existing) | Free tier: 2GB |
| **Total (minimum)** | **~$124/year + existing costs** |
| **Total (with paid tiers)** | **~$100/month + $124/year** |

### 15.5 Effort Multipliers

These features would significantly increase effort if added:
- Real-time chat between buyers and sellers: +3–4 weeks
- AR property visualization: +4–6 weeks
- Video calling for virtual tours: +3–4 weeks
- Complex offline sync (property creation offline): +2–3 weeks
- Multi-language (i18n) support: +1–2 weeks
- Payment integration (Paystack/Stripe): +2–3 weeks

---

## 16. 10 Immediate Next Steps

Start **this week** to begin building the mobile app:

1. **Register developer accounts** — Sign up for Apple Developer Program ($99) and Google Play Console ($25). Apple can take 24–48 hours to process.

2. **Create Firebase project** — Go to console.firebase.google.com, create "atopary-mobile", enable Cloud Messaging (FCM) and Analytics.

3. **Add mobile auth endpoints** — Create `POST /api/auth/mobile/login` and `POST /api/auth/mobile/refresh` in the existing Next.js backend. These return JWT tokens directly (not cookies).

4. **Add database tables** — Add `RefreshToken` and `DeviceToken` models to `prisma/schema.prisma`, run `prisma db push`.

5. **Initialize Expo project** — Run `npx create-expo-app@latest atopary-mobile --template blank-typescript` in the project root.

6. **Set up EAS Build** — Run `npx eas-cli init` and `eas build:configure` inside the mobile project.

7. **Extract shared code** — Copy `src/lib/validations.ts` and the pure functions from `src/lib/utils.ts` into a shared location (or npm package) that both web and mobile can import.

8. **Design app icon and splash** — Use the existing brand "A" logo (red #C41E24 on white) to create a 1024x1024 app icon and splash screen.

9. **Implement login screen** — Build the first mobile screen: email/password login using React Hook Form + Zod (identical validation to web), calling the new mobile auth endpoint.

10. **Set up Sentry** — Create a Sentry project for React Native, install `@sentry/react-native`, configure in the Expo app for crash reporting from day one.

---

*This report was generated by analyzing the Atopary Properties codebase at commit `772c5e1` on the `master` branch. All recommendations are grounded in the actual project architecture, dependencies, and feature set found in the repository.*
