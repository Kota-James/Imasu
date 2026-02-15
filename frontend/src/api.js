import axios from 'axios';

// 1. カスタムAxiosの作成（ベースURLをFastAPIのアドレスに固定）
const api = axios.create({
  // baseURL: 'http://localhost:8000', // バックエンドのURL
  baseURL: 'https://imasu-api.onrender.com'
});

// 2. リクエストを送信する「直前」に割り込む処理（インターセプター）
api.interceptors.request.use(
  (config) => {
    // ブラウザの「ローカルストレージ」から保存されているトークンを取り出す
    const token = localStorage.getItem('token');
    
    // もしトークンがあれば、通信のヘッダーに自動でくっつける
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;