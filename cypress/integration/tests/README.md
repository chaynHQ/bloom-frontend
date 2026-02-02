# Cypress Test Organization

Tests are organized into folders for parallel execution in GitHub Actions. Each folder runs as a separate job.

## Folder Structure

```
tests/
├── auth/              # Authentication & Registration tests
├── user-accounts/     # User account management tests
├── admin/             # Admin dashboard & partner management tests
├── user-content/      # User-generated content (notes, activities, etc.)
├── partners/          # Partner-specific experiences (Bumble, Badoo, etc.)
├── public/            # Public-facing pages & content
├── system/            # System functionality (cookies, actions, cleanup)
└── *.cy.tsx          # ⚠️  Ungrouped tests (will be caught by CI)
```

## Adding New Tests

**Important:** Place new test files in the appropriate folder based on what they test:

- **auth/** - Login, registration, password reset, user creation
- **user-accounts/** - Profile settings, email updates, account deletion
- **admin/** - Admin dashboards, partner admin, access codes, MFA
- **user-content/** - Activities, notes, courses, therapy, messaging
- **partners/** - Partner welcome flows and experiences
- **public/** - Homepage, navigation, public content, videos
- **system/** - Cookie consent, action handlers, cleanup scripts

### Example

```bash
# ✅ Good - test is in a folder
touch cypress/integration/tests/auth/new-login-feature.cy.tsx

# ❌ Bad - test is ungrouped (but CI will still catch it)
touch cypress/integration/tests/new-test.cy.tsx
```

## CI Behavior

- Each folder runs as a **parallel job** in GitHub Actions
- Tests in folders are **automatically discovered** - no workflow updates needed
- **Ungrouped tests** (in root) trigger a warning but still run
- Total test time: ~5-7 minutes (down from 20 minutes)

## Checking for Ungrouped Tests

Run this command to find any tests that aren't in folders:

```bash
npm run cypress:check-ungrouped
```

## Why This Structure?

1. **Automatic Discovery** - New tests are picked up without updating workflows
2. **Parallel Execution** - Faster CI runs (7 jobs instead of 1)
3. **Smaller Logs** - Each job has manageable log size
4. **Clear Organization** - Easy to find tests by feature area
5. **Scalable** - Add folders as needed for new feature areas

## Rebalancing Groups

If one folder's tests take much longer than others, consider:

1. **Splitting the folder** into subcategories
2. **Moving tests** to better balance load across jobs
3. **Adding a new matrix entry** in the workflow for the subfolder

Check execution times in GitHub Actions or Cypress Dashboard.
