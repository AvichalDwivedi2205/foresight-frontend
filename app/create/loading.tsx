"use client"

import Loading from '@/components/Loader';

export default function CreateLoading() {
  return (
    <Loading 
      fullScreen 
      size="large" 
      message="Setting up market creation" 
    />
  );
}
