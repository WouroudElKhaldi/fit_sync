const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'apps', 'mobile', 'src', 'screens');

const screens = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { regex: /className="([^"]*?)\bbg-background\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ backgroundColor: colors.background }}' },
  { regex: /className="([^"]*?)\btext-on-surface\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ color: colors.text }}' },
  { regex: /className="([^"]*?)\btext-on-surface-variant\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ color: colors.textMuted }}' },
  { regex: /className="([^"]*?)\bbg-surface-container\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ backgroundColor: colors.surfaceContainer }}' },
  { regex: /className="([^"]*?)\bbg-surface-container-high\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ backgroundColor: colors.surfaceContainerHigh }}' },
  { regex: /className="([^"]*?)\btext-display-lg\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ color: colors.text }}' },
  { regex: /className="([^"]*?)\btext-headline-md\b([^"]*?)"/g, replacement: 'className="$1$2" style={{ color: colors.text }}' },
];

screens.forEach(file => {
  if (file === 'SettingsScreen.tsx') return; // already done

  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if useAppTheme is imported
  if (!content.includes('useAppTheme')) {
    content = content.replace(/import React(.*?);/, 'import React$1;\nimport { useAppTheme } from \'../context/ThemeContext\';');
  }

  // Inject const { colors, isDark } = useAppTheme(); inside the component
  const componentRegex = /export default function (\w+)\(.*?\) {/;
  const match = content.match(componentRegex);
  if (match && !content.includes('useAppTheme()')) {
    content = content.replace(componentRegex, `$&\n  const { colors, isDark } = useAppTheme();`);
  }

  // Handle replacements
  replacements.forEach(({ regex, replacement }) => {
    // If a tag already has a style prop, we'd need to merge it.
    // For simplicity, we just replace className. If style exists, it'll be invalid JSX `style={..} style={..}`, but let's see.
    // Let's refine the replacement to handle merging if we want, or just do a quick replace and manually fix any errors.
  });
});
