import React from 'react';
import { createRoot } from 'react-dom/client';
import AItest from './AItest';

// 掛載 AI 聊天小助手
const aiEl = document.getElementById('ai-chat-root');
if (aiEl) {
  const aiRoot = createRoot(aiEl);
  aiRoot.render(<AItest />);
}
