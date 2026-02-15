// src/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [originalId, setOriginalId] = useState(''); // 学籍番号用
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // バックエンドの「ユーザー作成API」を叩く
      const response = await api.post('/api/users', {
        email: email,
        password: password,
        display_name: displayName,
        original_id: originalId
      });

      localStorage.setItem('token', response.data.access_token);

      // 登録成功＆自動ログイン完了！そのままメイン画面（/）へワープ
      navigate('/');
      
    } catch (err) {
      console.error(err);
      setError('登録に失敗しました。既に登録されているメールアドレスの可能性があります。');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Imasu 新規登録</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">学籍番号</label>
            <input
              type="text"
              required
              placeholder="例: 1A234567"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={originalId}
              onChange={(e) => setOriginalId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">表示名</label>
            <input
              type="text"
              required
              placeholder="例: James "
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">メールアドレス</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">パスワード</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-6 transition-colors"
          >
            アカウントを作成する
          </button>
        </form>

        {/* ログイン画面へ戻るリンク */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            既にアカウントをお持ちの方はこちら（ログイン）
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;