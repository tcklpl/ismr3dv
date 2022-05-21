"""
    Script for joining .html files into one to be minified later on.

    Usage:
        join_html_files.py <html_parts.json path> <html parts folder> <index.html (main file) path> <output file>
    
    Example:
        join_html_files.py src/html_parts/html_parts.json src/html_parts src/index.html out/index.html
        (on /visualizer/package.json)
"""
import json, sys, pathlib
from bs4 import BeautifulSoup

html_parts_list = sys.argv[1]
html_parts_folder = sys.argv[2]
html_index_file = sys.argv[3]
html_output = sys.argv[4]

html_parts_list_path = pathlib.Path(html_parts_list)
html_index_file_path = pathlib.Path(html_index_file)
html_parts_folder_path = pathlib.Path(html_parts_folder)

if not html_parts_list_path.exists() or not html_parts_list_path.is_file():
    print('[!] Failed to join the HTML parts: no such loadlist')
    exit(1)

if not html_index_file_path.exists() or not html_index_file_path.is_file():
    print('[!] Failed to join the HTML parts: no such index')
    exit(1)

if not html_parts_folder_path.exists() or not html_parts_folder_path.is_dir():
    print('[!] Failed to join the HTML parts: no such source folder')
    exit(1)

# Load and parse the loadlist
with open(html_parts_list, 'r') as f:
    try:
        html_loadlist_json = json.loads(f.read())
    except:
        print('[!] Failed to join the HTML parts: invalid loadlist')
        exit(1)

# Load the first html file (index)
with open(html_index_file, 'r') as f:
    combined_soup = BeautifulSoup(f.read(), features='html.parser')

# Append to the original in order
for partToAppend in html_loadlist_json['html_parts']:
    part_url: str = html_parts_folder + '/' + partToAppend['url']
    part_append_to: str = partToAppend['append_to']

    part_url_path = pathlib.Path(part_url)
    if not part_url_path.exists() or not part_url_path.is_file():
        print(f'[!] Failed to join the HTML parts: invalid part "{part_url}"')
        exit(1)
    
    with open(part_url, 'r') as f:
        part_soup = BeautifulSoup(f.read(), features='html.parser')
    
    # If we are appending by id
    if '#' in part_append_to:
        soup_target = combined_soup.find(id=part_append_to.replace('#', ''))
    else:
        soup_target = combined_soup.find(part_append_to)
    
    soup_target.append(part_soup)

# Write to the final file
with open(html_output, 'w') as f:
    f.write(str(combined_soup))
