import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

// For classes where we just drop the `[]` wrapper and `var(...)` inner
const regexMap = [
    { from: /divide-\[var\(--color-border\)\]/g, to: 'divide-border' },
    { from: /border-\[var\(--color-bg-secondary\)\]/g, to: 'border-bg-secondary' },
    { from: /bg-\[var\(--color-text-tertiary\)\]/g, to: 'bg-text-tertiary' },
    { from: /bg-\[var\(--color-text-primary\)\]/g, to: 'bg-text-primary' },
    { from: /text-\[var\(--color-bg-primary\)\]/g, to: 'text-bg-primary' },
    { from: /hover:bg-\[var\(--color-text-tertiary\)\]/g, to: 'hover:bg-text-tertiary' },
    { from: /stroke-\[var\(--color-primary\)\]/g, to: 'stroke-primary' },
    { from: /stroke-\[var\(--color-success\)\]/g, to: 'stroke-success' },
    { from: /hover:text-\[var\(--color-primary-hover\)\]/g, to: 'hover:text-primary-hover' },
    { from: /ring-\[var\(--color-bg-secondary\)\]/g, to: 'ring-bg-secondary' }
];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    let totalReplacements = 0;

    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            totalReplacements += processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let initialContent = content;
            let fileReplacements = 0;

            for (const { from, to } of regexMap) {
                const matches = content.match(from);
                if (matches) {
                    fileReplacements += matches.length;
                    content = content.replace(from, to);
                }
            }

            if (content !== initialContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated file: ${fullPath} (${fileReplacements} replacements)`);
                totalReplacements += fileReplacements;
            }
        }
    }
    return totalReplacements;
}

const total = processDirectory(componentsDir);
console.log(`\nOperation complete. Total replacements made: ${total}`);
