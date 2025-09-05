const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const buildDir = path.join(__dirname, 'build');
const jsDir = 'js';
const filesToVersion = [
  'style.css',
  path.join(jsDir, 'main.js'),
  path.join(jsDir, 'pages.js'),
  path.join(jsDir, 'api.js'),
  path.join(jsDir, 'router.js')
];

if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
}
fs.mkdirSync(buildDir);
fs.mkdirSync(path.join(buildDir, jsDir));

console.log('Starting build process...');

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

filesToVersion.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`Warning: File not found at ${fullPath}. Skipping.`);
    return;
  }
  
  const content = fs.readFileSync(fullPath);
  const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);
  
  const newFileName = `${baseName}.${hash}${ext}`;
  const newFilePath = path.join(buildDir, dirName, newFileName);
  
  fs.copyFileSync(fullPath, newFilePath);
  
  const oldRelativePath = filePath.replace(/\\/g, '/');
  const newRelativePath = path.join(dirName, newFileName).replace(/\\/g, '/');
  
  indexHtmlContent = indexHtmlContent.replace(
    new RegExp(oldRelativePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
    newRelativePath
  );
  
  console.log(`- Copied and versioned ${oldRelativePath} -> ${newRelativePath}`);
});

fs.writeFileSync(path.join(buildDir, 'index.html'), indexHtmlContent);

console.log('Build complete. The "build" folder is ready for deployment.');