import Loading from '@/components/Loader';

export default function MarketLoading() {
  return (
    <Loading 
      fullScreen 
      size="large" 
      message="Loading market details" 
    />
  );
}
