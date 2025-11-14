'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HeaderProps {
  transparent?: boolean;
  currentPage?: string;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Header({ 
  transparent = false, 
  currentPage = 'home',
  onLoginClick,
  onRegisterClick 
}: HeaderProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      router.push('/login');
    }
  };

  const handleRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      router.push('/register');
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !transparent
          ? 'bg-white/80 backdrop-blur-lg shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/envirocare-logo.png"
              alt="Envirocare Labs"
              width={200}
              height={50}
              className="h-12 w-auto cursor-pointer"
              priority
              onClick={() => router.push('/')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleRegister}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 text-green-600 font-semibold hover:text-green-700 border-2 border-green-600 hover:border-green-700 rounded-lg transition-colors"
              aria-label="Register for an account"
            >
              Register
            </motion.button>
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-[#2d4891] text-white font-semibold hover:bg-[#1e3470] rounded-lg transition-colors shadow-md"
              aria-label="Login to your account"
            >
              Login
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
