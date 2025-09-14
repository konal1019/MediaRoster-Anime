const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const buildDir = './build';

const filesToHash = {
    css: [
        path.join(buildDir, 'css', 'style.css'),
        path.join(buildDir, 'css', 'icons.css'),
        path.join(buildDir, 'css', 'search.css')
    ],
    js: [
        path.join(buildDir, 'js', 'pages.js'),
        path.join(buildDir, 'js', 'router.js'),
        path.join(buildDir, 'js', 'main.js'),
        path.join(buildDir, 'js', 'api.js')
    ]
};

async function hashAndRename() {
    console.log('Starting name hashing...');
    const hashedFiles = {};
    const allFilesToHash = [...filesToHash.css, ...filesToHash.js];

    // Hash and rename files
    for (const fullPath of allFilesToHash) {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
        const ext = path.extname(fullPath);
        const fileName = path.basename(fullPath, ext);
        const dirName = path.dirname(fullPath);
        const newFileName = `${fileName}.${hash}${ext}`;
        const newPath = path.join(dirName, newFileName);

        fs.renameSync(fullPath, newPath);
        const relativePath = path.relative(buildDir, newPath);
        hashedFiles[path.relative(buildDir, fullPath)] = relativePath;
        console.log(`Hashed: ${path.relative(buildDir, fullPath)} -> ${relativePath}`);
    }

    // Update index.html
    const indexPath = path.join(buildDir, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf-8');

    for (const originalPath in hashedFiles) {
        indexContent = indexContent.replace(originalPath, hashedFiles[originalPath]);
    }

    fs.writeFileSync(indexPath, indexContent);
    console.log('\nUpdated index.html with hashed file names.');
    console.log('Name hashing complete.');
}

hashAndRename();
