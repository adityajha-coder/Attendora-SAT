const fs = require('fs');

console.log("Starting HTML extract...");
const indexContent = fs.readFileSync('index.html', 'utf8');
const lines = indexContent.split('\n');

const authHtml = lines.slice(25, 83).join('\n');
const landingHtml = lines.slice(85, 114).join('\n');
const dashboardHtml = lines.slice(115, 390).join('\n');
const modalsHtml = lines.slice(391, 809).join('\n');

const newIndexHtml = [
    ...lines.slice(0, 25),
    '    <div id="app"></div>',
    ...lines.slice(809)
].join('\n');

if (!fs.existsSync('src/js/components')) {
    fs.mkdirSync('src/js/components', { recursive: true });
}

fs.writeFileSync('src/js/components/auth-html.js', 'export const authHtml = `\n' + authHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '\n`;\n');
fs.writeFileSync('src/js/components/landing-html.js', 'export const landingHtml = `\n' + landingHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '\n`;\n');
fs.writeFileSync('src/js/components/dashboard-html.js', 'export const dashboardHtml = `\n' + dashboardHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '\n`;\n');
fs.writeFileSync('src/js/components/modals-html.js', 'export const modalsHtml = `\n' + modalsHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '\n`;\n');

fs.writeFileSync('index.html', newIndexHtml);
console.log("HTML extracted and index.html rewritten!");

// Now, patching main.js to inject the HTML
console.log("Patching main.js...");
let mainJs = fs.readFileSync('src/js/main.js', 'utf8');

const importStatement = `import { authHtml } from './components/auth-html.js';
import { landingHtml } from './components/landing-html.js';
import { dashboardHtml } from './components/dashboard-html.js';
import { modalsHtml } from './components/modals-html.js';
`;

mainJs = importStatement + mainJs;

const initAppTarget = `const initializeApp = () => {`;
const initAppReplacement = `const initializeApp = () => {
    document.getElementById('app').innerHTML = authHtml + landingHtml + dashboardHtml + modalsHtml;
`;

mainJs = mainJs.replace(initAppTarget, initAppReplacement);

fs.writeFileSync('src/js/main.js', mainJs);
console.log("main.js patched with HTML injection!");
