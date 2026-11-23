# Review Checklist Reference

Detailed checks organized by category for thorough code reviews.

## Correctness

| Check | What to Look For |
|-------|-----------------|
| **Logic flow** | All `if/else` branches produce correct output |
| **Null safety** | Optional chaining where nullable, no unchecked `.property` on `T \| undefined` |
| **Async handling** | All promises awaited or `.catch()`-ed, no fire-and-forget |
| **Type safety** | No `as any`, no `@ts-ignore` without justification |
| **State mutations** | No direct mutation of Zustand state outside actions |
| **Array operations** | `map`/`filter`/`find` handle empty arrays, `find` handles `undefined` result |
| **String operations** | Handle empty strings, trim user input, correct encoding |
| **Date operations** | Timezone-aware, handle invalid dates, parse correctly |
| **Numeric operations** | Handle `NaN`, `Infinity`, division by zero, floating-point precision |

## Security (OWASP-aligned)

| Check | What to Look For |
|-------|-----------------|
| **Injection** | User input passed to queries/commands without sanitization |
| **XSS** | Raw HTML rendering from user data (`dangerouslySetInnerHTML`, unescaped templates) |
| **Auth** | Protected routes check authentication state before rendering |
| **IDOR** | Resource access validates ownership (e.g., user can only see their claims) |
| **Secrets** | No API keys, tokens, or passwords in source code |
| **Logging** | No PII (names, emails, phone numbers) in console or error logs |
| **Dependencies** | No known-vulnerable packages (check `npm audit`) |
| **CORS** | API endpoints don't use wildcard `*` in production |

## MALLOULIAUTO-Specific

| Check | What to Look For |
|-------|-----------------|
| **Colors** | Only brand palette: `brand-blue`, `brand-orange`, `brand-navy`, `brand-gray`, `emerald` |
| **Icons** | `lucide-react` or `lucide-react-native` only, no emoji in UI |
| **French accents** | All user-facing French text uses proper diacritics (é, è, ê, à, ç, ô, î, ù) |
| **Currency** | TND with 3 decimal places, format: `"150.000 TND"` |
| **Branding** | No third-party names (PAVE, DeepSeek, Groq) in user-visible text |
| **Locations** | Tunisian place names spelled correctly (La Marsa, Ariana, Carthage) |
| **Phone** | Tunisia format: `+216 XX XXX XXX` |

## Code Quality

| Check | What to Look For |
|-------|-----------------|
| **Dead code** | Commented-out blocks, unused imports, unreachable branches |
| **Console** | No `console.log` in production code (only in dev-only debug blocks) |
| **Naming** | PascalCase for components/types, camelCase for functions/variables |
| **File size** | Components > 300 lines should be split |
| **Duplication** | Same logic in 3+ places → extract to shared utility |
| **Error messages** | User-facing errors in French, developer errors in English |
| **Imports** | No circular dependencies, use package aliases (`@mallouliauto/*`) |

## Test Coverage

| Check | What to Look For |
|-------|-----------------|
| **Existence** | Does a test file exist for the changed module? |
| **Happy path** | At least one test for the primary success flow |
| **Edge case** | At least one test for boundary/unusual input |
| **Negative** | At least one test for invalid input or error case |
| **Regression** | If fixing a bug, is there a test that would have caught it? |
| **Factories** | Test data uses factories, not inline object literals |
| **Mocking** | External deps mocked at boundaries, not internal functions |
| **Independence** | Tests don't depend on execution order |

## React / React Native Components

| Check | What to Look For |
|-------|-----------------|
| **Key props** | Lists use stable keys (not array index for dynamic lists) |
| **Memoization** | Expensive renders wrapped with `React.memo` or `useMemo` where justified |
| **Cleanup** | `useEffect` returns cleanup for subscriptions/timers |
| **Platform** | Uses `Platform.select` or NativeWind responsive classes for cross-platform |
| **Accessibility** | `accessibilityLabel` on touchable elements, sufficient color contrast |
| **Loading states** | Async data shows skeleton/loading state, not blank screen |
| **Error states** | Failed fetches show error UI, not crash |
