---
name: code-review
description: 'Review code changes for quality, correctness, and test coverage. Use when: reviewing a PR, auditing code quality, checking for bugs, reviewing before merge, validating implementation against requirements, performing code review, checking test coverage gaps, verifying security practices. Produces a structured review report with severity-tagged findings.'
argument-hint: 'Provide a file, function, PR, or diff to review'
---

# Code Review

## When to Use

- Before merging a PR or committing significant changes
- When asked to "review this code" or "check my implementation"
- After implementing a feature to self-audit
- When verifying implementation matches a design doc or spec

## Procedure

### Step 1 — Scope the Review

Identify what's being reviewed:
- **Single file**: Read the file and its related types/interfaces
- **Multiple files**: Read all changed files and their shared dependencies
- **PR/diff**: Examine only changed lines plus surrounding context

### Step 2 — Apply Review Checklist

For each file or change, evaluate against these categories. Use the [review checklist reference](./references/review-checklist.md) for detailed checks.

#### 2a. Correctness
- Does the logic match the stated requirement?
- Are all code paths handled (success, error, edge)?
- Are return types correct and complete?
- Do async operations handle errors properly?

#### 2b. Security (OWASP Top 10)
- User inputs validated and sanitized?
- No SQL/XSS/command injection vectors?
- Auth checks on protected routes?
- Sensitive data not exposed in logs or responses?
- No hardcoded secrets or tokens?

#### 2c. Code Quality
- TypeScript strict mode respected (no `any` escapes)?
- Naming is clear and consistent (PascalCase components, camelCase functions)?
- No dead code, commented-out code, or `console.log`?
- No over-engineering (unnecessary abstractions, premature optimization)?
- DRY respected without sacrificing readability?

#### 2d. MALLOULIAUTO Standards
- Brand colors used (no hardcoded hex outside palette)?
- Lucide icons only (no emojis in UI)?
- French text has proper accents (é, è, ê, à, ç, ô)?
- TND currency formatted correctly (3 decimals)?
- No third-party names in user-facing text?

#### 2e. Test Coverage
- Are there tests for the changed code?
- Do tests cover happy path AND at least one edge/negative case?
- Are new functions/endpoints tested?
- If no tests exist, flag as a gap with priority

### Step 3 — Format Findings

Present findings in a structured report:

```markdown
## Code Review: [Target]

### Summary
[1-2 sentence overview of the change and overall impression]

### Findings

| # | Severity | Category | File | Line | Finding | Suggestion |
|---|----------|----------|------|------|---------|------------|
| 1 | 🔴 Critical | Security | file.ts | 42 | SQL injection via unsanitized input | Use parameterized query |
| 2 | 🟡 Warning | Quality | api.ts | 15 | Unhandled promise rejection | Add try/catch |
| 3 | 🔵 Info | Style | Card.tsx | 8 | Hardcoded color #447D9B | Use `brand-blue` class |
| 4 | 🟢 Test Gap | Coverage | store.ts | — | No tests for `resetClaim()` | Add edge case tests |

### Test Coverage Assessment
- [x] Happy path covered
- [ ] Edge cases: [specific missing scenarios]
- [ ] Negative scenarios: [specific missing scenarios]
- [ ] Security scenarios: [specific missing scenarios]

### Verdict
**[APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]**
[Brief justification]
```

**Severity levels:**
| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 **Critical** | Bugs, security vulnerabilities, data loss risk | Must fix before merge |
| 🟡 **Warning** | Logic issues, missing error handling, potential bugs | Should fix before merge |
| 🔵 **Info** | Style, naming, minor improvements | Fix when convenient |
| 🟢 **Test Gap** | Missing test coverage | Add tests (priority based on risk) |

### Step 4 — Provide Actionable Fixes

For every Critical and Warning finding, include a concrete fix suggestion — either a code snippet or a clear description of what to change. Don't just flag problems; propose solutions.

## Rules

- **Be specific**: "Line 42 has an issue" not "there might be a problem somewhere"
- **Be constructive**: Every criticism comes with a suggestion
- **Prioritize**: Critical > Warning > Info. Don't bury important findings in a list of nitpicks
- **Respect intent**: Understand what the developer was trying to do before suggesting alternatives
- **Check tests**: Always include a test coverage assessment — this is non-optional
- **No false positives**: Only flag real issues. If you're unsure, mark as Info with a question
