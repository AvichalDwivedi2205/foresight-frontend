import Loading from '@/components/Loader';

export default function MarketDetailLoading() {
  return (
    <Loading 
      fullScreen 
      size="large" 
      message="Loading market details" 
    />
  );
}
