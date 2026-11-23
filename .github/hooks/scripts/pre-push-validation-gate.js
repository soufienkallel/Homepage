/**
 * PreToolUse hook: Inject pre-push validation reminder
 *
 * Reminds agent to run the validation gateway (eslint + prettier) before
 * executing any git push operation. Detects both:
 * 1. Direct git push commands (via run_in_terminal, send_to_terminal)
 * 2. File edits that commonly precede a push (implementation/test/spec changes)
 *
 * Input:  JSON on stdin with { hookEventName, toolName, toolInput }
 * Output: JSON on stdout with { decision, systemMessage? }
 *
 * Reference: agents.instructions.md § 8.1 Pre-Push Lint & Format Gate
 */

const GIT_PUSH_PATTERN = /git\s+push/i;

// File patterns that commonly precede a push
const PUSH_RELATED_PATHS = [
  /apps\/(api|unified|packages)\/.*\.(ts|tsx|js)$/,
  /homepage\/.*\.(ts|tsx|js|jsx)$/,
  /apps\/.*\/app\/.*\.(tsx)$/,
  /apps\/.*\/src\/.*\.(ts|tsx)$/,
  /doc\/.*\.md$/,
];

const TOOLS_THAT_RUN_COMMANDS = ['run_in_terminal', 'send_to_terminal'];
const TOOLS_THAT_EDIT_FILES = ['replace_string_in_file', 'multi_replace_string_in_file', 'create_file'];

function getCommandFromTool(toolName, toolInput) {
  if (!toolInput) return null;

  // run_in_terminal has a 'command' field
  if (toolInput.command) {
    return toolInput.command;
  }

  return null;
}

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

function isPushRelatedCommand(command) {
  return GIT_PUSH_PATTERN.test(command);
}

function isPushRelatedFile(filePath) {
  if (!filePath) return false;
  return PUSH_RELATED_PATHS.some(pattern => pattern.test(filePath));
}

function buildPushValidationMessage(trigger, details) {
  const lines = [
    '[Hook: pre-push-validation-gate] Validation Gateway Required',
    '',
    `${trigger}`,
    '',
    'MANDATORY: Run these validation checks BEFORE pushing:',
    '',
    '```bash',
    '# Root-level lint (covers apps/api, apps/packages, apps/unified)',
    'npx eslint . --quiet',
    '',
    '# Homepage lint (separate ESLint config)',
    'cd homepage && npx eslint . --quiet && cd ..',
    '',
    '# Format check (all files)',
    'npm run format:check',
    '```',
    '',
    'IF ANY COMMAND FAILS:',
    '1. Fix lint errors: `npx eslint . --fix --quiet`',
    '2. Fix formatting: `npx prettier --write <file1> <file2> ...`',
    '3. Re-run checks above',
    '4. Then push',
    '',
    'REFERENCE: agents.instructions.md § 8.1 Pre-Push Lint & Format Gate',
    'Pushing with lint errors or formatting violations is a workflow violation.',
  ];

  if (details) {
    lines.push('');
    lines.push(`Details: ${details}`);
  }

  return lines.join('\n');
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

  // Check for direct git push commands
  if (TOOLS_THAT_RUN_COMMANDS.includes(toolName)) {
    const command = getCommandFromTool(toolName, toolInput);
    if (isPushRelatedCommand(command)) {
      const systemMessage = buildPushValidationMessage(
        `Detected git push command: ${command}`,
        'Ensure all files pass ESLint and Prettier before pushing.'
      );
      process.stdout.write(JSON.stringify({
        decision: 'continue',
        systemMessage,
      }));
      return;
    }
  }

  // Check for file edits that commonly precede a push
  if (TOOLS_THAT_EDIT_FILES.includes(toolName)) {
    const filePath = getFilePath(toolName, toolInput);
    if (isPushRelatedFile(filePath)) {
      const systemMessage = buildPushValidationMessage(
        `Detected edit to push-related file: ${filePath}`,
        'Consider running validation gateway before you push these changes.'
      );
      process.stdout.write(JSON.stringify({
        decision: 'continue',
        systemMessage,
      }));
      return;
    }
  }

  // No match — pass through
  process.stdout.write(JSON.stringify({ decision: 'continue' }));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: 'continue' }));
});
