"""
    Script for copying files from on directory to another, wrote in order to not have rsync as a dependency anymore.
    It copies all files EXCEPT .ts, .html, .scss and the html_parts folder.

    Usage:
        copy_files.py <source folder> <destination folder>
    
    Example:
        copy_files.py src/ out/
        (on /visualizer/package.json and /server/package.json)
"""
import json, hashlib, shutil, sys
from sys import argv
from pathlib import Path
from typing import Dict, List

src = argv[1]
dst = argv[2]

all_file_names = list(Path(src).rglob("*"))
filtered_file_names = filter(lambda x: x.is_file() and not x.name.endswith(('.ts', '.html', '.scss')), all_file_names)

hashes_file_name = f'{sys.path[0]}/copy_files_hashes.json'

hash_dict: Dict = {}
files_to_copy: List[Path] = []

if Path(hashes_file_name).exists():
    with open(hashes_file_name, 'r') as f:
        hash_dict = json.loads(f.read())

for file in filtered_file_names:
    current_name = file.relative_to(src).as_posix()
    current_md5 = hashlib.md5()
    with open(file, 'rb') as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            current_md5.update(byte_block)
        
    md5_digest = current_md5.hexdigest()

    if current_name not in hash_dict:
        print(f'[-] New File: {current_name}')
        files_to_copy.append(file)
    else:
        if hash_dict[current_name] != md5_digest:
            print(f'[-] Modified File: {current_name}')
            files_to_copy.append(file)

    hash_dict[current_name] = md5_digest

with open(hashes_file_name, 'w') as f:
    f.write(json.dumps(hash_dict))

for f in files_to_copy:
    new_path = f'{dst}/{f.relative_to(src)}'
    shutil.copyfile(f, new_path)

