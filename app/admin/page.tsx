"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../lib/wallet-provider";
import { useToast } from "../../lib/hooks/useToast";
import { motion } from "framer-motion";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { showToast } = useToast();
  const [markets, setMarkets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"markets" | "users" | "stats">("markets");
  
  // Admin wallet address - in production, this should be stored securely
  const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "9UeZSKHJ9MwkDYXuCNvo3x9TnQUvN7rBsBYP9bZRc1Z4"; // Replace with your wallet address
  
  // Check if the connected wallet is the admin wallet
  useEffect(() => {
    if (!connected) {
      showToast("Please connect your wallet to access admin page", "warning");
      return;
    }

    const checkAdmin = () => {
      if (publicKey?.toString() !== ADMIN_WALLET) {
        showToast("Unauthorized access. Redirecting to home page.", "error");
        router.push("/");
      } else {
        fetchData();
      }
    };

    checkAdmin();
  }, [publicKey, connected, router, showToast]);

  // Fetch data from Firebase
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      const db = getFirestore();
      
      // Fetch markets
      const marketsSnapshot = await getDocs(collection(db, "markets"));
      const marketsData = marketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setMarkets(marketsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showToast("Error loading admin data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a market
  const deleteMarket = async (marketId: string) => {
    if (!confirm("Are you sure you want to delete this market?")) return;
    
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "markets", marketId));
      
      showToast("Market deleted successfully", "success");
      // Update local state
      setMarkets(markets.filter(market => market.id !== marketId));
    } catch (error) {
      console.error("Error deleting market:", error);
      showToast("Error deleting market", "error");
    }
  };

  // Function to feature/unfeature a market
  const toggleFeatureMarket = async (marketId: string, isFeatured: boolean) => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "markets", marketId), {
        featured: !isFeatured,
      });
      
      showToast(`Market ${isFeatured ? "unfeatured" : "featured"} successfully`, "success");
      // Update local state
      setMarkets(markets.map(market => 
        market.id === marketId ? { ...market, featured: !isFeatured } : market
      ));
    } catch (error) {
      console.error("Error toggling market feature status:", error);
      showToast("Error updating market", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white pt-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#5F6FFF] rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white pt-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1C1C22] rounded-xl p-6 shadow-xl border border-white/5"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-[#5F6FFF] rounded-lg text-sm"
            >
              Refresh Data
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-6">
            <button
              className={`px-4 py-2 ${activeTab === "markets" ? "text-[#5F6FFF] border-b-2 border-[#5F6FFF]" : "text-white/70"}`}
              onClick={() => setActiveTab("markets")}
            >
              Markets
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "users" ? "text-[#5F6FFF] border-b-2 border-[#5F6FFF]" : "text-white/70"}`}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "stats" ? "text-[#5F6FFF] border-b-2 border-[#5F6FFF]" : "text-white/70"}`}
              onClick={() => setActiveTab("stats")}
            >
              Stats
            </button>
          </div>
          
          {/* Markets Tab */}
          {activeTab === "markets" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Markets ({markets.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-[#131317] rounded-lg overflow-hidden">
                  <thead className="bg-[#1C1C22]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Market ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Question</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Creator</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {markets.map((market) => (
                      <tr key={market.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          <span className="font-mono">{market.id.substring(0, 8)}...</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          <Link href={`/market/${market.id}`} className="hover:text-[#5F6FFF] transition-colors">
                            {market.question ? 
                              (market.question.length > 50 ? market.question.substring(0, 50) + "..." : market.question) 
                              : "Unnamed Market"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          <span className="font-mono">{market.creatorPubkey?.substring(0, 4)}...{market.creatorPubkey?.substring(market.creatorPubkey.length - 4)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            market.resolved ? "bg-green-500/20 text-green-500" : 
                            (market.deadline && market.deadline < Date.now()/1000) ? "bg-red-500/20 text-red-500" : 
                            "bg-blue-500/20 text-blue-500"
                          }`}>
                            {market.resolved ? "Resolved" : 
                             (market.deadline && market.deadline < Date.now()/1000) ? "Expired" : 
                             "Active"}
                          </span>
                          {market.featured && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-500">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          {market.createdAt ? new Date(market.createdAt.seconds * 1000).toLocaleDateString() : "Unknown"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleFeatureMarket(market.id, market.featured)}
                              className={`p-1 rounded ${market.featured ? "bg-gray-700 text-white/70" : "bg-purple-600 text-white"}`}
                              title={market.featured ? "Unfeature market" : "Feature market"}
                            >
                              {market.featured ? "Unfeature" : "Feature"}
                            </button>
                            <button
                              onClick={() => deleteMarket(market.id)}
                              className="p-1 rounded bg-red-600 text-white"
                              title="Delete market"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-[#131317] rounded-lg overflow-hidden">
                  <thead className="bg-[#1C1C22]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Wallet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Predictions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Markets Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          <span className="font-mono">{user.id.substring(0, 4)}...{user.id.substring(user.id.length - 4)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {user.username || "Anonymous User"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          {user.predictionCount || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          {user.marketsCreated || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80">
                          {user.updatedAt ? new Date(user.updatedAt.seconds * 1000).toLocaleDateString() : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#131317] rounded-lg p-4 border border-white/5">
                  <p className="text-white/60 text-sm">Total Markets</p>
                  <p className="text-2xl font-bold">{markets.length}</p>
                </div>
                <div className="bg-[#131317] rounded-lg p-4 border border-white/5">
                  <p className="text-white/60 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="bg-[#131317] rounded-lg p-4 border border-white/5">
                  <p className="text-white/60 text-sm">Active Markets</p>
                  <p className="text-2xl font-bold">
                    {markets.filter(m => !m.resolved && (!m.deadline || m.deadline > Date.now()/1000)).length}
                  </p>
                </div>
              </div>
              
              <div className="bg-[#131317] rounded-lg p-4 border border-white/5 mb-6">
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <p className="text-white/60 text-sm">
                  Coming soon: Activity tracking and analytics
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 