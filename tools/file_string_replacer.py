import pathlib
"""
    Script to copy one file to another one while replacing parts of it. Wrote in order to not have sed as a dependency anymore.

    Usaage:
        file_string_replacer.py <source file> <out file> [<replacements>]
            Replacements as: "<old string>/<new string>"
    
    Example:
        file_string_replacer.py .env.model .env "<PORT>/$SERVER_PORT" "<UNESPKEY>/$UNESP_API_KEY"
"""
from sys import argv

source_file = argv[1]
out_file = argv[2]
replacements = argv[3:]

source_path = pathlib.Path(source_file)

if not source_path.exists() or not source_path.is_file():
    print('[!] Failed to edit file: no such file')
    exit(1)

with open(source_file, 'r') as f:
    source_str = f.read()

for replacement in replacements:
    old_string, new_string = replacement.split('/')

    source_str = source_str.replace(old_string, new_string)

with open(out_file, 'w') as f:
    f.write(source_str)