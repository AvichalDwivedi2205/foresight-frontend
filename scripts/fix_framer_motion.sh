#!/bin/bash

# Fix framer-motion chunk loading errors in Next.js

echo "Starting framer-motion fixes..."

# Step 1: Update imports to use custom motion components
echo "Updating imports..."
python3 scripts/fix_framer_motion_imports.py

# Step 2: Wrap AnimatePresence with LazyMotion
echo "Wrapping AnimatePresence with LazyMotion..."
python3 scripts/wrap_animate_presence.py

# Step 3: Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Step 4: Rebuild the application
echo "Rebuilding the application..."
npm run build

echo "Framer-motion fixes completed!"
