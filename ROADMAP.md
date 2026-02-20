# Orca Property Management - Development Roadmap

**Last Updated**: February 20, 2026
**Version**: 3.1 (MVP Complete + Payment Categories - Mobile Optimization In Progress)

> **See [BACKLOG.md](BACKLOG.md) for detailed feature tasks and development tracking**
> **See [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) for full market research**

---

## 🎯 Vision

Build the best property management software for small landlords (1-10 units) in Nigeria, with expansion to UK and Norway markets. Combine modern design, local payment integration, and Nigerian-specific features to beat both global and local competitors.

---

## 🏆 Competitive Positioning

**Target Market**: Small residential landlords (1-10 units)
**Primary Geography**: Nigeria (NGN), with UK (GBP) and Norway (NOK) support
**Key Differentiators**:
1. Multi-currency support (UNIQUE in market)
2. Stripe-inspired modern design
3. Nigerian payment integration (Paystack/Flutterwave)
4. Transparent pricing
5. WhatsApp integration (coming soon)

---

## ✅ Completed (MVP Foundation)

### Phase 0: Foundation ✅
- [x] Project setup (Next.js 16 + TypeScript + Tailwind)
- [x] Database design (Prisma + PostgreSQL)
- [x] Authentication (NextAuth v5)
- [x] Multi-currency support (NGN, GBP, NOK)
- [x] Stripe-inspired design system

### Phase 1: Core Management ✅
- [x] Property management (CRUD)
- [x] Unit management with auto-status updates
- [x] Tenant management
- [x] Lease management with unit linking
- [x] Dashboard with real-time statistics
- [x] Modern, clean UI/UX
- [x] Full Edit/Delete operations for all resources (Feb 13, 2026)
- [x] Delete confirmations with cascade warnings (Feb 13, 2026)
- [x] User settings page (profile, currency, password) (Feb 13, 2026)
- [x] Automated lease expiry (daily cron job) (Feb 13, 2026)

**Status**: ✅ Foundation Complete + Production-Ready Features Added

---

## 🚀 Updated Development Roadmap

### Phase 2: Critical Market Parity (PRIORITY - Weeks 1-3)

> **Goal**: Close the critical gap - every competitor has payment collection. This is blocking us from being market-ready.

**Features**:
1. **Week 1: Payment Infrastructure** ✅ COMPLETE (Feb 18, 2026)
   - [x] Paystack integration for online payments ✅ (Feb 18, 2026)
   - [x] Manual payment recording ✅ (Feb 18, 2026)
   - [x] Payment history tracking ✅ (Feb 18, 2026)
   - [x] Payment dashboard with outstanding balances ✅ (Feb 18, 2026)

2. **Week 2: Financial Reporting** ✅ COMPLETE (Feb 19, 2026)
   - [x] Expense tracking with categories ✅ (Feb 19, 2026)
   - [x] Income reports (monthly, YTD) ✅ (Feb 19, 2026)
   - [x] Profit/loss statements ✅ (Feb 19, 2026)
   - [x] Export to CSV (expenses, income, full reports) ✅ (Feb 19, 2026)

3. **Week 3: Tenant Portal (Basic)** ✅ COMPLETE (Feb 19, 2026)
   - [x] Role-based authentication (Landlord/Tenant) ✅ (Feb 19, 2026)
   - [x] Invite-based tenant onboarding ✅ (Feb 19, 2026)
   - [x] Tenant dashboard with lease summary ✅ (Feb 19, 2026)
   - [x] View lease details and payment history ✅ (Feb 19, 2026)
   - [x] Submit maintenance requests ✅ (Feb 19, 2026)
   - [x] Email notifications (invites, payments, maintenance) ✅ (Feb 19, 2026)

**Status**: ✅ **MVP COMPLETE** - All P0 features delivered and deployed!

→ **Detailed tasks**: [BACKLOG.md - P0 Features](BACKLOG.md#⚡-blocking-market-entry---p0-features)

---

### Phase 3: Mobile & Post-MVP Enhancements (Weeks 4-7)

> **Goal**: Ensure mobile responsiveness (60%+ of Nigerian users are mobile-first), complete post-MVP features, then add Nigerian market differentiators.

**Features**:
1. **Week 4: Payment Categories + Mobile Responsiveness** 📱 CRITICAL
   - [x] Payment Categories & Types ✅ (Feb 20, 2026)
     - Added paymentType enum (RENT, ELECTRICITY, WATER, GAS, etc.)
     - Updated all payment forms and displays
     - Income breakdown by payment type in reports
     - CSV exports include payment type
   - [ ] Mobile Responsiveness (Basic) - IN PROGRESS
     - Responsive navigation and layouts
     - Touch-friendly buttons and forms
     - Mobile-optimized tables and cards
     - Test on mobile devices (iOS Safari, Android Chrome)
   - [ ] Link Expenses to Maintenance Requests
     - Track costs per maintenance request
     - View expense history for units/properties

2. **Week 5: Shared Property Expenses**
   - Expense allocation across units
   - Percentage-based or equal splitting
   - Track shared vs unit-specific costs
   - Generate expense reports per unit

3. **Week 6: Nigerian Payment Ecosystem**
   - Flutterwave integration (secondary provider)
   - Service charge tracking for estates
   - Agent commission calculator
   - Automated payment reminders (email + SMS)

4. **Week 7: WhatsApp Integration** 🇳🇬 UNIQUE
   - WhatsApp Business API setup
   - Automated notifications (payments, maintenance, lease renewals)
   - Two-way communication (optional)

**Success Criteria**: Basic mobile responsiveness complete, payment categories working, expense allocation functional, then Nigerian features implemented.

**Strategic Decision**: Prioritized mobile responsiveness NOW (Week 4) instead of deferring to Week 10 because Nigerian market is 60%+ mobile users. Building mobile-responsive now prevents massive refactoring later and ensures all future features are mobile-friendly from the start.

→ **Detailed tasks**: [BACKLOG.md - P1 Features](BACKLOG.md#🟡-high-priority---competitive-advantages-p1)

---

### Phase 4: Enhanced User Experience (Weeks 8-10)

> **Goal**: Polish the experience and add features that improve daily usage.

**Features**:
1. **Week 8: Maintenance Management (Full) + Estate Management** 🇳🇬
   - Complete request lifecycle (pending → in progress → completed)
   - Vendor management and assignment
   - Cost tracking and budget monitoring
   - Estate grouping and announcements
   - Shared facilities tracking
   - Caretaker/staff management

2. **Week 9: Document Management**
   - Cloud storage setup (S3/R2)
   - Document categorization (leases, IDs, receipts)
   - Upload, view, download, and expiry tracking
   - Nigerian legal templates

3. **Week 10: Communication Tools**
   - In-app messaging between landlords and tenants
   - Broadcast announcements
   - Email templates for common notifications

**Success Criteria**: Full maintenance workflow, estate management working, organized document storage, streamlined communication.

→ **Detailed tasks**: [BACKLOG.md - P1/P2 Features](BACKLOG.md#🟡-high-priority---competitive-advantages-p1)

---

### Phase 5: PWA & Advanced Features (Weeks 11-15)

> **Goal**: Add Progressive Web App capabilities and AI-powered insights.
>
> **Note**: Basic mobile responsiveness completed in Week 4. This phase focuses on PWA features like offline mode, installability, and push notifications.

**Features**:
1. **Weeks 11-12: Progressive Web App (PWA) Features**
   - PWA configuration with offline functionality
   - App installability (Add to Home Screen)
   - Camera integration for photo uploads
   - Push notifications for payments and maintenance
   - Service worker for caching

2. **Weeks 13-14: AI-Powered Insights** 🔮
   - Rent optimization and market rate analysis
   - Predictive analytics (maintenance costs, tenant churn)
   - Smart recommendations for lease renewal and property improvements

3. **Week 15: Analytics & Reporting**
   - Portfolio performance dashboard with ROI calculations
   - Custom report builder with scheduling
   - Tax-ready reports with expense categorization

**Success Criteria**: App installable on mobile with offline support, AI recommendations actionable, comprehensive analytics available.

→ **Detailed tasks**: [BACKLOG.md - P1/P2/P3 Features](BACKLOG.md#🟢-medium-priority---enhanced-features-p2)

---

### Phase 6: Scale & Optimize (Weeks 16-17+)

> **Goal**: Prepare for growth and optimize performance.

**Features**:
1. **Week 16: Performance & Security**
   - Database optimization and caching (Redis)
   - Security hardening (rate limiting, CSRF, input sanitization)
   - Error logging and monitoring (Sentry)

2. **Week 17: Testing & Launch Prep**
   - E2E tests with Playwright
   - Cross-browser and mobile testing
   - Production environment setup
   - Customer support and onboarding flow

**Success Criteria**: Page load < 2 seconds, security audit passed, 80%+ test coverage, production-ready.

→ **Detailed tasks**: [BACKLOG.md - Technical Debt](BACKLOG.md#📋-technical-debt)

---

## 📊 Feature Priority Matrix

| Feature | Competitors Have It? | Impact | Effort | Priority | Timeline |
|---------|---------------------|--------|--------|----------|----------|
| **Payment Collection** | ✅ ALL | 🔴 Critical | Medium | P0 | ✅ Week 1 |
| **Financial Reports** | ✅ ALL | 🔴 Critical | Medium | P0 | ✅ Week 2 |
| **Tenant Portal** | ✅ ALL | 🔴 Critical | High | P0 | ✅ Week 3 |
| **Payment Categories** | ⚠️ Some | 🟡 High | Low | P1 | ✅ Week 4 |
| **Mobile Responsiveness** | ✅ ALL | 🔴 Critical | Medium | P0 (MOVED UP) | 🔄 Week 4 |
| **Link Expenses to Maintenance** | ⚠️ Some | 🟢 Medium | Low | P1 | Week 4 |
| **Shared Property Expenses** | ⚠️ Few | 🟡 High | Medium | P1 | Week 5 |
| **Nigerian Payments** | ⚠️ Local Only | 🟡 High | Medium | P1 | Week 6 |
| **WhatsApp Integration** | ❌ UNIQUE | 🟢 Medium | Medium | P1 | Week 7 |
| **Maintenance Management (Full)** | ✅ Most | 🟡 High | Medium | P1 | Week 8 |
| **Estate Management** | ❌ UNIQUE | 🟢 Medium | Medium | P1 | Week 8 |
| **Document Storage** | ✅ Most | 🟢 Medium | Medium | P2 | Week 9 |
| **Communication Tools** | ✅ Most | 🟢 Medium | Low | P2 | Week 10 |
| **Mobile PWA Features** | ⚠️ Some | 🟡 High | High | P1 | Week 11-12 |
| **AI Insights** | ⚠️ Few | 🔵 Low | High | P3 | Week 13-14 |
| **Advanced Analytics** | ⚠️ Some | 🟢 Medium | Medium | P2 | Week 15 |

**Priority Levels**:
- **P0**: Blocking market entry - must have
- **P1**: Competitive advantage - should have
- **P2**: Nice to have - can wait
- **P3**: Future innovation - optional

---

## 💰 Pricing Strategy (Based on Competitive Analysis)

### Freemium Model (Recommended)

**Free Tier**: "Landlord Starter"
- 1-2 properties
- Up to 5 units
- Unlimited tenants
- Basic payment tracking
- Manual payment recording
- Basic reports
- Email support

**Paid Tier**: "Landlord Pro" - ₦5,000/month (~$12/month)
- Unlimited properties
- Unlimited units
- Online payment collection (Paystack/Flutterwave)
- Advanced financial reports
- WhatsApp notifications
- Document storage (10GB)
- Priority support
- Mobile app access

**Add-ons**:
- Extra storage: ₦1,000/month per 10GB
- SMS notifications: Pay-as-you-go
- Custom branding: ₦10,000/month

**Transaction Fees**: Alternative revenue model
- 1.5% on online payments (vs Paystack's 1.5%)
- Free for manual payment recording

**Competitive Positioning**:
- **vs Our Property NG (Free)**: Better features, support, and reliability
- **vs Hutstack/RentPro**: Transparent pricing, better UX
- **vs Global Players ($58/month)**: 5x cheaper, Nigerian-optimized

---

## 🎯 Success Metrics & KPIs

### Product Metrics
- [ ] Feature parity with top 3 competitors
- [ ] Payment processing success rate > 95%
- [ ] App uptime > 99.5%
- [ ] Mobile responsive score > 90/100
- [ ] Page load time < 2 seconds

### User Metrics
- [ ] 100 landlords in first 3 months
- [ ] 500 properties managed
- [ ] 1,000 active tenants
- [ ] 30-day retention > 70%
- [ ] NPS score > 50

### Business Metrics
- [ ] 20% conversion free → paid
- [ ] ₦100,000 MRR in 6 months
- [ ] Payment volume: ₦5M/month processed
- [ ] Customer acquisition cost < ₦10,000
- [ ] Lifetime value > ₦100,000

---

## 🚧 Risks & Mitigation

### Technical Risks
1. **Payment Integration Complexity**
   - **Mitigation**: Start with one provider (Paystack), add more later

2. **WhatsApp API Costs**
   - **Mitigation**: Use template messages, optimize sending frequency

3. **Data Security**
   - **Mitigation**: Follow OWASP best practices, security audit before launch

### Market Risks
1. **Established Competitors**
   - **Mitigation**: Focus on Nigerian market + superior UX

2. **Free Alternatives**
   - **Mitigation**: Freemium model + better features + support

3. **Payment Provider Changes**
   - **Mitigation**: Multi-provider strategy, avoid lock-in

### Execution Risks
1. **Feature Creep**
   - **Mitigation**: Strict prioritization, MVP mindset

2. **Technical Debt**
   - **Mitigation**: Refactor as we go, allocate 20% time to tech debt

3. **Resource Constraints**
   - **Mitigation**: Focus on P0/P1 features, defer P2/P3

---

## 📅 Milestone Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| **MVP Complete** | ✅ Done | Completed |
| **Design Overhaul** | ✅ Done | Completed |
| **Payment Integration** | Week 1 End | ✅ Complete (Feb 18, 2026) |
| **Financial Reports** | Week 2 End | ✅ Complete (Feb 19, 2026) |
| **Tenant Portal** | Week 3 End | ✅ Complete (Feb 19, 2026) |
| **Email Notifications** | Week 3 End | ✅ Complete (Feb 19, 2026) |
| **Production Deployment** | Week 3 End | ✅ Complete (Feb 19, 2026) |
| **Payment Categories** | Week 4 | ✅ Complete (Feb 20, 2026) |
| **Mobile Responsiveness** | Week 4 End | 🔄 In Progress |
| **Beta Launch** | Week 5 | 🎯 After Mobile Complete |
| **Nigerian Features** | Week 6-7 End | Not Started |
| **Mobile PWA** | Week 11-12 End | Not Started |
| **Public Launch** | Week 17 | Not Started |
| **100 Users** | Month 3 | Not Started |
| **Profitability** | Month 6 | Not Started |

---

## 🔄 Iteration Strategy

**Weekly Cycle**:
1. **Monday**: Sprint planning, prioritize week's work
2. **Tuesday-Thursday**: Development
3. **Friday**: Testing, bug fixes, demo
4. **Weekend**: User testing feedback

**Monthly Review**:
- Review competitive landscape
- Adjust roadmap based on user feedback
- Re-prioritize features
- Update financial projections

**Quarterly Goals**:
- Q1 2026: Complete P0 features, launch beta
- Q2 2026: Add P1 features, 100 paying users
- Q3 2026: Scale to 500 users, add AI features
- Q4 2026: 1,000 users, expand to UK market

---

## 📚 Resources & References

### Competitive Analysis
- See [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) for detailed market research

### Technical Documentation
- See [BACKLOG.md](BACKLOG.md) for detailed task tracking
- See [prisma/schema.prisma](prisma/schema.prisma) for data model

### Design System
- See [app/globals.css](app/globals.css) for color palette
- See [components/ui/](components/ui/) for component library

---

## 🎓 Lessons from Competitive Analysis & Development

1. **Payment is Non-Negotiable**: Every competitor has it. Build it first.

2. **Free Tier Works**: Innago, Landlord Studio, TenantCloud all offer free tiers successfully.

3. **Mobile is Critical**: Especially in African markets where mobile usage dominates (60%+ in Nigeria).
   - **Lesson Learned (Feb 2026)**: Build mobile-responsive from the start, not as an afterthought. Deferring mobile to Week 10 would have required massive refactoring. Prioritizing basic responsiveness in Week 4 ensures all future features are mobile-friendly.

4. **Local Integration Matters**: Nigerian features (Paystack, WhatsApp) are differentiators.

5. **Design Matters**: Most Nigerian platforms have poor UX - our Stripe-inspired design is an advantage.

6. **Pricing Transparency**: Most Nigerian competitors hide pricing - we can win with transparency.

7. **Multi-Currency is Unique**: No one else offers this - it's a strategic advantage.

8. **Payment Categories Enable Better Reporting**: Distinguishing RENT from ELECTRICITY, WATER, etc. provides clearer financial insights for landlords and accountants.

---

**Next Actions**:
1. ✅ Manual Payment Tracking (Complete - Feb 18, 2026)
2. ✅ Paystack Integration (Complete - Feb 18, 2026)
3. ✅ Financial Reporting (Complete - Feb 19, 2026)
4. ✅ Tenant Portal (Complete - Feb 19, 2026)
5. ✅ Email Notifications (Complete - Feb 19, 2026)
6. ✅ Production Deployment (Complete - Feb 19, 2026)
7. ✅ Payment Categories Feature (Complete - Feb 20, 2026)
8. 🔄 **IN PROGRESS**: Mobile Responsiveness (Basic) - Week 4
9. 📋 **NEXT**: Link Expenses to Maintenance Requests - Week 4
10. 🎯 **UPCOMING**: Shared Property Expenses - Week 5

**🎉 Post-MVP Status**: **Payment Categories Complete** - Ready for Mobile Optimization!
- ✅ Payment collection & tracking with Paystack
- ✅ Financial reporting with CSV exports
- ✅ Tenant portal with self-service
- ✅ Email notifications (4 types)
- ✅ Deployed to production (Vercel)
- ✅ Payment type categorization (RENT, ELECTRICITY, WATER, etc.)
- ✅ Income breakdown by payment type in reports
- 🔄 Mobile responsiveness (in progress)

**📱 Priority Shift**: Moved Mobile Responsiveness from Week 10 to Week 4 based on Nigerian market analysis (60%+ mobile users). Building mobile-friendly now prevents technical debt.

**🚀 Beta Launch**: Deferred to Week 5 (after mobile responsiveness complete)

**Last Review**: February 20, 2026
**Next Review**: Weekly sprint review
