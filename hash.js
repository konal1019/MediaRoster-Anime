const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const srcDir = '.';
const buildDir = './build';

const filesToHash = {
    html: [path.join(srcDir, 'index.html')],
    css: [
        path.join(srcDir, 'css', 'style.css'),
        path.join(srcDir, 'css', 'icons.css'),
        path.join(srcDir, 'css', 'search.css')
    ],
    js: [
        path.join(srcDir, 'js', 'pages.js'),
        path.join(srcDir, 'js', 'router.js'),
        path.join(srcDir, 'js', 'main.js'),
        path.join(srcDir, 'js', 'api.js')
    ]
};

function hashAndCopy() {
    console.log('Starting name hashing and file copying...');

    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'js'), { recursive: true });

    const hashedFilePaths = {};

    // Copy index.html first since it doesn't get hashed
    const indexSourcePath = filesToHash.html[0];
    const indexDestPath = path.join(buildDir, path.basename(indexSourcePath));
    fs.copyFileSync(indexSourcePath, indexDestPath);

    // Process CSS and JS files
    const allFilesToHash = [...filesToHash.css, ...filesToHash.js];
    for (const fullPath of allFilesToHash) {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
        const ext = path.extname(fullPath);
        const fileName = path.basename(fullPath, ext);
        const relativeSourceDir = path.relative(srcDir, path.dirname(fullPath));
        const newFileName = `${fileName}.${hash}${ext}`;
        const destPath = path.join(buildDir, relativeSourceDir, newFileName);

        fs.writeFileSync(destPath, content);

        const originalRelativePath = path.join(relativeSourceDir, path.basename(fullPath));
        const newRelativePath = path.join(relativeSourceDir, newFileName);
        hashedFilePaths[originalRelativePath] = newRelativePath;
        console.log(`Hashed: ${originalRelativePath} -> ${newRelativePath}`);
    }

    // Update index.html with new hashed names
    let indexContent = fs.readFileSync(indexDestPath, 'utf-8');
    for (const originalPath in hashedFilePaths) {
        indexContent = indexContent.replace(originalPath, hashedFilePaths[originalPath]);
    }

    fs.writeFileSync(indexDestPath, indexContent);
    console.log('\nUpdated index.html with hashed file names.');
    console.log('Process completed successfully.');
}

hashAndCopy();
