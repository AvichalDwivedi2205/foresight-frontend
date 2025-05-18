import Loading from '@/components/Loader';

export default function LeaderboardLoading() {
  return (
    <Loading 
      fullScreen 
      size="large" 
      message="Loading leaderboard data" 
    />
  );
}
