# Team Rules

## 🚨 Critical Rules (NEVER BREAK THESE)
- **Never push directly to `main`** - Always use Pull Requests
- **Never force push** (`git push --force`) 
- **Pull latest changes daily** before starting work

## 📋 Branching Strategy
```
main (protected) → develop → feature/yourname-task-name
```
- `main`: Always stable, deployable code
- `develop`: Integration branch for tested features  
- `feature/aayansh-login-api`: Personal feature branches

## 🔄 Daily Workflow
1. **Start Day**: `git pull origin main`
2. **Create Branch**: `git checkout -b feature/yourname-taskname`
3. **Work & Commit**: Small, frequent commits
4. **Push Branch**: `git push origin your-branch`
5. **Open PR**: When feature complete
6. **Get Reviews**: At least 1 approval required
7. **Merge**: Delete branch after merge

## 💬 Commit Messages Format
```
feat: add user login validation
fix: resolve navbar alignment bug
refactor: clean up database queries
```

## 📝 Pull Request Rules
- **Required**: Clear description + linked issue
- **Required**: At least 1 reviewer approval
- **Required**: All tests passing
- **No merge** if conflicts exist

## 🎯 Task Management
- **All tasks** → GitHub Issues
- **Assign owner** + due date to each issue
- **Link PRs** to corresponding issues

## ⚡ Quick Reference
- **Need help?** → Comment on issue/PR
- **Merge conflict?** → Resolve locally, ask for help if stuck  
- **Breaking changes?** → Discuss with team first
- **Stuck?** → Create issue, tag relevant team members
