Database Recovery & Real API Integration Plan

## Current Status

- Supabase: Fully configured and operational
- APIs: 7 working (batches, costs, employees, health, production, sensors, sensor-readings)
- Database issue: 60+ mock pages that don't persist data, visual inconsistencies

## Critical Issues Identified (from Audit)

### 1. Data Persistence (60 pages are mocks)
- Mock pages use useState/const with hardcoded data
- Data disappears on page refresh
- No API integration, no database saves

### 2. Visual Inconsistencies  
- Mock pages use generic colors (blue-600, gray-900) instead of brand green (#22C55E, #283106)
- Icons are emojis (➕📚) instead of lucide-react icons
- No font-montserrat applied
- Missing FormSection/FormInput components

### 3. API Pattern Issues
- Some APIs don't instantiate supabase correctly (missing `const supabase = getSupabase()`)
- Error handling returns empty arrays instead of proper errors
- No input validation

## Recovery Plan (Phased)

### Phase 0: Verify & Fix Existing APIs
- Fix supabase instantiation in all routes
- Add proper error handling
- Add input validation
- **Expected time: 1 hour**

### Phase 1: Convert High-Priority Mock Pages to Real APIs
Convert these 15 pages (tables already exist or are easy to create):
- Genetics (table exists)
- Costs (Cost Records - table exists) 
- Purchases (table exists)
- Alerts (tables exist)
- Environment (table exists)

**Expected time: 4-6 hours**

### Phase 2: Create Missing Tables & Convert Pages
New tables needed:
- facilities (for Galpões)
- nutrition_records (for Nutrição) 
- daily_management (for Gestão Diária)
- vaccination_records (for Vacinação)
- flock_classifications (for Classificação)

**Expected time: 6-8 hours**

### Phase 3: Visual Standardization
- Replace all emojis with lucide-react icons
- Apply brand colors everywhere
- Use FormSection/FormInput components
- Ensure font-montserrat applied

**Expected time: 3-4 hours**

### Phase 4: Analysis & Reporting Pages
- Create aggregation endpoints
- Build analytics dashboards
- Connect to existing data

**Expected time: 4-5 hours**

## Implementation Order

1. **Today (Priority 1):** Phase 0 (Fix existing APIs) + Phase 1 (Genetics, Costs, Purchases)
2. **Tomorrow:** Phase 1 continued (Alerts, Environment) + Phase 2 start
3. **This week:** Phase 2 complete + Phase 3 visual fixes
4. **Next week:** Phase 4 analytics

## Testing Strategy

For each conversion:
1. Create working API endpoint
2. Update page to call API
3. Test CREATE, READ, UPDATE, DELETE operations
4. Verify data persists on refresh
5. Apply visual standards
6. Test on mobile/desktop

## Success Criteria

- [ ] All 76 pages have real database saves
- [ ] All pages use brand colors and fonts
- [ ] All pages use proper form components
- [ ] All pages use lucide-react icons (no emojis)
- [ ] No data loss on page refresh
- [ ] Mobile responsive works properly
- [ ] Build passes without warnings
