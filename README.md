This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Troubleshooting

### Fixing Framer Motion Chunk Loading Error

If you encounter a chunk loading error with framer-motion in the Next.js application, you can fix it by running:

```bash
npm run fix-framer-motion
```

This script:

1. Updates all framer-motion imports to use the custom motion components
2. Wraps AnimatePresence components with LazyMotion to prevent chunk loading issues
3. Clears the Next.js cache
4. Rebuilds the application

#### Manual Fix

If the automated script doesn't resolve the issue, you can manually fix it:

1. Import motion components from the custom wrapper instead of directly from framer-motion:

   ```tsx
   // Instead of:
   import { motion, AnimatePresence } from 'framer-motion';

   // Use:
   import { motion, AnimatePresence, LazyMotion } from '@/components/motion';
   ```

2. Wrap AnimatePresence components with LazyMotion:

   ```tsx
   // Instead of:
   <AnimatePresence>
     {/* content */}
   </AnimatePresence>

   // Use:
   <LazyMotion>
     <AnimatePresence>
       {/* content */}
     </AnimatePresence>
   </LazyMotion>
   ```

3. Clear the Next.js cache:

   ```bash
   npm run clean
   # or manually:
   rm -rf .next
   ```

4. Rebuild the application:

   ```bash
   npm run build
   ```
