# This script updates all imports of framer-motion to use the custom motion components
# to prevent chunk loading errors in Next.js

import os
import re
from pathlib import Path

# Root directory of the project
root_dir = Path('/home/avich/foresight-protocol/foresight-frontend')

# Regular expression to match framer-motion imports
framer_motion_import_pattern = re.compile(r'import\s+{\s*([^}]*)\s*}\s+from\s+[\'"]framer-motion[\'"]\s*;?')

# Regular expression to find motion and AnimatePresence in the import
motion_pattern = re.compile(r'\bmotion\b')
animate_presence_pattern = re.compile(r'\bAnimatePresence\b')

def process_file(file_path):
    """Process a single file to update framer-motion imports"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if the file imports framer-motion
    if 'framer-motion' in content:
        # Replace the import
        updated_content = framer_motion_import_pattern.sub(
            lambda m: f'import {{ {m.group(1)} }} from \'@/components/motion\';',
            content
        )
        
        # Write the updated content back to the file if changes were made
        if content != updated_content:
            print(f"Updating: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            return True
    return False

def find_and_update_files():
    """Find all TypeScript/JavaScript files and update framer-motion imports"""
    count = 0
    for ext in ['*.tsx', '*.ts', '*.jsx', '*.js']:
        for file_path in root_dir.glob(f'**/{ext}'):
            # Skip node_modules and our custom motion component
            if 'node_modules' in str(file_path) or 'components/motion' in str(file_path):
                continue
            
            if process_file(file_path):
                count += 1
    
    return count

if __name__ == "__main__":
    print("Updating framer-motion imports to use custom motion components...")
    updated = find_and_update_files()
    print(f"Updated {updated} files.")
