/**
 * PreToolUse hook: Inject test workflow context
 *
 * When the agent is about to create or edit a test file, this hook injects
 * a system message reminding it to follow the generate-test-scenarios →
 * implement-tests workflow and the MALLOULIAUTO test conventions.
 *
 * Input:  JSON on stdin with { hookEventName, toolName, toolInput }
 * Output: JSON on stdout with { decision, systemMessage? }
 */

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx)$/;

const TOOLS_THAT_CREATE_FILES = ['create_file'];
const TOOLS_THAT_EDIT_FILES = ['replace_string_in_file', 'multi_replace_string_in_file'];
const RELEVANT_TOOLS = [...TOOLS_THAT_CREATE_FILES, ...TOOLS_THAT_EDIT_FILES];

function getFilePath(toolName, toolInput) {
  if (!toolInput) return null;
  // create_file and replace_string_in_file use filePath
  if (toolInput.filePath) return toolInput.filePath;
  // multi_replace_string_in_file has replacements array
  if (toolInput.replacements && Array.isArray(toolInput.replacements)) {
    const first = toolInput.replacements[0];
    return first ? first.filePath : null;
  }
  return null;
}

function isTestFile(filePath) {
  return filePath && TEST_FILE_PATTERN.test(filePath);
}

function buildContextMessage(toolName, filePath) {
  const isCreating = TOOLS_THAT_CREATE_FILES.includes(toolName);
  const fileName = filePath.split(/[/\\]/).pop();

  if (isCreating) {
    return [
      `[Hook: test-workflow] Creating test file: ${fileName}`,
      '',
      'MANDATORY TEST STRUCTURE for this project:',
      '',
      '1. WORKFLOW: If test scenarios have not been generated yet for the target module,',
      '   use the `generate-test-scenarios` skill FIRST, then use `implement-tests` to write code.',
      '',
      '2. FILE STRUCTURE (in this order):',
      '   - Imports (framework, target module, factories, mocks)',
      '   - Top-level `describe` (named after module/function under test)',
      '   - `beforeEach` (reset mocks, fresh state)',
      '   - Grouped `describe` blocks: "Happy Path", "Edge Cases", "Negative Scenarios", "Security"',
      '',
      '3. EVERY TEST must follow AAA pattern:',
      '   // Arrange — set up inputs',
      '   // Act — call the function',
      '   // Assert — verify outcome',
      '',
      '4. NAMING: `it(\'should [verb] when [condition]\')` — no vague names like "test auth"',
      '',
      '5. TEST DATA: Use factory functions from __tests__/factories/',
      '   - French text with accents: "Contrôle technique expiré"',
      '   - TND currency with 3 decimals: 150.000',
      '   - Tunisian plate format: "TU-123-1234"',
      '',
      '6. FORBIDDEN: No `if`/`for`/`switch` in test bodies, no `console.log`,',
      '   no `any` type, no shared mutable state between tests.',
    ].join('\n');
  }

  // Editing an existing test file
  return [
    `[Hook: test-workflow] Editing test file: ${fileName}`,
    '',
    'Reminder: Follow MALLOULIAUTO test conventions:',
    '- AAA pattern (Arrange/Act/Assert) with comments for non-trivial tests',
    '- Naming: `it(\'should [verb] when [condition]\')`',
    '- Use factory functions, not inline object literals',
    '- French accents in test data, TND with 3 decimals',
    '- Reset mocks in beforeEach, use mockResolvedValueOnce',
  ].join('\n');
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
    // Not valid JSON — pass through
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  const toolName = hookData.toolName || hookData.tool_name || '';
  const toolInput = hookData.toolInput || hookData.tool_input || {};

  // Only act on file creation/editing tools
  if (!RELEVANT_TOOLS.includes(toolName)) {
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  const filePath = getFilePath(toolName, toolInput);

  // Only act on test files
  if (!isTestFile(filePath)) {
    process.stdout.write(JSON.stringify({ decision: 'continue' }));
    return;
  }

  const systemMessage = buildContextMessage(toolName, filePath);

  process.stdout.write(JSON.stringify({
    decision: 'continue',
    systemMessage,
  }));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: 'continue' }));
});
