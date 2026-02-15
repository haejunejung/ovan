# Contributing to ovan

Thank you for your interest in contributing to ovan! This guide will help you get started.

## Development setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+

### Getting started

```bash
# Clone the repository
git clone https://github.com/user/ovan.git
cd ovan

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Lint
pnpm run lint

# Format
pnpm run format
```

## How to contribute

### Reporting bugs

Before filing a bug report, please check if the issue already exists. If not, open a new issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (React/RN version, platform, etc.)
- A minimal reproduction if possible

### Suggesting features

Open an issue with the **feature request** label. Please describe the use case and why existing functionality doesn't cover it.

### Submitting pull requests

1. Fork the repository and create your branch from `main`.
2. If you've added code, add tests that cover your changes.
3. Ensure `pnpm run test` and `pnpm run lint` all pass.
4. Write a clear PR description explaining what your change does and why.

## Project structure

```
ovan/
└── src/
    ├── core/        # Shared logic (state, types, hooks)
    ├── web/         # React (web) adapter — createPortal
    └── native/      # React Native adapter — react-native-teleport

```

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.