'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ChatbotWidget from '@/components/ChatbotWidget';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Home() {
  const router = useRouter();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Animated Background Layer */}
      <AnimatedBackground />
      
      {/* Header Component */}
      <Header transparent={true} currentPage="home" />
      
      {/* Content */}
      <div className="relative z-10 pt-20">

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-8 border border-green-200"
          >
            <motion.span 
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1],
                boxShadow: [
                  '0 0 0 0 rgba(34, 197, 94, 0.7)',
                  '0 0 0 6px rgba(34, 197, 94, 0)',
                  '0 0 0 0 rgba(34, 197, 94, 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-sm font-medium text-green-700">Employee Portal</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Enquiry Management
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#2d4891] to-[#16a34a] bg-clip-text text-transparent drop-shadow-sm">
              System
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Streamline customer enquiries, track visitors, and manage quotations
            with our unified platform designed for Envirocare Labs team members.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <motion.button
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(45, 72, 145, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.2 }
              }}
              className="w-full sm:w-auto px-10 py-4 bg-[#2d4891] text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-[#1e3470] transition-colors"
            >
              Employee Login
            </motion.button>
            <motion.button
              onClick={() => router.push('/register')}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(22, 163, 74, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                scale: { duration: 0.2 }
              }}
              className="w-full sm:w-auto px-10 py-4 bg-white text-green-600 border-2 border-green-600 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors shadow-md"
            >
              Register
            </motion.button>
          </motion.div>

          {/* Key Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 pt-12 border-t border-gray-200"
          >
            {[
              { icon: '🕐', title: '24/7 Availability', desc: 'Access anytime, anywhere' },
              { icon: '📊', title: 'Real-time Analytics', desc: 'Live insights and metrics' },
              { icon: '🔒', title: 'Secure Platform', desc: 'Enterprise-grade security' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 rounded-xl bg-white/40 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{stat.title}</h3>
                <p className="text-sm text-gray-600">{stat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">Powerful tools for modern teams</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '👥',
                title: 'Visitor Management',
                description: 'Track and manage all visitors through the complete pipeline from first contact to conversion.',
                gradient: 'from-[#2d4891] to-[#4f6bb8]'
              },
              {
                icon: '📄',
                title: 'Smart Quotations',
                description: 'Generate professional quotations with PDF export and automated calculations instantly.',
                gradient: 'from-[#16a34a] to-[#22c55e]'
              },
              {
                icon: '📈',
                title: 'Analytics Dashboard',
                description: 'Get real-time insights with comprehensive analytics and performance tracking.',
                gradient: 'from-[#2d4891] to-[#16a34a]'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${feature.gradient} mb-6 text-4xl shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-green-50/50 rounded-3xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#2d4891] to-[#16a34a] bg-clip-text text-transparent">
                Ready to Get Started?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join Envirocare Labs team members in managing enquiries efficiently
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(45, 72, 145, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-[#2d4891] text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-[#1e3470] transition-colors"
              >
                Login Now
              </motion.button>
              <motion.button
                onClick={() => router.push('/register')}
                whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(22, 163, 74, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-green-600 border-2 border-green-600 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors shadow-md"
              >
                Create Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Envirocare Labs. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <button className="hover:text-gray-900 transition-colors">Privacy</button>
              <button className="hover:text-gray-900 transition-colors">Terms</button>
              <button 
                onClick={() => setIsChatbotOpen(true)}
                className="hover:text-gray-900 transition-colors"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget with built-in animated toggle button */}
      <ChatbotWidget
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
      </div>
    </div>
  );
}
