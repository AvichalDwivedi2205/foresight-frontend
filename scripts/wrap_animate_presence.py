# This script wraps AnimatePresence components with LazyMotion to prevent chunk loading issues

import os
import re
from pathlib import Path

# Root directory of the project
root_dir = Path('/home/avich/foresight-protocol/foresight-frontend')

# Regular expression to find AnimatePresence without LazyMotion wrapper
animate_presence_pattern = re.compile(r'(<AnimatePresence[^>]*>)', re.MULTILINE)

def process_file(file_path):
    """Process a single file to wrap AnimatePresence with LazyMotion"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if the file has AnimatePresence
    if '<AnimatePresence' in content and 'LazyMotion' not in content:
        # Add import for LazyMotion if not present
        if "import { motion, AnimatePresence } from '@/components/motion';" in content:
            content = content.replace(
                "import { motion, AnimatePresence } from '@/components/motion';",
                "import { motion, AnimatePresence, LazyMotion } from '@/components/motion';"
            )
        elif "import { AnimatePresence } from '@/components/motion';" in content:
            content = content.replace(
                "import { AnimatePresence } from '@/components/motion';",
                "import { AnimatePresence, LazyMotion } from '@/components/motion';"
            )
        
        # Wrap AnimatePresence with LazyMotion
        updated_content = animate_presence_pattern.sub(r'<LazyMotion>\n        \1', content)
        
        # Add closing tag for LazyMotion
        updated_content = updated_content.replace('</AnimatePresence>', '</AnimatePresence>\n      </LazyMotion>')
        
        # Write the updated content back to the file if changes were made
        if content != updated_content:
            print(f"Updating: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            return True
    return False

def find_and_update_files():
    """Find all TypeScript/JavaScript files and wrap AnimatePresence with LazyMotion"""
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
    print("Wrapping AnimatePresence with LazyMotion to prevent chunk loading issues...")
    updated = find_and_update_files()
    print(f"Updated {updated} files.")
