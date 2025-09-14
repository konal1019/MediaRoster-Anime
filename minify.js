const fs = require('fs');
const path = require('path');
const { minify: htmlMinify } = require('html-minifier-terser');
const Terser = require('terser');
const CleanCSS = require('clean-css');

const srcDir = '.';
const buildDir = './build';

const filesToMinify = {
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

async function minifyFiles() {
    console.log('Starting minification...');
    // Create necessary directories
    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'js'), { recursive: true });

    // HTML
    for (const file of filesToMinify.html) {
        const content = fs.readFileSync(file, 'utf-8');
        const minified = await htmlMinify(content, { collapseWhitespace: true, removeComments: true });
        const destPath = path.join(buildDir, path.basename(file));
        fs.writeFileSync(destPath, minified);
        console.log(`Minified: ${file}`);
    }

    // CSS
    const cleanCss = new CleanCSS();
    for (const file of filesToMinify.css) {
        const content = fs.readFileSync(file, 'utf-8');
        const minified = cleanCss.minify(content).styles;
        const destPath = path.join(buildDir, 'css', path.basename(file));
        fs.writeFileSync(destPath, minified);
        console.log(`Minified: ${file}`);
    }

    // JS
    for (const file of filesToMinify.js) {
        const content = fs.readFileSync(file, 'utf-8');
        const minified = await Terser.minify(content);
        const destPath = path.join(buildDir, 'js', path.basename(file));
        fs.writeFileSync(destPath, minified.code);
        console.log(`Minified: ${file}`);
    }

    console.log('\nMinification complete.');
}

minifyFiles();