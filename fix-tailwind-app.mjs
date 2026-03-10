import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'src', 'app');

const regexMap = [
    { from: /text-\[var\(--color-text-primary\)\]/g, to: 'text-text-primary' },
    { from: /text-\[var\(--color-text-secondary\)\]/g, to: 'text-text-secondary' },
    { from: /text-\[var\(--color-text-tertiary\)\]/g, to: 'text-text-tertiary' },
    
    { from: /bg-\[var\(--color-bg-primary\)\]/g, to: 'bg-bg-primary' },
    { from: /bg-\[var\(--color-bg-secondary\)\]/g, to: 'bg-bg-secondary' },
    { from: /bg-\[var\(--color-bg-tertiary\)\]/g, to: 'bg-bg-tertiary' },
    { from: /bg-\[var\(--color-bg-elevated\)\]/g, to: 'bg-bg-elevated' },
    
    { from: /border-\[var\(--color-border\)\]/g, to: 'border-border' },
    { from: /border-\[var\(--color-border-hover\)\]/g, to: 'border-border-hover' },
    
    { from: /bg-\[var\(--color-primary\)\]/g, to: 'bg-primary' },
    { from: /bg-\[var\(--color-primary-hover\)\]/g, to: 'bg-primary-hover' },
    { from: /bg-\[var\(--color-primary-light\)\]/g, to: 'bg-primary-light' },
    { from: /text-\[var\(--color-primary\)\]/g, to: 'text-primary' },
    { from: /border-\[var\(--color-primary\)\]/g, to: 'border-primary' },
    { from: /ring-\[var\(--color-primary\)\]/g, to: 'ring-primary' },
    
    { from: /bg-\[var\(--color-success\)\]/g, to: 'bg-success' },
    { from: /bg-\[var\(--color-success-light\)\]/g, to: 'bg-success-light' },
    { from: /text-\[var\(--color-success\)\]/g, to: 'text-success' },
    { from: /border-\[var\(--color-success\)\]/g, to: 'border-success' },
    
    { from: /bg-\[var\(--color-warning\)\]/g, to: 'bg-warning' },
    { from: /bg-\[var\(--color-warning-light\)\]/g, to: 'bg-warning-light' },
    { from: /text-\[var\(--color-warning\)\]/g, to: 'text-warning' },
    { from: /border-\[var\(--color-warning\)\]/g, to: 'border-warning' },
    
    { from: /bg-\[var\(--color-error\)\]/g, to: 'bg-error' },
    { from: /bg-\[var\(--color-error-light\)\]/g, to: 'bg-error-light' },
    { from: /text-\[var\(--color-error\)\]/g, to: 'text-error' },
    { from: /border-\[var\(--color-error\)\]/g, to: 'border-error' },
    
    { from: /bg-\[var\(--color-info\)\]/g, to: 'bg-info' },
    { from: /bg-\[var\(--color-info-light\)\]/g, to: 'bg-info-light' },
    { from: /text-\[var\(--color-info\)\]/g, to: 'text-info' },
    { from: /border-\[var\(--color-info\)\]/g, to: 'border-info' },
    
    { from: /placeholder-\[var\(--color-text-tertiary\)\]/g, to: 'placeholder-text-tertiary' },
    { from: /divide-\[var\(--color-border\)\]/g, to: 'divide-border' },
    { from: /border-\[var\(--color-bg-secondary\)\]/g, to: 'border-bg-secondary' },
    { from: /bg-\[var\(--color-text-tertiary\)\]/g, to: 'bg-text-tertiary' },
    { from: /bg-\[var\(--color-text-primary\)\]/g, to: 'bg-text-primary' },
    { from: /text-\[var\(--color-bg-primary\)\]/g, to: 'text-bg-primary' },
    { from: /hover:bg-\[var\(--color-text-tertiary\)\]/g, to: 'hover:bg-text-tertiary' },
    { from: /hover:bg-\[var\(--color-bg-tertiary\)\]/g, to: 'hover:bg-bg-tertiary' },
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
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
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

const total = processDirectory(appDir);
console.log(`\nOperation complete. Total replacements made: ${total}`);
