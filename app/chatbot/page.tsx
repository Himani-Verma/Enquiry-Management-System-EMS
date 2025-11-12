'use client';

import ChatbotWidget from '@/components/ChatbotWidget';

export default function ChatbotPage() {
 return (
 <div className="w-full h-screen">
 <ChatbotWidget isOpen={true} onToggle={() => {}} isIframe={true} />
 </div>
 );
}
