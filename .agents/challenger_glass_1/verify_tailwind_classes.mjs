import { readFileSync, existsSync } from 'node:fs';

const filePath = 'src/components/RadarResearchSections.jsx';
console.log(`Verifying Tailwind classes in ${filePath}...`);

if (!existsSync(filePath)) {
  console.error(`Error: File ${filePath} does not exist!`);
  process.exit(1);
}

const content = readFileSync(filePath, 'utf-8');

const checks = [
  {
    name: 'backdrop-blur-md on cards',
    test: () => {
      // Find the card container element and check for backdrop-blur-md
      const matches = content.match(/className=\{`[^`]*backdrop-blur-md[^`]*`\}/);
      return !!matches || content.includes('backdrop-blur-md');
    },
    expected: 'backdrop-blur-md'
  },
  {
    name: 'group-hover:scale-110 for image scaling',
    test: () => {
      // We expect two occurrences of group-hover:scale-110
      const matches = content.match(/group-hover:scale-110/g);
      return matches && matches.length >= 2;
    },
    expected: 'At least 2 occurrences of group-hover:scale-110'
  },
  {
    name: 'group-hover:opacity-100 for CTA button overlay visibility',
    test: () => {
      return content.includes('group-hover:opacity-100');
    },
    expected: 'group-hover:opacity-100'
  },
  {
    name: 'line-clamp-3 (or similar clamping class) for description paragraph text',
    test: () => {
      return content.includes('line-clamp-3') || content.includes('line-clamp-');
    },
    expected: 'line-clamp-3 or other line-clamp class'
  }
];

let failed = false;
for (const check of checks) {
  const passed = check.test();
  if (passed) {
    console.log(`✅ PASS: ${check.name} (Found: "${check.expected}")`);
  } else {
    console.error(`❌ FAIL: ${check.name} (Expected: "${check.expected}")`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('🎉 All Tailwind class checks passed!');
}
