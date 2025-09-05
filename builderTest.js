const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filesToVersion = [
  'style.css',
  'js/main.js',
  'js/pages.js',
  'js/api.js',
  'js/router.js'
];

const projectDir = __dirname;
const indexHtmlPath = path.join(projectDir, 'index.html');
let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('Starting asset versioning...');

filesToVersion.forEach(filePath => {
  const fullPath = path.join(projectDir, filePath);
  
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
  const newFilePath = path.join(projectDir, dirName, newFileName);

  fs.renameSync(fullPath, newFilePath);
  
  const oldRelativePath = filePath.replace(/\\/g, '/');
  const newRelativePath = path.join(dirName, newFileName).replace(/\\/g, '/');
  
  indexHtmlContent = indexHtmlContent.replace(
    new RegExp(oldRelativePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
    newRelativePath
  );
  
  console.log(`- Versioned ${oldRelativePath} -> ${newRelativePath}`);
});

fs.writeFileSync(indexHtmlPath, indexHtmlContent);

console.log('Versioning complete. index.html has been updated.');