import Loading from '@/components/Loader';

export default function ProfileLoading() {
  return (
    <Loading 
      fullScreen 
      size="large" 
      message="Loading profile data" 
    />
  );
}
