"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import FilterTabs from "@/components/FilterTabs";
import MarketGrid from "@/components/MarketGrid";

export default function MarketsPage() {
  const [currentFilter, setCurrentFilter] = useState("all");

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  return (
    <main className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      <HeroBanner />
      <FilterTabs onFilterChange={handleFilterChange} />
      <MarketGrid filter={currentFilter} />
      <Footer />
    </main>
  );
}