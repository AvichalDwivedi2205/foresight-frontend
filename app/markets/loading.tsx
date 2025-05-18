import Loading from '@/components/Loader';

export default function MarketsLoading() {
  return (
    <Loading 
      fullScreen 
      size="large" 
      message="Discovering prediction markets" 
    />
  );
}
