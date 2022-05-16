import shutil
from sys import argv

src = argv[1]
dst = argv[2]

shutil.copytree(src, dst, ignore=shutil.ignore_patterns('*.ts', '*.html', '*.scss', 'html_parts'), dirs_exist_ok=True)
