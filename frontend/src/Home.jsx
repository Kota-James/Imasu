// src/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function Home() {
  const [user, setUser] = useState(null);
  const [presentUsers, setPresentUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchPresentUsers();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/users/me');
      setUser(response.data);
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchPresentUsers = async () => {
    try {
      const response = await api.get('/api/users?status=in');
      setPresentUsers(response.data);
    } catch (error) {
      console.error('メンバー一覧の取得に失敗しました', error);
    }
  };

  const handleAction = async (actionType) => {
    try {
      await api.post('/api/users/me/logs', { action: actionType, place: '部室', note: '' });
      fetchUser();
      fetchPresentUsers(); 
    } catch (error) {
      console.error('アクションの送信に失敗しました', error);
      alert('通信エラーが発生しました。');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div className="flex h-screen items-center justify-center">読み込み中...</div>;

  const statusDisplay = {
    in: { text: '在室', color: 'bg-green-100 text-green-800' },
    out: { text: '帰宅', color: 'bg-gray-100 text-gray-800' },
    away: { text: '外出中', color: 'bg-yellow-100 text-yellow-800' }
  };
  const currentStatus = statusDisplay[user.status] || { text: '不明', color: 'bg-gray-100 text-gray-800' };
  
  // 自分のカラーコード（設定されていない場合はデフォルトの青）
  const myColor = user.color_code || '#3b82f6';

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        
        {/* ヘッダー部分：下線とドットアイコンに myColor を適用 */}
        <div 
          className="flex justify-between items-center mb-6 pb-2 border-b-2" 
          style={{ borderColor: myColor }} 
        >
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {/* 名前の横のドット */}
            <span className="w-4 h-4 rounded-full mr-2 shadow-sm" style={{ backgroundColor: myColor }}></span>
            {user.display_name || user.email}
          </h1>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
            ログアウト
          </button>
        </div>

        {/* 現在のステータス */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-500 mb-2">現在のステータス</p>
          <span className={`px-6 py-2 rounded-full text-xl font-bold ${currentStatus.color}`}>
            {currentStatus.text}
          </span>
        </div>

        {/* ボタン群 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => handleAction('enter')} className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold shadow-sm transition-colors">入室する</button>
          <button onClick={() => handleAction('exit')} className="bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold shadow-sm transition-colors">退室する</button>
          <button onClick={() => handleAction('go_out')} className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-bold shadow-sm transition-colors">一時外出する</button>
          <button onClick={() => handleAction('return')} className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-sm transition-colors">再入室する</button>
        </div>

        {/* 現在部室にいるメンバー一覧 */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            🏢 現在部室にいるメンバー ({presentUsers.length}名)
          </h2>
          
          {presentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-gray-100">現在、部室にいるメンバーはいません。</p>
          ) : (
            <ul className="space-y-3">
              {presentUsers.map((member) => {
                const memberColor = member.color_code || '#3b82f6';
                return (
                  // 左の縦線（ボーダー）にユーザーカラーを適用
                  <li 
                    key={member.id} 
                    className="flex items-center justify-between bg-white p-3 rounded-lg border-l-4 shadow-sm"
                    style={{ borderLeftColor: memberColor }}
                  >
                    <div className="flex items-center">
                      {/* 名前の横のドットにユーザーカラーを適用 */}
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: memberColor }}></div>
                      <span className="font-medium text-gray-700">{member.display_name || member.email}</span>
                    </div>
                    {/* バッジは共通のデザイン */}
                    <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">
                      在室
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default Home;