# Visual Guide: Execute SQL Schema in Supabase

## Problem
```
Failed to load schema
Database query failed: (ENOTFOUND) tenant/user
```

## Solution: 5-Minute Setup

---

## STEP 1: Open SQL File

1. In your project, find:
   ```
   supabase/migrations/00_hula_agro_complete_schema.sql
   ```

2. Open it in your text editor

3. Select ALL:
   - Windows/Linux: Ctrl+A
   - Mac: Cmd+A

4. Copy:
   - Windows/Linux: Ctrl+C
   - Mac: Cmd+C

---

## STEP 2: Go to Supabase

1. Open: https://app.supabase.com

2. Sign in with your account

3. Click your project from the list

4. You should see the dashboard

---

## STEP 3: Open SQL Editor

On the left sidebar, look for **"SQL Editor"**

Click it

You'll see a panel with:
- "SQL Editor" at the top
- List of saved queries below
- (Or a blank "New Query" area)

---

## STEP 4: Create New Query

In the SQL Editor panel, click: **"New Query"** button

A text editor will appear (empty)

---

## STEP 5: Paste SQL

In the text editor, paste the SQL you copied:
- Windows/Linux: Ctrl+V
- Mac: Cmd+V

You should see:
```sql
-- ============================================================================
-- HULA AGRO — SCHEMA COMPLETO PARA PRODUÇÃO (SUPABASE)
-- ...
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
...
```

All 474 lines should be visible

---

## STEP 6: Execute

Find the **"RUN"** button (top right of the editor, blue button)

Click it

**Wait... 2-5 minutes**

You'll see a loading spinner

Then a **green checkmark** ✓ will appear

---

## STEP 7: Verify

In a NEW query in SQL Editor, paste:

```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Click RUN

**Result should show: 21**

If it shows 0 or less, the schema didn't execute properly.

---

## STEP 8: Done!

Go back to your app

Refresh the page:
- Windows/Linux: Ctrl+Shift+R
- Mac: Cmd+Shift+R

The error should be gone

Your app should load normally

---

## Troubleshooting

### Error: "Relation already exists"
**Cause:** Tables were partially created before

**Fix:**
1. Delete the existing query
2. In SQL Editor, create new query:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
   ```
3. Click RUN
4. Then paste and run the full schema again

### Error: "Syntax Error"
**Cause:** SQL wasn't copied correctly

**Fix:**
1. Delete the query
2. Go back to the SQL file
3. Copy again (Ctrl+A → Ctrl+C)
4. Create new query
5. Paste (Ctrl+V)
6. Click RUN

### Query hangs (spinning for 10+ minutes)
**Cause:** Large query taking too long

**Fix:**
1. Click the "Stop" button
2. Try executing in smaller parts:
   - First just the CREATE EXTENSION commands
   - Then the main tables

### "Permission denied" errors
**Cause:** Not enough permissions

**Fix:**
1. Make sure you're logged in as project owner
2. Use the Supabase web interface (not custom client)
3. Contact Supabase support if still failing

---

## What Gets Created

After successful execution:

✓ 21 database tables
✓ 11 performance indexes
✓ 21 security policies (RLS)
✓ 2 PostgreSQL extensions (UUID, pgcrypto)

All tables will be visible in Supabase:
- Go to "Table Editor" (left sidebar)
- You should see ~21 tables

---

## Expected Result

After following all steps:

✓ No more "Failed to load schema" error
✓ Application loads normally
✓ Data persists when you create records
✓ All 76 pages accessible
✓ Ready to use

---

## Need Help?

1. Check: FIX_DATABASE_ERROR.md (detailed guide)
2. Check: SCHEMA_EXECUTION_CHECKLIST.txt (checklist)
3. Check: SQL_SCHEMA_SUMMARY.md (database details)

Good luck!
