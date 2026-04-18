# Fix "Missing required param id" Error

## Plan Status
- [x] 1. Create normalizePatient function in patientsStore.js
- [x] 2. Fix addPatient() to use normalization  
- [x] 3. Add defensive guard to goToRecords() in DashboardView.vue
- [ ] 4. Test new patient creation → dashboard navigation
- [x] 5. Fix Recommendation.vue display issues (name/contact/address)
- [x] 6. Complete

**Root cause**: New patients missing `id` field in store (only have `Id`)
