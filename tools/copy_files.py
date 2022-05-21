"""
    Script for copying files from on directory to another, wrote in order to not have rsync as a dependency anymore.
    It copies all files EXCEPT .ts, .html, .scss and the html_parts folder.

    Usage:
        copy_files.py <source folder> <destination folder>
    
    Example:
        copy_files.py src/ out/
        (on /visualizer/package.json and /server/package.json)
"""
import shutil
from sys import argv

src = argv[1]
dst = argv[2]

shutil.copytree(src, dst, ignore=shutil.ignore_patterns('*.ts', '*.html', '*.scss', 'html_parts'), dirs_exist_ok=True)
