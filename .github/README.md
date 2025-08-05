# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Reactive-DOM project.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:** Push to main/develop, Pull requests to main/develop

**Jobs:**

- **Build and Test:** Runs on Node.js 18, 20, 22
  - Installs dependencies
  - Builds the library
  - Runs tests
  - Checks TypeScript compilation
  - Runs ESLint

- **Test Examples:** Tests the example applications
  - Tests signal functionality
  - Tests browser examples
  - Tests clsx functionality
  - Tests cleanup functionality
  - Tests TypeScript compilation
  - Tests development server

- **Security:** Security audit
  - Runs npm audit
  - Checks for vulnerabilities

### 2. Release (`release.yml`)

**Triggers:** Push tags matching `v*`

**Jobs:**

- **Release:** Automated release process
  - Builds the library
  - Runs tests
  - Publishes to NPM
  - Creates GitHub release

### 3. Deploy Documentation (`deploy-docs.yml`)

**Triggers:** Push to main, Pull requests to main

**Jobs:**

- **Build and Deploy:** Documentation deployment
  - Builds the library
  - Builds documentation site
  - Deploys to GitHub Pages

### 4. Dependency Review (`dependency-review.yml`)

**Triggers:** Pull requests to main/develop

**Jobs:**

- **Dependency Review:** Security review
  - Reviews dependencies for security issues
  - Fails on moderate severity issues

### 5. Test Examples (`test-examples.yml`)

**Triggers:** Push to main/develop, Pull requests to main/develop

**Jobs:**

- **Test Examples:** Comprehensive example testing
  - Tests signal functionality
  - Tests browser examples
  - Tests clsx functionality
  - Tests cleanup functionality
  - Tests TypeScript compilation
  - Tests development server

### 6. Code Quality (`code-quality.yml`)

**Triggers:** Push to main/develop, Pull requests to main/develop

**Jobs:**

- **Lint and Format:** Code quality checks
  - Runs ESLint
  - Checks TypeScript
  - Checks for security vulnerabilities
  - Checks bundle size

- **Coverage:** Test coverage
  - Runs tests with coverage
  - Uploads coverage to Codecov

## Required Secrets

For the release workflow to work, you need to set up the following secrets in your GitHub repository:

1. **NPM_TOKEN:** Your NPM authentication token for publishing packages
2. **GITHUB_TOKEN:** Automatically provided by GitHub

## Setup Instructions

1. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Set source to "Deploy from a branch"
   - Select "gh-pages" branch
   - Save

2. **Set up NPM publishing:**
   - Create an NPM account if you don't have one
   - Generate an NPM token with publish permissions
   - Add the token as `NPM_TOKEN` secret in GitHub

3. **Enable Codecov (optional):**
   - Sign up at codecov.io
   - Connect your GitHub repository
   - The coverage will be automatically uploaded

## Local Development

To run the same checks locally:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Check TypeScript
npm run type-check

# Security audit
npm run security-audit

# Build library
npm run build
```

## Workflow Status

You can monitor the status of all workflows in the "Actions" tab of your GitHub repository. Each workflow will show:

- ✅ **Green:** All checks passed
- ❌ **Red:** One or more checks failed
- 🟡 **Yellow:** Workflow is running

## Troubleshooting

### Common Issues

1. **Tests failing:** Check that all dependencies are properly installed
2. **Build failing:** Ensure TypeScript compilation is successful
3. **Linting errors:** Run `npm run lint` locally to see issues
4. **Security vulnerabilities:** Run `npm audit` to see details

### Manual Triggers

You can manually trigger workflows from the Actions tab:

1. Go to Actions tab
2. Select the workflow you want to run
3. Click "Run workflow"
4. Select the branch and click "Run workflow"
