import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useMemo, useRef, useState } from 'react';

const systemPromptMap = {
  cloth: '我是服裝搭配小助手，能幫你搭配今日服裝或特定場合造型。',
  food: '我是健身 / 飲食小助理，能給你運動與飲食建議。',
  life: '我是生活小幫手，能提醒你、計算或給生活小建議。'
};

const quickExamplesMap = {
  cloth: ['今天上班穿什麼顏色好？', '週末約會適合穿什麼衣服？', '我想搭配藍色外套，有什麼建議？'],
  food: ['今天適合做什麼簡單運動？', '早餐怎麼吃比較健康？', '我想增肌，每天該怎麼安排飲食？'],
  life: ['幫我換算今天美元對台幣匯率是多少？', '提醒我下午 3 點要開會', '我想知道今天適合帶傘嗎？']
};

export default function AItest({ defaultModel = 'gemini-2.5-flash', starter = '嗨！請在這裡輸入問題～' }) {
  const [model, setModel] = useState(defaultModel);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const [scenario, setScenario] = useState('cloth');

  // Load API key from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // Warm welcome
  useEffect(() => {
    setHistory([{ role: 'model', parts: [{ text: '這裡是AI小助手，有什麼想聊的？' }], time: new Date().toLocaleTimeString() }]);
    if (starter) setInput(starter);
  }, [starter]);

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  const ai = useMemo(() => {
    try {
      return apiKey ? new GoogleGenerativeAI(apiKey) : null;
    } catch {
      return null;
    }
  }, [apiKey]);

  function addSystemMessage(scenario) {
    const prompt = systemPromptMap[scenario];
    const msg = {
      role: 'system',
      parts: [{ text: prompt }],
      time: new Date().toLocaleTimeString()
    };
    setHistory(h => [...h, msg]);
  }

  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading) return;
    if (!ai) {
      setError('請先輸入有效的 Gemini API Key');
      return;
    }

    setError('');
    setLoading(true);

    const newMsg = { role: 'user', parts: [{ text: content }], time: new Date().toLocaleTimeString() };
    setHistory(h => [...h, newMsg]);
    setInput('');

    try {
      const contents = [
        { role: 'system', text: systemPromptMap[scenario] },
        ...history.map(m => ({ role: m.role, text: m.parts.map(p => p.text).join('\n') })),
        { role: 'user', text: content }
      ];

      const resp = await ai.models.generateContent({ model, contents });
      const reply = {
        role: 'model',
        parts: [{ text: resp.response.text() || '[No content]' }],
        time: new Date().toLocaleTimeString()
      };
      setHistory(h => [...h, reply]);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    wrap: { height: '100vh', display: 'flex', background: '#f0f4f8' },
    sidebar: {
      width: 300,
      background: '#fff',
      borderRight: '2px solid #e0e0e0',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#f9fafb',
      padding: 16
    },
    header: { fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1e3a8a' },
    label: { display: 'flex', flexDirection: 'column', fontSize: 14, fontWeight: 600, marginBottom: 10 },
    input: { padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
    messages: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      background: '#f8fafc',
      borderRadius: 12,
      border: '1px solid #e2e8f0'
    },
    composer: {
      display: 'flex',
      gap: 8,
      padding: 8,
      borderTop: '1px solid #ccc',
      background: '#f1f5f9',
      borderRadius: 12,
      marginTop: 12
    },
    textInput: {
      flex: 1,
      padding: '8px 10px',
      borderRadius: 12,
      border: '1px solid #94a3b8'
    },
    sendBtn: {
      padding: '8px 12px',
      borderRadius: 12,
      border: 'none',
      background: '#2563eb',
      color: '#fff',
      cursor: 'pointer'
    },
    clearBtn: {
      marginTop: 12,
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid #facc15',
      background: '#fef9c3',
      cursor: 'pointer',
      color: '#7c6f00',
      fontWeight: 600
    },
    quickExamples: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 },
    suggestion: {
      padding: '6px 10px',
      borderRadius: 12,
      border: '1px solid #93c5fd',
      cursor: 'pointer',
      background: '#dbeafe',
      color: '#1e3a8a'
    },
    spinner: {
      width: 24,
      height: 24,
      border: '3px solid #ccc',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 6px'
    },
    error: { color: '#b91c1c', marginTop: 6 }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={styles.wrap}>
        {/* 左側設定欄 */}
        <div style={styles.sidebar}>
          <div style={styles.header}>⚙️ 設定區</div>

          <label style={styles.label}>
            情境選擇
            <select
              value={scenario}
              onChange={e => {
                const val = e.target.value;
                setScenario(val);
                addSystemMessage(val);
              }}
              style={styles.input}
            >
              <option value="cloth">服飾搭配助手</option>
              <option value="food">健身／飲食助理</option>
              <option value="life">生活小幫手</option>
            </select>
          </label>

          <label style={styles.label}>
            <span>Model</span>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="例如 gemini-2.5-flash、gemini-2.5-pro"
              style={styles.input}
            />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              模型名稱會隨時間更新，若錯誤請改成官方清單中的有效 ID。
            </div>
          </label>

          <label style={styles.label}>
            <span>Gemini API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={e => {
                const v = e.target.value;
                setApiKey(v);
                if (rememberKey) localStorage.setItem('gemini_api_key', v);
              }}
              placeholder="貼上你的 API Key（只在本機瀏覽器儲存）"
              style={styles.input}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={e => {
                  setRememberKey(e.target.checked);
                  if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                  else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
                }}
              />
              <span>記住在本機（localStorage）</span>
            </label>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Demo 用法：在瀏覽器內保存 Key 僅供教學。正式環境請改走後端或使用安全限制的 Key。
            </div>
          </label>

          <button onClick={() => setHistory([])} style={styles.clearBtn}>🧹 清除對話</button>
        </div>

        {/* 右側聊天區 */}
        <div style={styles.chatArea}>
          <div style={styles.header}>💬 AI 聊天</div>

          <div ref={listRef} style={styles.messages}>
            {history.map((msg, i) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';
              const bg = isUser ? '#fff8e1' : isSystem ? '#e3f2fd' : '#bbdefb';
              const borderColor = isUser ? '#fdd835' : isSystem ? '#64b5f6' : '#42a5f5';
              const align = isUser ? 'flex-end' : 'flex-start';
              const label = isUser ? 'You' : isSystem ? 'System' : 'Gemini';
              const textColor = '#222';

              return (
                <div key={i} style={{ display: 'flex', justifyContent: align, marginBottom: 6 }}>
                  <div
                    style={{
                      background: bg,
                      color: textColor,
                      padding: '10px 14px',
                      borderRadius: 16,
                      maxWidth: '70%',
                      border: `2px solid ${borderColor}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>

                    {isSystem ? (
                      <div style={{ fontStyle: 'italic', opacity: 0.8 }}>🪄 {msg.parts[0].text}</div>
                    ) : (
                      <div>{msg.parts[0].text}</div>
                    )}

                    <div style={{ fontSize: 12, textAlign: 'right', color: '#555', marginTop: 4 }}>
                      {msg.time || new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>
                <div style={styles.spinner}></div>
                Gemini 正在思考中...
              </div>
            )}
          </div>

          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={styles.composer}>
            <input
              placeholder="輸入訊息，按 Enter 送出"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={styles.textInput}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !apiKey}
              style={styles.sendBtn}
            >
              送出
            </button>
          </form>

          <div style={styles.quickExamples}>
            {(quickExamplesMap[scenario] || []).map(q => (
              <button
                key={q}
                type="button"
                style={styles.suggestion}
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {error && <div style={styles.error}>⚠ {error}</div>}
        </div>
      </div>
    </>
  );
}
