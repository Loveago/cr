import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { RecoveryCard } from '@/components/RecoveryCard';
import { PriceTicker } from '@/components/PriceTicker';
import { MarketOverview } from '@/components/MarketOverview';
import { LiveChart } from '@/components/LiveChart';
import { TopMovers } from '@/components/TopMovers';
import { MarketSentiment } from '@/components/MarketSentiment';
import { StatsBar } from '@/components/StatsBar';
import { PhoneMockup } from '@/components/PhoneMockup';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Hero />
              <div className="xl:hidden">
                <RecoveryCard />
              </div>
              <PriceTicker />
              <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr]">
                <MarketOverview />
                <div className="space-y-4">
                  <LiveChart />
                  <MarketSentiment />
                </div>
                <TopMovers />
              </div>
              <StatsBar />
            </div>
            <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
              <RecoveryCard />
              <PhoneMockup />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
