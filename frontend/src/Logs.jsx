// src/Logs.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, LogIn, LogOut, DoorOpen } from 'lucide-react';
import api from './api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // 自分の過去のログを全件取得するAPI
        const response = await api.get('/api/users/me/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('ログの取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // アクション名から「日本語表示」と「アイコン」を決定する辞書
  const actionDetails = {
    enter: { text: '入室', icon: <LogIn size={20} className="text-blue-500" />, bg: 'bg-blue-100' },
    exit: { text: '退室', icon: <LogOut size={20} className="text-gray-500" />, bg: 'bg-gray-100' },
    go_out: { text: '外出', icon: <DoorOpen size={20} className="text-yellow-500" />, bg: 'bg-yellow-100' },
    return: { text: '戻り', icon: <ArrowRightLeft size={20} className="text-green-500" />, bg: 'bg-green-100' },
  };

  // 日付を見やすくフォーマットする関数 (例: 2月15日 14:30)
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('ja-JP', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          🕒 入退室の履歴
        </h2>

        {logs.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
            まだ履歴がありません。
          </p>
        ) : (
          <div className="space-y-4">
            {/* ログの配列を新しい順（上から下）に表示 */}
            {logs.map((log) => {
              const detail = actionDetails[log.action] || { 
                text: log.action, icon: <ArrowRightLeft size={20} className="text-gray-500" />, bg: 'bg-gray-100' 
              };

              return (
                <div key={log.id} className="flex items-center p-3 border border-gray-100 rounded-lg shadow-sm bg-white">
                  <div className={`p-3 rounded-full mr-4 ${detail.bg}`}>
                    {detail.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{detail.text}</p>
                    <p className="text-xs text-gray-500">{log.place || '部室'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      {/* バックエンドからの created_at を綺麗に表示 */}
                      {formatDate(log.created_at || new Date())}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Logs;