# Publishing Guide

This document explains how to publish `jssb` to npm using semantic versioning.

## Prerequisites

1. **npm account**: Make sure you have an npm account and are logged in:
   ```bash
   npm login
   ```

2. **Git repository**: Ensure your code is committed and pushed to the repository.

3. **Clean working directory**: Make sure all changes are committed before publishing.

## Semantic Versioning Scripts

The package includes several npm scripts for publishing with proper semantic versioning:

### Version Bump Scripts

- `npm run version:patch` - Increment patch version (1.0.0 → 1.0.1) for bug fixes
- `npm run version:minor` - Increment minor version (1.0.0 → 1.1.0) for new features
- `npm run version:major` - Increment major version (1.0.0 → 2.0.0) for breaking changes

### Publish Scripts

- `npm run publish:patch` - Version bump + publish patch release
- `npm run publish:minor` - Version bump + publish minor release  
- `npm run publish:major` - Version bump + publish major release
- `npm run publish:beta` - Publish beta pre-release (1.0.1-beta.0)
- `npm run publish:alpha` - Publish alpha pre-release (1.0.1-alpha.0)
- `npm run publish:dry` - Dry run to test package without publishing

## Publishing Workflow

### 1. Prepare for Release

```bash
# Ensure all changes are committed
git status

# Run tests (when available)
npm test

# Build and test the package
npm run build
npm run publish:dry
```

### 2. Choose Release Type

#### Bug Fixes (Patch Release)
```bash
npm run publish:patch
```

#### New Features (Minor Release)
```bash
npm run publish:minor
```

#### Breaking Changes (Major Release)
```bash
npm run publish:major
```

#### Pre-releases (Beta/Alpha)
```bash
# For beta release
npm run publish:beta

# For alpha release
npm run publish:alpha
```

### 3. What Happens During Publishing

Each publish script automatically:

1. **Cleans** the dist folder
2. **Builds** the TypeScript code
3. **Increments** the version in package.json
4. **Creates** a git tag for the version
5. **Commits** the version bump
6. **Publishes** to npm
7. **Pushes** the commit and tag to git

## Manual Publishing Process

If you prefer manual control:

```bash
# 1. Build the project
npm run build

# 2. Bump version manually
npm version patch|minor|major

# 3. Publish to npm
npm publish

# 4. Push changes and tags
git push --follow-tags
```

## Pre-release Publishing

For beta or alpha versions:

```bash
# Create and publish beta version
npm version prerelease --preid=beta
npm publish --tag beta

# Create and publish alpha version
npm version prerelease --preid=alpha
npm publish --tag alpha
```

Users can then install pre-releases with:
```bash
npm install jssb@beta
npm install jssb@alpha
```

## Verification

After publishing, verify the release:

```bash
# Check on npm registry
npm view jssb

# Test installation
npm install -g jssb@latest
jssb --help
```

## Troubleshooting

### Common Issues

1. **Not logged in to npm**:
   ```bash
   npm login
   ```

2. **Package name already exists**:
   - Change the `name` in package.json
   - Or publish to a scoped package: `@yourusername/jssb`

3. **Version already published**:
   ```bash
   npm version patch  # Bump version first
   npm publish
   ```

4. **Git working directory not clean**:
   ```bash
   git add .
   git commit -m "Prepare for release"
   ```

### Rollback a Release

If you need to unpublish (only within 72 hours for public packages):

```bash
npm unpublish jssb@1.0.1
```

**Note**: Unpublishing is discouraged for public packages. Consider publishing a patch fix instead.

## Best Practices

1. **Always test** with `npm run publish:dry` first
2. **Follow semantic versioning** strictly
3. **Write clear commit messages** for version bumps
4. **Tag releases** properly (done automatically by scripts)
5. **Update CHANGELOG.md** before releasing
6. **Test the CLI** after each release
7. **Keep dependencies updated** regularly

## Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version bump is appropriate (patch/minor/major)
- [ ] Dry run succeeds
- [ ] Git working directory is clean
- [ ] You're logged in to npm

Then run the appropriate publish script!