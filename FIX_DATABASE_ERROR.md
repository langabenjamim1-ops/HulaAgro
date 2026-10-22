# Fix: Database Query Failed - ENOTFOUND tenant/user

## Problem
```
Failed to load schema
Database query failed: (ENOTFOUND) tenant/user
postgres://jkx*?z...njgdqbug
not found
```

This error means the SQL schema was **NOT executed successfully** in Supabase. The tables don't exist yet.

---

## Solution: 3-Step Fix

### Step 1: Verify Supabase Connection
```bash
# Check if environment variables are set correctly
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Both should return non-empty values. If blank:
1. Go to: https://app.supabase.com → Select project → Settings → API
2. Copy `Project URL` and `Anon Key`
3. Add to `.env.local` or project settings

### Step 2: Execute SQL Schema in Supabase

1. Go to: **https://app.supabase.com**
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"** button
5. **PASTE THIS ENTIRE SQL SCRIPT:**

```sql
-- File: supabase/migrations/00_hula_agro_complete_schema.sql
-- Copy entire content from the project
```

Or use the file directly:
- Location: `/supabase/migrations/00_hula_agro_complete_schema.sql`
- Copy all content (Ctrl+A → Ctrl+C)
- Paste in Supabase SQL Editor
- Click **RUN** button

**WAIT for the green checkmark** (2-5 minutes)

### Step 3: Verify Tables Were Created

In Supabase SQL Editor, run:

```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Should return: 21**

If it returns 0 or a lower number, the schema didn't execute properly.

---

## Common Issues & Fixes

### Issue 1: "Relation already exists"
**Cause:** Tables were partially created before

**Fix:** Drop existing tables first
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
```

Then execute the full schema script.

### Issue 2: "Syntax Error" in SQL
**Cause:** SQL wasn't copied correctly or corrupted

**Fix:** 
1. Delete the partial query
2. Copy the SQL file fresh: `supabase/migrations/00_hula_agro_complete_schema.sql`
3. Paste completely in editor
4. Try again

### Issue 3: Query hangs (spinning for 10+ min)
**Cause:** Large schema taking too long

**Fix:**
1. Click "Stop" button
2. Execute schema in smaller parts:
   - First execute just CREATE EXTENSION commands
   - Then execute table creation in parts

### Issue 4: "Permission denied" errors
**Cause:** Role doesn't have permissions

**Fix:**
1. Use Supabase "SQL Editor" (not custom client)
2. Make sure you're logged in as project owner
3. Or contact Supabase support

---

## Verify in Application

After schema is created, restart your app:

```bash
npm run dev
```

The error "Failed to load schema" should be gone.

Test by:
1. Navigate to any page
2. Data should load (not show error)
3. Create a test record
4. Refresh page
5. Record should still exist

---

## Complete Checklist

- [ ] Environment variables set (URL + Anon Key)
- [ ] Went to Supabase SQL Editor
- [ ] Copied full schema SQL file
- [ ] Pasted in Supabase
- [ ] Clicked RUN button
- [ ] Got green checkmark
- [ ] Ran verification query (should return 21)
- [ ] Restarted app with `npm run dev`
- [ ] Error is gone ✓
- [ ] Application works ✓

---

## If Still Not Working

1. Check browser console for exact error message
2. Check Supabase project directly (go to Tables → should see 21 tables)
3. Verify environment variables are correct
4. Try creating new Supabase project and executing schema again
5. Contact Supabase support if SQL won't execute

---

## SQL Schema Details

The schema creates:
- **21 tables** (farms, batches, production, health, HR, costs, etc.)
- **11 indexes** (performance optimization)
- **21 RLS policies** (multi-tenant security)
- **2 extensions** (UUID, pgcrypto)

Total size: ~474 lines of SQL

File location: `/supabase/migrations/00_hula_agro_complete_schema.sql`
