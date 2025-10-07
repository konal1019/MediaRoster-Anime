import os
import hashlib
import subprocess
import shutil

src_dir = '.'
build_dir = './build'

files_to_hash = {
    'css': [
        os.path.join(src_dir, 'css', 'style.css'),
        os.path.join(src_dir, 'css', 'icons.css'),
        os.path.join(src_dir, 'css', 'search.css'),
        os.path.join(src_dir, 'css', 'details.css')
    ],
    'js': [
        os.path.join(src_dir, 'js', 'pages.js'),
        os.path.join(src_dir, 'js', 'router.js'),
        os.path.join(src_dir, 'js', 'main.js'),
        os.path.join(src_dir, 'js', 'api.js'),
        os.path.join(src_dir, 'js', 'components', 'UIs.js'),
        os.path.join(src_dir, 'js', 'components', 'search.js'),
        os.path.join(src_dir, 'js', 'components', 'details.js'),
        os.path.join(src_dir, 'js', 'components', 'utils.js'),
        os.path.join(src_dir, 'js', 'components', 'data.js')
    ],
    'others': [
        os.path.join(src_dir, 'media', 'jumpscare.mp3'),
        os.path.join(src_dir, 'media', 'jumpscare.jpg'),
        os.path.join(src_dir, 'media', 'logo.webp')
    ]
}


def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)


def minify_file(src, dest):
    ext = os.path.splitext(src)[1].lower()
    ensure_dir(dest)
    cmd = None
    if ext == '.js':
        cmd = ['/home/user/.global_modules/bin/terser', src, '-o', dest, '--compress', '--mangle']
    elif ext == '.css':
        cmd = ['/home/user/.global_modules/bin/cleancss', '-o', dest, src]
    elif ext == '.html':
        cmd = [
            '/home/user/.global_modules/bin/html-minifier', '--collapse-whitespace', '--remove-comments',
            '--minify-css', 'true', '--minify-js', 'true', '-o', dest, src
        ]
    else:
        shutil.copy2(src, dest)
        return

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Minifier failed for {src}, copying instead.")
        shutil.copy2(src, dest)



def copy_dir(src, dest):
    if not os.path.exists(src):
        return
    os.makedirs(dest, exist_ok=True)
    for entry in os.listdir(src):
        s = os.path.join(src, entry)
        d = os.path.join(dest, entry)
        if os.path.isdir(s):
            copy_dir(s, d)
        else:
            shutil.copy2(s, d)


def minify_all():
    print("🪄 Minifying...")
    for category in ['css', 'js']:
        for path in files_to_hash[category]:
            rel_path = os.path.relpath(path, src_dir)
            dest = os.path.join(build_dir, rel_path)
            minify_file(path, dest)

    # Copy others and webfonts
    for path in files_to_hash['others']:
        rel_path = os.path.relpath(path, src_dir)
        dest = os.path.join(build_dir, rel_path)
        ensure_dir(dest)
        shutil.copy2(path, dest)

    copy_dir(os.path.join(src_dir, 'webfonts'), os.path.join(build_dir, 'webfonts'))

    if os.path.exists('index.html'):
        minify_file('index.html', os.path.join(build_dir, 'index.html'))

    print("✅ Minification done.")


def hash_and_update_refs():
    print("🔑 Hashing and updating references...")
    hashed_map = {}
    built_files_to_update = []

    for category in ['css', 'js']:
        for path in files_to_hash[category]:
            built_file = os.path.join(build_dir, os.path.relpath(path, src_dir))
            if not os.path.exists(built_file):
                continue
            with open(built_file, 'rb') as f:
                content = f.read()
            digest = hashlib.md5(content).hexdigest()[:8]
            base, ext = os.path.splitext(os.path.basename(path))
            new_name = f"{base}.{digest}{ext}"
            new_path = os.path.join(os.path.dirname(built_file), new_name)
            os.rename(built_file, new_path)

            # Use just the filename as key for JS files
            hashed_map[f"{base}{ext}"] = new_name

            # Add JS and HTML files to update list immediately
            if ext in ('.js', '.html'):
                built_files_to_update.append(new_path)

    # Add index.html if it exists
    index_file = os.path.join(build_dir, 'index.html')
    if os.path.exists(index_file):
        built_files_to_update.append(index_file)

    # Update references
    for file_path in built_files_to_update:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        for old, new in hashed_map.items():
            text = text.replace(old, new)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)

    print("📝 Updated references in HTML and JS files.")
    print("🎉 Done.")


def main():
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir, exist_ok=True)
    minify_all()
    hash_and_update_refs()


if __name__ == "__main__":
    main()