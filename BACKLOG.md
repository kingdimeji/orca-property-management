# Orca Property Management - Backlog

**Last Updated**: February 18, 2026
**Next Milestone**: Week 1 - Paystack Integration (Payment Gateway)

> **See [ROADMAP.md](ROADMAP.md) for strategic vision, pricing strategy, market positioning, and success metrics**

> **Key Insight from Competitive Analysis**: We have a solid foundation with better design than competitors, but we're missing 3 CRITICAL features that EVERY competitor has: Payment Collection, Financial Reports, and Tenant Portal. These are P0 blockers preventing market launch.

## 📊 Current Status

**Completed**:
- ✅ Core property/unit/tenant/lease management
- ✅ Full CRUD operations (Edit/Delete with confirmations)
- ✅ Multi-currency support (UNIQUE advantage)
- ✅ User settings page (profile, currency, password management)
- ✅ Automated lease expiry (daily cron job)
- ✅ Manual payment tracking (record payments, view history, track balances)
- ✅ Stripe-inspired modern design (Better than most competitors)
- ✅ Dashboard with statistics

**Critical Gaps** (vs Competitors):
- ❌ Payment collection (100% of competitors have this)
- ❌ Financial reports (100% of competitors have this)
- ❌ Tenant portal (90% of competitors have this)
- ❌ Maintenance management (80% of competitors have this)

**Competitive Advantages** (Features we have that competitors don't):
- ✅ Multi-currency support (NGN/GBP/NOK) - NOBODY else has this
- ✅ Modern Stripe-inspired design - Better UX than all Nigerian competitors
- ✅ Built for Nigerian market - Can add local features global players can't

**See [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) for full market research**
**See [ROADMAP.md](ROADMAP.md) for detailed development timeline**

---

## 🔴 Critical / Bugs

### Form Alignment Issues ✅ FIXED
- **Status**: ✅ Resolved
- **Description**: Select dropdowns and textarea elements appeared next to labels instead of below them
- **Affected Areas**:
  - Create Tenant form (ID Type dropdown)
  - Create Property form (Property Type dropdown, Description textarea)
  - Create Unit modal (Description textarea)
- **Fix**: Added `display: block` and `width: 100%` to select/textarea CSS in globals.css
- **Date Fixed**: 2026-02-13

---

## ⚡ BLOCKING MARKET ENTRY - P0 Features

> Based on competitive analysis: These features are available in ALL competitors. We cannot launch without them.

### 1. Payment Collection & Processing ⚡ WEEK 1
- **Status**: 🟡 Partially Complete (Manual tracking done, Paystack integration pending)
- **Priority**: 🔴 P0 - CRITICAL GAP
- **Impact**: Every single competitor has this
- **Timeline**: Week 1 (2-3 days remaining)
- **Tasks**:
  - [ ] Integrate Paystack (primary for Nigeria) - NEXT
  - [x] Manual payment recording ✅ (Feb 18, 2026)
  - [x] Payment history tracking ✅ (Feb 18, 2026)
  - [x] Payment status dashboard ✅ (Feb 18, 2026)
  - [x] Outstanding balance calculations ✅ (Feb 18, 2026)
  - [ ] Payment webhooks handling - NEXT
- **Dependencies**: None - can start Paystack immediately
- **Blockers**: None
- **Success Criteria**: Landlords can record and track all rent payments ✅ + Online payment processing via Paystack

### 2. Financial Reporting ⚡ WEEK 2
- **Status**: Not Started
- **Priority**: 🔴 P0 - CRITICAL GAP
- **Impact**: Market expectation, needed for taxes
- **Timeline**: Week 2 (4-5 days)
- **Tasks**:
  - [ ] Expense tracking interface
  - [ ] Income reports (monthly, YTD)
  - [ ] Profit/loss statements
  - [ ] Export to CSV/PDF
  - [ ] Expense categorization
- **Dependencies**: Payment collection must be done first
- **Success Criteria**: Complete financial overview available

### 3. Tenant Portal (Basic) ⚡ WEEK 3
- **Status**: Not Started
- **Priority**: 🔴 P0 - CRITICAL GAP
- **Impact**: All major competitors have tenant portals
- **Timeline**: Week 3 (5-7 days)
- **Tasks**:
  - [ ] Tenant authentication flow
  - [ ] Tenant dashboard
  - [ ] View lease details
  - [ ] View payment history
  - [ ] Submit maintenance requests
  - [ ] Initiate online payments
- **Dependencies**: Payment system must exist
- **Success Criteria**: Tenants can self-serve basic tasks

---

## 🟡 High Priority - Competitive Advantages (P1)

### 4. Nigerian Payment Ecosystem (WEEK 4)
- **Status**: Not Started
- **Priority**: 🟡 P1 - DIFFERENTIATOR
- **Impact**: Better than Nigerian competitors, more relevant than global players
- **Timeline**: Week 4 (3-5 days)
- **Tasks**:
  - [ ] Flutterwave integration (secondary payment provider)
  - [ ] Service charge tracking (Nigerian estates)
  - [ ] Agent commission calculator
  - [ ] Naira-specific formatting
  - [ ] Payment reminders (email + SMS)
- **Dependencies**: Paystack integration complete
- **Success Criteria**: Multi-provider support, Nigerian-specific features working

### 5. WhatsApp Integration (WEEK 5) 🇳🇬 UNIQUE
- **Status**: Not Started
- **Priority**: 🟡 P1 - UNIQUE DIFFERENTIATOR
- **Impact**: No competitor has this
- **Timeline**: Week 5 (4-6 days)
- **Tasks**:
  - [ ] WhatsApp Business API setup
  - [ ] Payment reminders via WhatsApp
  - [ ] Maintenance notifications
  - [ ] Lease renewal reminders
  - [ ] Two-way communication (optional)
- **Dependencies**: Payment and maintenance systems
- **Success Criteria**: Automated WhatsApp notifications working

### 6. Estate/Compound Management (WEEK 6) 🇳🇬 UNIQUE
- **Status**: Not Started
- **Priority**: 🟡 P1 - NIGERIAN MARKET FIT
- **Impact**: Common in Nigerian real estate
- **Timeline**: Week 6 (4-5 days)
- **Tasks**:
  - [ ] Estate grouping feature
  - [ ] Estate-wide announcements
  - [ ] Shared facilities tracking
  - [ ] Caretaker/staff management
  - [ ] Nigerian legal templates
- **Dependencies**: Basic features complete
- **Success Criteria**: Estate management fully functional

### 7. Maintenance Management (WEEK 7)
- **Status**: Not Started
- **Priority**: 🟡 P1 - MARKET STANDARD
- **Impact**: Most competitors have this
- **Timeline**: Week 7 (5-6 days)
- **Tasks**:
  - [ ] Full request lifecycle (pending → completed)
  - [ ] Vendor management
  - [ ] Cost tracking
  - [ ] Priority levels
  - [ ] Photo uploads
- **Dependencies**: Tenant portal basic version
- **Success Criteria**: Complete maintenance workflow

---

## 🟢 Medium Priority - Enhanced Features (P2)

### 8. Reusable Form Components
- **Goal**: Eliminate code duplication and ensure consistency
- **Tasks**:
  - [ ] Create `FormField` component
  - [ ] Create `FormModal` component
  - [ ] Create `FormSection` component
  - [ ] Migrate existing forms
- **Timeline**: 2-3 hours
- **Priority**: Technical debt reduction

### 9. React Hook Form + Zod Validation
- **Goal**: Better form state management
- **Tasks**:
  - [ ] Set up Zod schemas
  - [ ] Migrate to React Hook Form
  - [ ] Add validation feedback
- **Timeline**: 3-4 hours
- **Priority**: UX improvement

### 10. E2E Testing (Playwright)
- **Goal**: Prevent regressions
- **Tasks**:
  - [ ] Install Playwright
  - [ ] Write critical path tests
  - [ ] CI/CD integration
- **Timeline**: 2-3 hours
- **Priority**: Quality assurance

### 11. Document Storage (WEEK 8)
- **Status**: Not Started
- **Priority**: 🟢 P2 - NICE TO HAVE
- **Impact**: Most competitors have this
- **Timeline**: Week 8 (4-5 days)
- **Tasks**:
  - [ ] Cloud storage setup (S3/R2)
  - [ ] File upload component
  - [ ] Document categorization
  - [ ] View/download documents
  - [ ] Document expiry tracking
- **Success Criteria**: Users can upload and organize all documents

### 12. Communication Tools (WEEK 9)
- **Status**: Not Started
- **Priority**: 🟢 P2 - NICE TO HAVE
- **Timeline**: Week 9 (3-4 days)
- **Tasks**:
  - [ ] In-app messaging
  - [ ] Broadcast announcements
  - [ ] Email templates
  - [ ] Message notifications
- **Success Criteria**: Landlord-tenant communication streamlined

---

## 🔵 Low Priority / Future Features (P3)

### 13. Mobile Progressive Web App (WEEKS 10-11)
- **Status**: Not Started
- **Priority**: 🟡 P1 (HIGH impact, deferred until core features complete)
- **Impact**: HIGH - Mobile usage dominates in African markets
- **Timeline**: Weeks 10-11 (8-10 days)
- **Tasks**:
  - [ ] PWA configuration
  - [ ] Service worker setup
  - [ ] Offline functionality
  - [ ] Push notifications
  - [ ] Mobile UI optimization
  - [ ] Camera integration
- **Dependencies**: Core features must be mobile-responsive first
- **Success Criteria**: App installable on mobile, works offline

### 14. AI-Powered Insights (WEEKS 12-13) 🔮
- **Status**: Not Started
- **Priority**: 🔵 P3 - FUTURE INNOVATION
- **Impact**: Emerging trend, few competitors have this
- **Timeline**: Weeks 12-13 (7-9 days)
- **Tasks**:
  - [ ] Rent optimization engine
  - [ ] Maintenance cost predictions
  - [ ] Tenant churn risk scoring
  - [ ] Cash flow projections
  - [ ] Smart recommendations
- **Dependencies**: Need historical data first
- **Success Criteria**: AI recommendations provide actionable value

### 15. Component Library Documentation (Storybook)
- **Priority**: 🔵 P3 - DEVELOPER EXPERIENCE
- **Timeline**: 3-4 hours
- **Tasks**:
  - [ ] Install Storybook
  - [ ] Document all UI components
  - [ ] Add component variants
  - [ ] Visual regression testing
- **Benefits**: Better documentation, catch visual bugs

### 16. Dashboard Enhancements
- **Priority**: 🔵 P3 - POLISH
- **Timeline**: 4-6 hours
- **Tasks**:
  - [ ] Income trend charts
  - [ ] Vacancy visualization
  - [ ] Lease expiration widget
  - [ ] Activity feed
- **Dependencies**: Enough data to visualize

### 17. Advanced Analytics (WEEK 14)
- **Priority**: 🟢 P2 - NICE TO HAVE
- **Timeline**: Week 14 (4-5 days)
- **Tasks**:
  - [ ] Portfolio analytics dashboard
  - [ ] Custom report builder
  - [ ] Tax-ready reports
  - [ ] ROI calculations
  - [ ] Automated report scheduling
- **Dependencies**: Financial data from multiple months

---

## 📋 Technical Debt

### Code Quality Improvements
- [ ] Add TypeScript strict mode
- [ ] Set up ESLint rules
- [ ] Add Prettier for consistent formatting
- [ ] Add pre-commit hooks (Husky)
- [ ] Improve error handling across API routes
- [ ] Add proper logging

### Performance
- [ ] Add database indexes for common queries
- [ ] Implement pagination for large lists
- [ ] Add caching for dashboard stats
- [ ] Optimize images

### Security
- [ ] Add rate limiting to API routes
- [ ] Add CSRF protection
- [ ] Add input sanitization
- [ ] Review and fix SQL injection risks
- [ ] Add proper error messages (don't leak sensitive info)

---

## ✅ Completed

### Core Features (Initial Build)
- [x] Initial project setup (Next.js, Prisma, NextAuth)
- [x] Database schema design
- [x] Authentication (signup/login)
- [x] Dashboard with stats
- [x] Properties management (CRUD)
- [x] Units management
- [x] Tenants management
- [x] Leases management
- [x] Stripe-inspired design overhaul
- [x] Fix light text issue in forms

### February 13, 2026 - CRUD Operations & Settings
- [x] Edit operations for all resources (properties, units, tenants, leases)
- [x] Delete operations with confirmation dialogs
- [x] Reusable ConfirmDialog component
- [x] Cascade delete warnings
- [x] User settings page (profile, regional settings, security)
- [x] Password change functionality with bcrypt validation
- [x] Multi-currency support in settings (NGN/GBP/NOK)

### February 13, 2026 - Automation
- [x] Automated lease expiry system (Vercel cron job)
- [x] Daily cron job to update ACTIVE → EXPIRED leases
- [x] Auto-update unit status to VACANT when lease expires
- [x] Transaction support for lease/unit status sync

### February 18, 2026 - Payment Tracking (Manual)
- [x] Payment API endpoints (POST, GET, PATCH, DELETE)
- [x] Record Payment modal with comprehensive fields
- [x] Payment history table with status badges
- [x] Payment summary metrics (total paid, outstanding, next due)
- [x] Payment status tracking (PAID, PENDING, OVERDUE, PARTIAL, CANCELLED)
- [x] Late fee tracking
- [x] Payment method dropdown (Bank Transfer, Cash, Check, Mobile Money, Paystack, Other)
- [x] Reference/transaction ID recording
- [x] Payment notes field
- [x] Integration with lease cards (active and past)
- [x] Currency-aware payment display
- [x] Authorization through ownership chain (payment → lease → unit → property)
- [x] TypeScript types for payment operations

---

## 📝 Notes

### Design System
- **Primary Color**: `#635bff` (Stripe purple)
- **Dark Color**: `#0a2540` (Navy blue)
- **Error Color**: `#df1b41` (Red)
- **Success Color**: `#00d4aa` (Green)
- **Gray Scale**: `#f7fafc` → `#0a2540`

### Current Focus (Based on Competitive Analysis)

**IMMEDIATE** (This Week):
1. Fix form issues (waiting for user's list)
2. Then START Week 1: Payment Integration (Paystack)

**SHORT-TERM** (Weeks 1-3):
1. Week 1: Payment Collection ⚡
2. Week 2: Financial Reports ⚡
3. Week 3: Tenant Portal ⚡

**MEDIUM-TERM** (Weeks 4-9):
1. Nigerian differentiation (Paystack, WhatsApp, Estate features)
2. Maintenance management
3. Document storage
4. Communication tools

**LONG-TERM** (Weeks 10-16+):
1. Mobile PWA
2. AI-powered insights
3. Advanced analytics
4. Launch preparation

### Priority Framework (From Competitive Analysis)

**P0 - BLOCKING MARKET ENTRY**:
- Payment Collection, Financial Reports, Tenant Portal
- Cannot launch without these - ALL competitors have them

**P1 - COMPETITIVE ADVANTAGE**:
- Nigerian features (Paystack, WhatsApp, Estate mgmt)
- These make us BETTER than Nigerian competitors
- These make us MORE RELEVANT than global players

**P2 - NICE TO HAVE**:
- Features that improve UX but aren't blockers
- Document storage, communication tools, analytics

**P3 - FUTURE INNOVATION**:
- AI features, advanced analytics
- Differentiate when we have scale
- Need data/users first

### Key Insights from Competitive Analysis

1. **Multi-Currency is UNIQUE** - No competitor offers NGN/GBP/NOK support
2. **Design is an Advantage** - Our Stripe-inspired UI beats all Nigerian competitors
3. **Payment is #1 Gap** - 100% of competitors have payment collection
4. **Mobile is Critical** - Especially in African markets
5. **Freemium Works** - Innago, Landlord Studio, TenantCloud all successful with free tiers
6. **WhatsApp is Differentiator** - No competitor offers this, huge opportunity
7. **Price Transparency** - Nigerian competitors hide pricing, we can win here

### Decision Log
- **2026-02-13**: Completed comprehensive competitive analysis
- **2026-02-13**: Identified payment collection as #1 critical gap
- **2026-02-13**: Revised roadmap to prioritize P0 features first
- **2026-02-13**: Chose Stripe-inspired design over other alternatives
- **2026-02-13**: Decided to do design overhaul before tenant portal
- **2026-02-13**: Identified need for better workflow to prevent breaking changes
- **2026-02-13**: Confirmed multi-currency as unique strategic advantage
