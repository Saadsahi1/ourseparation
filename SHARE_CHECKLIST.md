# Project Sharing Checklist

Use this checklist when sharing the project with your team.

## Before You Share

### 1. Security Review
- [ ] Verify `.env` is in `.gitignore`
- [ ] Confirm no API keys are hardcoded in source files
- [ ] Check no production credentials are in code
- [ ] Review any commented-out sensitive data
- [ ] Ensure `.env.example` has placeholder values only

### 2. Code Quality
- [ ] Run `npm run build` successfully
- [ ] Run `npm run typecheck` with no errors
- [ ] Run `npm run lint` and fix critical issues
- [ ] Run `npm test` and verify tests pass
- [ ] Remove any debug console.logs

### 3. Documentation
- [ ] Update README.md with current project state
- [ ] Verify all documentation files are present:
  - [ ] TEAM_SETUP.md
  - [ ] DEPLOYMENT.md
  - [ ] SHARING_OPTIONS.md
  - [ ] AGREEMENT_ENTITLEMENTS.md
- [ ] Check that setup instructions work on a clean machine
- [ ] Verify all links in docs work

### 4. Development Environment
- [ ] Create development Supabase project (separate from production)
- [ ] Note development project URL and keys
- [ ] Set up Stripe test mode account
- [ ] Note Stripe test keys
- [ ] Test that dev environment works end-to-end

## Choosing How to Share

Select the best method for your situation:

### ✅ Git Repository (Recommended for most teams)
Best for: Active development teams, version control needs

**Steps:**
1. [ ] Initialize Git: `git init`
2. [ ] Create `.gitignore` (should already exist)
3. [ ] Initial commit: `git add . && git commit -m "Initial commit"`
4. [ ] Create repository on GitHub/GitLab/Bitbucket
5. [ ] Add remote: `git remote add origin [URL]`
6. [ ] Push: `git push -u origin main`
7. [ ] Invite team members to repository

### 📦 Zip File (Quick sharing)
Best for: Small teams, one-time sharing, no version control needed

**Steps:**
1. [ ] Clean build artifacts: `rm -rf node_modules dist`
2. [ ] Create zip: `zip -r agreement-app.zip . -x "node_modules/*" -x ".git/*" -x "dist/*"`
3. [ ] Upload to cloud storage (Google Drive, Dropbox)
4. [ ] Share link with team
5. [ ] Include setup instructions link

### 🐳 Docker (Consistent environments)
Best for: Complex setup, environment consistency critical

**Steps:**
1. [ ] Create Dockerfile (see SHARING_OPTIONS.md)
2. [ ] Build image: `docker build -t agreement-app .`
3. [ ] Test image locally
4. [ ] Push to container registry or save as tar
5. [ ] Share image and run instructions

## Setting Up for Team

### 1. Create Development Resources

**Supabase (Development):**
- [ ] Create new Supabase project named "[YourApp] - Dev"
- [ ] Apply all migrations from `supabase/migrations/`
- [ ] Set up authentication (enable email provider)
- [ ] Create test user accounts
- [ ] Note project URL and anon key

**Stripe (Test Mode):**
- [ ] Verify test mode is active
- [ ] Create test product with metadata: `agreement_type = separation`
- [ ] Note test publishable key
- [ ] Set up webhook endpoint (can wait until deployed)

### 2. Prepare Environment Variables

Create a secure document with:
```
VITE_SUPABASE_URL=[dev project URL]
VITE_SUPABASE_ANON_KEY=[dev anon key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[test key]
```

Share via:
- [ ] Password manager (1Password, LastPass)
- [ ] Encrypted document
- [ ] Secure messaging (Signal, encrypted email)

**Never share via:**
- ❌ Plain email
- ❌ Slack/Teams (unless encrypted)
- ❌ In code repository

### 3. Prepare Team Documentation

Create a welcome document with:
- [ ] Link to repository or zip file
- [ ] Link to TEAM_SETUP.md
- [ ] Development environment credentials (secure)
- [ ] Team communication channels
- [ ] Project overview and goals
- [ ] Who to contact for help
- [ ] First tasks for new team members

## During Sharing

### 1. Invite Team Members

**If using Git:**
- [ ] Add collaborators to repository
- [ ] Set appropriate permission levels
- [ ] Enable branch protection on main
- [ ] Set up required status checks

**If using other method:**
- [ ] Share files via chosen method
- [ ] Confirm team members received access
- [ ] Verify they can download/access files

### 2. Share Credentials Securely
- [ ] Send environment variables via secure channel
- [ ] Share development database access
- [ ] Share Stripe test account access (if needed)
- [ ] Provide any additional API keys

### 3. Schedule Onboarding

- [ ] Book kickoff meeting for project walkthrough
- [ ] Schedule setup help session
- [ ] Create Slack/Teams channel for questions
- [ ] Assign a buddy/mentor for each new team member

## After Sharing

### 1. Verify Team Setup

For each team member:
- [ ] Can clone/download project
- [ ] Can install dependencies (`npm install`)
- [ ] Can run dev server (`npm run dev`)
- [ ] Can access development database
- [ ] Can run tests (`npm test`)
- [ ] Can build project (`npm run build`)

### 2. Establish Workflow

- [ ] Define branching strategy (e.g., feature branches)
- [ ] Set up code review process
- [ ] Establish commit message conventions
- [ ] Define when to create pull requests
- [ ] Set up CI/CD if applicable

### 3. Set Development Standards

- [ ] Run tests before committing
- [ ] Run type checking before pushing
- [ ] Code review required for merges
- [ ] Keep documentation updated
- [ ] Log time spent (if tracking)

### 4. Communication Setup

- [ ] Create project channel (Slack/Teams)
- [ ] Set up daily standup (if applicable)
- [ ] Establish office hours for questions
- [ ] Share calendar for team availability
- [ ] Document escalation path for blockers

## Ongoing Maintenance

### Weekly
- [ ] Review open pull requests
- [ ] Address questions in team channel
- [ ] Update documentation as needed
- [ ] Check test coverage

### Monthly
- [ ] Review and update dependencies
- [ ] Update README with new features
- [ ] Clean up stale branches
- [ ] Archive completed tasks

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Documentation review
- [ ] Team feedback session

## Quick Access Links

Document these for easy team reference:

- **Repository:** [URL]
- **Development Database:** [Supabase Project URL]
- **Stripe Dashboard:** https://dashboard.stripe.com/test
- **Documentation:** Link to main README.md
- **Team Chat:** [Slack/Teams channel]
- **Issue Tracker:** [GitHub Issues / Jira]
- **Deployment:** [Staging/Production URLs]

## Emergency Contacts

List key people for different issues:

- **Database Issues:** [Name, Contact]
- **Payment Issues:** [Name, Contact]
- **Deployment Issues:** [Name, Contact]
- **General Questions:** [Name, Contact]
- **After Hours:** [On-call Contact]

---

## Ready to Share?

Pick your method from SHARING_OPTIONS.md and work through this checklist. Good luck!

**Recommended First Step:**
1. Complete "Before You Share" section
2. Choose sharing method
3. Set up development resources
4. Follow method-specific steps
5. Complete "After Sharing" verification
