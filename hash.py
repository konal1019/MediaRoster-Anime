# 80% AI code cuz I was too lazy to dedicate time to this

import os
import re
import shutil
import hashlib

def copy_dir(src, dest):
    """Recursively copy a directory."""
    if not os.path.exists(dest):
        os.makedirs(dest)
    for entry in os.listdir(src):
        src_path = os.path.join(src, entry)
        dest_path = os.path.join(dest, entry)
        if os.path.isdir(src_path):
            copy_dir(src_path, dest_path)
        else:
            shutil.copy2(src_path, dest_path)

def hash_and_copy():
    """Hashes files and updates their references in other files."""
    src_dir = '.'
    build_dir = './build'

    files_to_hash = {
        'css': [
            os.path.join(src_dir, 'css', 'style.css'),
            os.path.join(src_dir, 'css', 'icons.css'),
            os.path.join(src_dir, 'css', 'search.css')
        ],
        'js': [
            os.path.join(src_dir, 'js', 'pages.js'),
            os.path.join(src_dir, 'js', 'router.js'),
            os.path.join(src_dir, 'js', 'main.js'),
            os.path.join(src_dir, 'js', 'api.js')
        ],
        'others': [
            os.path.join(src_dir, 'jumpscare.mp3'),
            os.path.join(src_dir, 'jumpscare.jpg')
        ]
    }
    
    # Clean and set up build directory
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir)
    os.makedirs(os.path.join(build_dir, 'css'))
    os.makedirs(os.path.join(build_dir, 'js'))
    os.makedirs(os.path.join(build_dir, 'webfonts'))

    # Copy index.html without hashing
    shutil.copy2(os.path.join(src_dir, 'index.html'), build_dir)
    print(f'Copied: index.html -> {build_dir}')

    # Copy webfonts directory without hashing
    copy_dir(os.path.join(src_dir, 'webfonts'), os.path.join(build_dir, 'webfonts'))

    hashed_file_paths = {}

    all_files_to_hash = sum(files_to_hash.values(), [])

    # Process files that need hashing
    for full_path in all_files_to_hash:
        try:
            with open(full_path, 'rb') as f:
                content = f.read()
            
            file_hash = hashlib.md5(content).hexdigest()[:8]
            file_name, ext = os.path.splitext(os.path.basename(full_path))
            
            relative_source_dir = os.path.relpath(os.path.dirname(full_path), src_dir)
            
            new_file_name = f'{file_name}.{file_hash}{ext}'
            dest_path = os.path.join(build_dir, relative_source_dir, new_file_name)
            
            # Ensure destination directory exists
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            with open(dest_path, 'wb') as f:
                f.write(content)
            
            # Simple filename mapping: /filename.ext -> /filename.hash.ext
            original_filename = f'/{os.path.basename(full_path)}'
            new_filename = f'/{new_file_name}'
            hashed_file_paths[original_filename] = new_filename
            
            print(f'Hashed: {original_filename} -> {new_filename}')
        except FileNotFoundError:
            print(f'Warning: File not found: {full_path}')

    # Update references in all relevant files
    files_to_update = [os.path.join(build_dir, 'index.html')]
    for f in files_to_hash['css'] + files_to_hash['js']:
        file_name = os.path.basename(f)
        original_filename = f'/{file_name}'
        if original_filename in hashed_file_paths:
            new_filename = hashed_file_paths[original_filename][1:]  # Remove leading /
            relative_source_dir = os.path.relpath(os.path.dirname(f), src_dir)
            files_to_update.append(os.path.join(build_dir, relative_source_dir, new_filename))

    for file_path in files_to_update:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Simple replacement: /filename.ext -> /filename.hash.ext
            for original_path, new_path in hashed_file_paths.items():
                content = content.replace(original_path, new_path)

            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated references in: {os.path.relpath(file_path, build_dir)}')
        except FileNotFoundError:
            print(f'Warning: File not found for update: {file_path}')

if __name__ == '__main__':
    hash_and_copy()