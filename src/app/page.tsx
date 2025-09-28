
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Shield, Bell, BarChart3 } from 'lucide-react';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen relative">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-float-slow">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        <div className="absolute top-60 left-1/2 animate-float">
          <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Bell className="w-7 h-7 text-orange-400" />
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600">StockPulse</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your comprehensive platform for real-time stock monitoring, alerts, and portfolio insights. 
            Stay ahead of market trends with intelligent analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/auth"
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why Choose StockPulse?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Real-time Tracking
              </h3>
              <p className="text-gray-300">
                Monitor stock prices and market movements in real-time with live data feeds.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <Bell className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Smart Alerts
              </h3>
              <p className="text-gray-300">
                Set up custom price alerts and get notified when your stocks hit target prices.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Portfolio Analytics
              </h3>
              <p className="text-gray-300">
                Analyze your portfolio performance with detailed charts and insights.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Secure & Reliable
              </h3>
              <p className="text-gray-300">
                Your data is protected with enterprise-grade security and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Monitoring Your Investments?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of investors who trust StockPulse for their market insights.
          </p>
          <Link 
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign Up Free
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            Created by Shubham Mishra
          </p>
        </div>
      </section>
    </div>
  );
}
