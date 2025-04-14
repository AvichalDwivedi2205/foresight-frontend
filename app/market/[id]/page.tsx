import { Suspense } from 'react';
import MarketDetailClient from '@/components/market/MarketDetailClient';
import MarketSkeleton from "@/components/market/MarketSkeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Server component that safely handles params without using React.use()
export default function MarketDetailPage({ params }: { params: { id: string } }) {
  // In a server component, we can directly use params.id without React.use()
  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      <Suspense fallback={<MarketSkeleton />}>
        <MarketDetailClient marketId={params.id} />
      </Suspense>
      <Footer />
    </div>
  );
}