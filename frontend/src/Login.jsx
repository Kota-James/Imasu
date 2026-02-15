// src/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api'; // さっき作った最強の通信ルール

function Login() {
  // 入力された値を保存する「箱（State）」
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // 画面遷移をおこなうためのフック
  const navigate = useNavigate();

  // ログインボタンが押された時の処理
  const handleSubmit = async (e) => {
    e.preventDefault(); // 画面がリロードされるのを防ぐ
    setError('');       // エラーメッセージをリセット

    try {
      // 【超重要】FastAPIの仕様に合わせてFormデータを作成する
      const params = new URLSearchParams();
      params.append('username', email); // キーは必ず 'username' にする！
      params.append('password', password);

      // バックエンドのトークン発行URLへPOSTリクエスト
      // （※URLが /api/token ではない場合は、中澤さんの環境に合わせて変更してください）
      const response = await api.post('/api/token', params);

      // 成功したら、ローカルストレージにトークンを保存
      localStorage.setItem('token', response.data.access_token);

      // ログイン成功！メイン画面（/）へ移動する
      navigate('/');
      
    } catch (err) {
      console.error(err);
      setError('ログインに失敗しました。メールアドレスかパスワードを確認してください。');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Imasu ログイン</h2>
        
        {/* エラーがある場合のみ赤文字で表示 */}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログイン
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            アカウントをお持ちでない方はこちら（新規登録）
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;