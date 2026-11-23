/**
 * PostToolUse hook: Validate test file structure
 *
 * After a test file is created or edited, this hook reads the file and checks
 * that it follows the MALLOULIAUTO test conventions. Violations are returned
 * as a systemMessage so the agent can self-correct.
 *
 * Input:  JSON on stdin with { hookEventName, toolName, toolInput, toolOutput }
 * Output: JSON on stdout with { decision, systemMessage? }
 */

const fs = require('fs');
const path = require('path');

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx)$/;
const RELEVANT_TOOLS = ['create_file', 'replace_string_in_file', 'multi_replace_string_in_file'];

function getFilePath(toolName, toolInput) {
  if (!toolInput) return null;
  if (toolInput.filePath) return toolInput.filePath;
  if (toolInput.replacements && Array.isArray(toolInput.replacements)) {
    const first = toolInput.replacements[0];
    return first ? first.filePath : null;
  }
  return null;
}

function isTestFile(filePath) {
  return filePath && TEST_FILE_PATTERN.test(filePath);
}

/**
 * Run all structural checks against the file content.
 * Returns an array of violation strings.
 */
function validateTestFile(content, filePath) {
  const violations = [];
  const _lines = content.split('\n');
  const _fileName = path.basename(filePath);

  // 1. Check for top-level describe block
  if (!/\bdescribe\s*\(/.test(content)) {
    violations.push('MISSING: Top-level `describe()` block. Every test file must wrap tests in a describe named after the module.');
  }

  // 2. Check for it() or test() blocks
  if (!/\b(it|test)\s*\(/.test(content)) {
    violations.push('MISSING: No `it()` or `test()` blocks found. Test file has no test cases.');
  }

  // 3. Check for beforeEach (mock reset)
  if (/\bjest\.fn\b|\bvi\.fn\b|\bmock/i.test(content) && !/\bbeforeEach\s*\(/.test(content)) {
    violations.push('MISSING: `beforeEach` block. Mocks are used but no beforeEach to reset them — this causes test leakage.');
  }

  // 4. Check for AAA pattern comments in non-trivial tests
  const itBlocks = content.match(/\b(it|test)\s*\([^)]+,\s*(async\s*)?\(\)\s*=>\s*\{[^}]{100,}\}/gs) || [];
  if (itBlocks.length > 0) {
    const hasAAAComments = /\/\/\s*(Arrange|Act|Assert)/i.test(content);
    if (!hasAAAComments) {
      violations.push('CONVENTION: Non-trivial test cases found without AAA comments (// Arrange, // Act, // Assert). Add them for readability.');
    }
  }

  // 5. Check for proper naming pattern: should ... when
  const itNames = content.match(/\b(it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
  const badNames = itNames.filter(name => {
    const desc = name.replace(/^(it|test)\s*\(\s*['"`]/, '').replace(/['"`]$/, '');
    return !/^should\s/.test(desc);
  });
  if (badNames.length > 0 && badNames.length === itNames.length) {
    violations.push(`NAMING: Test names should follow \`it('should [verb] when [condition]')\` pattern. Found ${badNames.length} test(s) not using "should" prefix.`);
  }

  // 6. Check for forbidden patterns
  const forbiddenPatterns = [
    { pattern: /\bconsole\.(log|warn|error)\s*\(/g, message: 'FORBIDDEN: `console.log/warn/error` found in test file. Use expect assertions instead.' },
    { pattern: /\bas\s+any\b/g, message: 'FORBIDDEN: `as any` type cast found. Use proper types or factories.' },
    { pattern: /\b@ts-ignore\b/g, message: 'FORBIDDEN: `@ts-ignore` found. Fix the type error instead.' },
  ];

  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(content)) {
      violations.push(message);
    }
  }

  // 7. Check for branching logic in test bodies (rough heuristic)
  // Look for if/for/switch/while inside it() blocks
  const testBodies = content.match(/\b(it|test)\s*\([^)]+,\s*(async\s*)?\(\)\s*=>\s*\{[\s\S]*?\n\s*\}\s*\)/g) || [];
  for (const body of testBodies) {
    if (/\b(if\s*\(|for\s*\(|switch\s*\(|while\s*\()/.test(body)) {
      violations.push('FORBIDDEN: Branching logic (`if`/`for`/`switch`/`while`) detected inside a test body. Split into separate test cases.');
      break;
    }
  }

  // 8. Check for grouped describe blocks (Happy Path, Edge Cases, etc.)
  const hasGroupedDescribes = /describe\s*\(\s*['"`](Happy Path|Edge Cases?|Negative|Security|Boundary|State|Integration)/i.test(content);
  const testCount = itNames.length;
  if (testCount > 3 && !hasGroupedDescribes) {
    violations.push('STRUCTURE: File has 4+ tests but no category grouping. Use nested `describe` blocks: "Happy Path", "Edge Cases", "Negative Scenarios", "Security".');
  }

  // 9. Check for factory usage vs inline objects (rough heuristic)
  const largeInlineObjects = content.match(/\bconst\s+\w+\s*[:=]\s*\{[^}]{200,}\}/gs) || [];
  if (largeInlineObjects.length > 0) {
    violations.push('CONVENTION: Large inline object literals found. Use factory functions from __tests__/factories/ instead.');
  }

  // 10. Check for French accent issues in common test strings
  const frenchMistakes = [
    { wrong: /['"](Controle technique|controle technique)['"]/g, fix: 'Contrôle technique' },
    { wrong: /['"]Vehicule['"]/g, fix: 'Véhicule' },
    { wrong: /['"]Reparation['"]/g, fix: 'Réparation' },
    { wrong: /['"]Revision['"]/g, fix: 'Révision' },
    { wrong: /['"]expire['"]/g, fix: 'expiré(e)' },
  ];
  for (const { wrong, fix } of frenchMistakes) {
    if (wrong.test(content)) {
      violations.push(`FRENCH ACCENTS: Found unaccented French text. Use "${fix}" with proper diacritics.`);
    }
  }

  return violations;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  const toolName = hookData.toolName || hookData.tool_name || '';
  const toolInput = hookData.toolInput || hookData.tool_input || {};

  if (!RELEVANT_TOOLS.includes(toolName)) {
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  const filePath = getFilePath(toolName, toolInput);

  if (!isTestFile(filePath)) {
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  // Read the file to validate its content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    // File might not exist yet or can't be read — pass through
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  const violations = validateTestFile(content, filePath);

  if (violations.length === 0) {
    process.stdout.write(JSON.stringify({
      decision: 'continue',
      systemMessage: `[Hook: test-workflow] ✓ Test file passed all structural checks.`,
    }));
    return;
  }

  const fileName = path.basename(filePath);
  const systemMessage = [
    `[Hook: test-workflow] ⚠ ${violations.length} violation(s) found in ${fileName}:`,
    '',
    ...violations.map((v, i) => `  ${i + 1}. ${v}`),
    '',
    'Fix these violations to comply with MALLOULIAUTO test conventions.',
    'Refer to the `test-conventions` instructions and `implement-tests` skill for details.',
  ].join('\n');

  process.stdout.write(JSON.stringify({
    decision: 'continue',
    systemMessage,
  }));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: 'continue' }));
});
