// src/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function Profile() {
  const [displayName, setDisplayName] = useState('');
  // 初期値をバックエンドと同じ青色のHEXコードに
  const [colorCode, setColorCode] = useState('#3b82f6'); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/users/me');
        setDisplayName(response.data.display_name || '');
        // バックエンドから取得するキーも color_code に修正
        setColorCode(response.data.color_code || '#3b82f6');
      } catch (error) {
        console.error(error);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // 送信するキーを color_code に修正！
      await api.put('/api/users/me', {
        display_name: displayName,
        color_code: colorCode
      });
      setMessage('プロフィールを更新しました！');
    } catch (error) {
      console.error('更新エラー', error);
      setMessage('更新に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          👤 プロフィール設定
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">表示名 (Display Name)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: 中澤 幸大"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* カラーピッカーの実装 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">テーマカラー</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-14 h-14 p-1 rounded cursor-pointer border border-gray-300 bg-white"
              />
              <span className="text-gray-600 font-mono text-lg uppercase">{colorCode}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">タップして好きな色を選んでください。</p>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg shadow-sm transition-colors"
          >
            保存する
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;