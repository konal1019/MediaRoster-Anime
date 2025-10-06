import os
import shutil
import hashlib
import subprocess

def copy_dir(src, dest):
    if not os.path.exists(dest):
        os.makedirs(dest)
    for entry in os.listdir(src):
        src_path = os.path.join(src, entry)
        dest_path = os.path.join(dest, entry)
        if os.path.isdir(src_path):
            copy_dir(src_path, dest_path)
        else:
            shutil.copy2(src_path, dest_path)

def minify_file(input_path, output_path):
    ext = input_path.split('.')[-1].lower()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    try:
        if ext == 'js':
            subprocess.run(['terser', input_path, '-o', output_path, '--compress', '--mangle'], check=True)
        elif ext == 'css':
            subprocess.run(['cleancss', '-o', output_path, input_path], check=True)
        elif ext == 'html':
            subprocess.run([
                'html-minifier', '--collapse-whitespace', '--remove-comments',
                '--minify-css', 'true', '--minify-js', 'true',
                '-o', output_path, input_path
            ], check=True)
        else:
            shutil.copy2(input_path, output_path)
    except FileNotFoundError:
        print(f"Warning: Minifier CLI not installed for {ext}, copying as-is.")
        shutil.copy2(input_path, output_path)

def hash_and_copy():
    src_dir = '.'
    build_dir = './build'

    files_to_hash = {
        'css': [
            'css/style.css',
            'css/icons.css',
            'css/search.css',
            'css/details.css'
        ],
        'js': [
            'js/pages.js',
            'js/router.js',
            'js/main.js',
            'js/api.js',
            'js/components/UIs.js',
            'js/components/search.js',
            'js/components/details.js',
            'js/components/utils.js'
        ],
        'others': [
            'jumpscare.mp3',
            'jumpscare.jpg',
            'logo.webp'
        ]
    }

    # Clean build folder
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir)
    os.makedirs(os.path.join(build_dir, 'css'))
    os.makedirs(os.path.join(build_dir, 'js'))
    os.makedirs(os.path.join(build_dir, 'webfonts'))

    # Copy index.html and minify
    minify_file(os.path.join(src_dir, 'index.html'), os.path.join(build_dir, 'index.html'))

    # Copy webfonts
    copy_dir(os.path.join(src_dir, 'webfonts'), os.path.join(build_dir, 'webfonts'))

    hashed_file_paths = {}
    all_files_to_hash = sum(files_to_hash.values(), [])

    for relative_path in all_files_to_hash:
        full_path = os.path.join(src_dir, relative_path)
        try:
            with open(full_path, 'rb') as f:
                content = f.read()
            file_hash = hashlib.md5(content).hexdigest()[:8]
            file_name, ext = os.path.splitext(os.path.basename(full_path))
            new_file_name = f'{file_name}.{file_hash}{ext}'
            dest_path = os.path.join(build_dir, relative_path)
            dest_path = os.path.join(os.path.dirname(dest_path), new_file_name)

            # Minify + write to build folder
            minify_file(full_path, dest_path)

            original_filename = f'/{os.path.basename(full_path)}'
            new_filename = f'/{new_file_name}'
            hashed_file_paths[original_filename] = new_filename

            print(f'Hashed + Minified: {original_filename} -> {new_filename}')
        except FileNotFoundError:
            print(f'Warning: File not found: {full_path}')

    # Update references in index.html
    index_path = os.path.join(build_dir, 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    for original, new in hashed_file_paths.items():
        content = content.replace(original, new)

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated references in index.html')

if __name__ == '__main__':
    hash_and_copy()
