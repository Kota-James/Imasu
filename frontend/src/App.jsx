// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserIcon, ClockIcon, ImportIcon } from 'lucide-react'; // アイコンをインポート
import Login from './Login';
import Home from './Home';
import Profile from './Profile';
import Logs from './Logs';
import Register from './Register';

// ログインしていない人を弾く関所
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  return (
    // ログイン済みの場合は、画面の中身(children)と、下のナビゲーションバーを両方表示する
    <div className="relative min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}

// 画面下に固定されるナビゲーションバー
function BottomNav() {
  const location = useLocation(); // 今いるURLを取得（色を変えるため）

  // 現在のURLと一致していたら色を青にする関数
  const getNavClass = (path) => {
    return `flex flex-col items-center p-2 ${
      location.pathname === path ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`;
  };

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="max-w-md mx-auto flex justify-around p-2">
        <Link to="/" className={getNavClass('/')}>
          <HomeIcon size={24} />
          <span className="text-xs mt-1 font-medium">ホーム</span>
        </Link>
        <Link to="/logs" className={getNavClass('/logs')}>
          <ClockIcon size={24} />
          <span className="text-xs mt-1 font-medium">履歴</span>
        </Link>
        <Link to="/profile" className={getNavClass('/profile')}>
          <UserIcon size={24} />
          <span className="text-xs mt-1 font-medium">設定</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* 以下、関所(ProtectedRoute)に守られた画面たち */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* ※Logs画面は後で作りますが、とりあえず/に飛ばすようにしておきます */}
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;