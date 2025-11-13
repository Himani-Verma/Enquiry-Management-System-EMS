'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function Home() {
  const router = useRouter();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image 
                src="/envirocare-logo.png" 
                alt="Envirocare Labs" 
                width={200} 
                height={50} 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/register')}
                className="border-2 border-green-600 text-green-700 hover:bg-green-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
              >
                Register
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-[#2d4891] hover:bg-[#1e3470] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Employee Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2d4891] p-8 flex items-center justify-center">
              <Image 
                src="/envirocare-logo.png" 
                alt="Envirocare Labs" 
                width={250} 
                height={63} 
                className="brightness-0 invert"
              />
            </div>
            
            <div className="bg-green-600 text-white text-center py-4">
              <h2 className="text-2xl font-semibold">Employee Portal</h2>
            </div>

            <div className="p-12 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Enquiry Management System
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Streamline customer enquiries, track visitors, manage quotations, and deliver exceptional service - 
                all from one unified platform designed for Envirocare Labs team members.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Access Dashboard
                </button>
                
                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="bg-[#2d4891] hover:bg-[#1e3470] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Need Help?
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-[#2d4891]">4</div>
                  <div className="text-sm text-gray-600 mt-1">User Roles</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600 mt-1">Availability</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-[#2d4891]">Real-time</div>
                  <div className="text-sm text-gray-600 mt-1">Analytics</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-green-600">Secure</div>
                  <div className="text-sm text-gray-600 mt-1">Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-gray-600 mb-6">Login to access your dashboard or register for a new account</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Employee Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-[#2d4891] hover:bg-[#1e3470] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Envirocare Labs. All rights reserved. | Employee Portal</p>
        </div>
      </footer>

      <ChatbotWidget 
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
    </div>
  );
}