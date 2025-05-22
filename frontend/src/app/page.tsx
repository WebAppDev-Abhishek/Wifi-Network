import SpeedTest from '@/components/SpeedTest';
import WifiInfo from '@/components/WifiInfo';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
            <SpeedTest />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
            <WifiInfo />
          </div>
        </div>
      </div>
    </main>
  );
}
