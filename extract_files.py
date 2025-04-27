#!/usr/bin/env python3
"""
extract_files.py

Read allfiles.json (an array of { "path": ..., "content": ... })
and write each file to disk, creating directories as needed.
"""

import json
import os
import argparse

def extract(json_path, target_root):
    # Load the list of files from JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        files = json.load(f)

    for entry in files:
        # Full path where this file will be written
        dest_path = os.path.join(target_root, entry['path'])
        dest_dir = os.path.dirname(dest_path)

        # Create directory if it doesn't exist
        if dest_dir and not os.path.exists(dest_dir):
            os.makedirs(dest_dir, exist_ok=True)

        # Write the file content
        with open(dest_path, 'w', encoding='utf-8') as out:
            out.write(entry['content'])

        print(f"✔️  Wrote {dest_path}")

def main():
    parser = argparse.ArgumentParser(
        description="Rebuild project files from allfiles.json"
    )
    parser.add_argument(
        '-j', '--json',
        default='allfiles.json',
        help="Path to the JSON file (default: allfiles.json)"
    )
    parser.add_argument(
        '-o', '--out',
        default='.',
        help="Root directory to extract into (default: current directory)"
    )
    args = parser.parse_args()

    extract(args.json, args.out)
    print("\n🎉 All files extracted successfully!")

if __name__ == '__main__':
    main()
