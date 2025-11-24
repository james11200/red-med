import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously,
  signInWithCustomToken // <-- FIX: Added missing import
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Download, 
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// --- Firebase Initialization (Engineering Pattern) ---
// In a real production environment, these keys should be in .env files.
// Here we initialize utilizing the environment's provided config.
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Components ---

// 1. Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const menuItems = [
    { id: 'dashboard', label: '總覽儀表板', icon: LayoutDashboard },
    { id: 'leads', label: '潛在學員名單', icon: Users },
    { id: 'content', label: '網站內容管理', icon: FileText },
    { id: 'settings', label: '系統設定', icon: Settings },
  ];

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="w-64 bg-slate-900 min-h-screen text-slate-300 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <span className="font-bold text-lg text-white tracking-wider">
          MED.EDU <span className="text-cyan-500 text-xs px-1 bg-cyan-900/30 rounded">ADMIN</span>
        </span>
      </div>
      
      <div className="flex-1 py-6 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 transition-colors ${
              activeTab === item.id 
                ? 'bg-cyan-900/20 text-cyan-400 border-r-2 border-cyan-500' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} className="mr-3" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            DR
          </div>
          <div className="ml-3">
            <p className="text-sm text-white font-medium">Administrator</p>
            <p className="text-xs text-slate-500">Super User</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors"
        >
          <LogOut size={14} className="mr-2" /> 登出系統
        </button>
      </div>
    </div>
  );
};

// 2. Login Component
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // --- FIX: Mock Credential Check for Demo ---
    const MOCK_USER = 'Admin';
    const MOCK_PASS = '1234';

    if (email !== MOCK_USER || password !== MOCK_PASS) {
        setError('登入失敗：無效的帳號或密碼。請使用 Admin/1234。');
        setLoading(false);
        return;
    }

    try {
        // --- Successful Mock Login: Proceed with Anonymous Auth (safest in Canvas) ---
        // This grants Firebase access needed for Firestore operations
        
        // FIX: Use custom token if available to satisfy security rules, otherwise use anonymous.
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            // Now signInWithCustomToken is imported and should work
             await signInWithCustomToken(auth, __initial_auth_token);
        } else {
             await signInAnonymously(auth);
        }
    } catch (err) {
        setError('登入失敗：無法連接認證服務。');
        console.error("Firebase Auth Failed:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">MED.EDU 控制台</h2>
          <p className="text-slate-400 text-sm mt-2">請輸入您的醫師管理憑證 (Demo: Admin / 1234)</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm flex items-center">
              <AlertCircle size={16} className="mr-2" /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email / 帳號</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              placeholder="Admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              placeholder="1234"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
          >
            {loading ? '驗證中...' : '安全登入'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. Stats Card Component
const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-500 font-medium flex items-center">
        <TrendingUp size={14} className="mr-1" /> {change}
      </span>
      <span className="text-slate-400 ml-2">vs 上個月</span>
    </div>
  </div>
);

// 4. Dashboard View
const Dashboard = ({ leadsCount }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">系統總覽</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="總潛在名單 (Leads)" 
          value={leadsCount || 0} 
          change="+12.5%" 
          icon={Users} 
          color="bg-cyan-600" 
        />
        <StatCard 
          title="網站總訪問量" 
          value="12,450" 
          change="+5.2%" 
          icon={LayoutDashboard} 
          color="bg-slate-700" 
        />
        <StatCard 
          title="口訣表下載次數" 
          value="892" 
          change="+18.1%" 
          icon={Download} 
          color="bg-green-600" 
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">系統通知</h3>
        <div className="space-y-4">
          <div className="flex items-start p-4 bg-blue-50 rounded border border-blue-100">
            <AlertCircle className="text-blue-600 mt-0.5 mr-3" size={18} />
            <div>
              <p className="text-sm font-bold text-blue-800">考季即將到來</p>
              <p className="text-sm text-blue-600 mt-1">建議更新「最新指引」相關課程內容，以提高轉換率。</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-yellow-50 rounded border border-yellow-100">
             <AlertCircle className="text-yellow-600 mt-0.5 mr-3" size={18} />
            <div>
              <p className="text-sm font-bold text-yellow-800">伺服器維護</p>
              <p className="text-sm text-yellow-600 mt-1">預計於週日凌晨 02:00 進行資料庫優化。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Leads Management View
const LeadsManager = ({ appId }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In React with Firebase Rule 3: Guard with user check is done in App, 
    // but here we just subscribe
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'leads'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
        console.error("Fetch error:", error);
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [appId]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Date\n"
      + leads.map(e => `${e.email},${e.timestamp ? new Date(e.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "med_edu_leads.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">潛在學員名單 (Leads)</h2>
        <button 
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition text-sm font-medium"
        >
          <Download size={16} className="mr-2" /> 匯出 CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="搜尋 Email..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder-slate-400"
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">載入中...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-slate-500">目前尚無資料</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-100">Email</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100">來源</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100">登記時間</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-800 font-medium">{lead.email}</td>
                  <td className="px-6 py-4 text-slate-500">首頁免費資源</td>
                  <td className="px-6 py-4 text-slate-500">
                    {lead.timestamp ? new Date(lead.timestamp.seconds * 1000).toLocaleString('zh-TW') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-500 hover:text-red-700 transition" onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', lead.id))}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// 6. Content Management (CMS)
const ContentManager = ({ appId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', role: '', content: '' });
  const [stats, setStats] = useState({ accuracy: '95', students: '800+', rank: 'Top 5%' });
  const [loading, setLoading] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setReviews(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [appId]);

  const handleAddReview = async () => {
    if(!newReview.name || !newReview.content) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), {
            ...newReview,
            timestamp: serverTimestamp()
        });
        setNewReview({ name: '', role: '', content: '' });
    } catch (e) { console.error(e); }
  };

  const handleDeleteReview = async (id) => {
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reviews', id));
      } catch (e) { console.error(e); }
  }

  // Mock function for updating stats (In real app, fetch from DB)
  const handleUpdateStats = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800); // Simulate API call
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">網站內容管理 (CMS)</h2>

      {/* Stats Editor */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <TrendingUp size={18} className="mr-2 text-cyan-600" />
            關鍵數據設定 (KPIs)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">考點命中率</label>
                <div className="flex items-center">
                    <input 
                        type="text" 
                        value={stats.accuracy}
                        onChange={(e) => setStats({...stats, accuracy: e.target.value})}
                        className="w-full border border-slate-300 rounded-l px-3 py-2 focus:border-cyan-500 outline-none"
                    />
                    <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 rounded-r text-slate-600">%</span>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">累計學員數</label>
                <input 
                    type="text" 
                    value={stats.students}
                    onChange={(e) => setStats({...stats, students: e.target.value})}
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:border-cyan-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">平均排名區段</label>
                <input 
                    type="text" 
                    value={stats.rank}
                    onChange={(e) => setStats({...stats, rank: e.target.value})}
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:border-cyan-500 outline-none"
                />
            </div>
        </div>
        <div className="mt-4 flex justify-end">
            <button 
                onClick={handleUpdateStats}
                className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition flex items-center text-sm font-bold"
            >
                {loading ? '儲存中...' : <><Save size={16} className="mr-2" /> 儲存變更</>}
            </button>
        </div>
      </div>

      {/* Reviews Editor */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <CheckCircle size={18} className="mr-2 text-green-600" />
            學員評價管理
        </h3>
        
        {/* Add New Review */}
        <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6">
            <h4 className="text-sm font-bold text-slate-700 mb-3">新增評價</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <input 
                    placeholder="學員姓名 (例: 陳同學)" 
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    className="border border-slate-300 p-2 rounded text-sm"
                />
                <input 
                    placeholder="身份 (例: 應屆通過)" 
                    value={newReview.role}
                    onChange={(e) => setNewReview({...newReview, role: e.target.value})}
                    className="border border-slate-300 p-2 rounded text-sm"
                />
            </div>
            <textarea 
                placeholder="評價內容..." 
                value={newReview.content}
                onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                className="w-full border border-slate-300 p-2 rounded text-sm h-20 mb-3"
            ></textarea>
            <button 
                onClick={handleAddReview}
                className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700 transition flex items-center"
            >
                <Plus size={16} className="mr-1" /> 新增評價
            </button>
        </div>

        {/* Review List */}
        <div className="space-y-3">
            {reviews.map(review => (
                <div key={review.id} className="border border-slate-200 rounded p-4 flex justify-between items-start hover:shadow-sm transition">
                    <div>
                        <div className="flex items-center mb-1">
                            <span className="font-bold text-slate-800 text-sm">{review.name}</span>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-2">{review.role}</span>
                        </div>
                        <p className="text-sm text-slate-600">"{review.content}"</p>
                    </div>
                    <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-slate-400 text-center">暫無評價資料</p>}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    // 1. Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch leads count for Dashboard
  useEffect(() => {
    if(!user) return;
    
    // Simple count (In production, use count() aggregation or separate counter doc)
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leads'));
    const unsub = onSnapshot(q, (snap) => setLeadsCount(snap.size));
    return () => unsub();
  }, [user]);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
                {activeTab === 'dashboard' && '總覽儀表板'}
                {activeTab === 'leads' && '名單管理'}
                {activeTab === 'content' && '網站內容設定'}
                {activeTab === 'settings' && '系統設定'}
            </h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-500">最後更新: {new Date().toLocaleTimeString()}</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
        </header>

        <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard leadsCount={leadsCount} />}
            {activeTab === 'leads' && <LeadsManager appId={appId} />}
            {activeTab === 'content' && <ContentManager appId={appId} />}
            {activeTab === 'settings' && (
                <div className="bg-white p-12 rounded-lg text-center border border-slate-200">
                    <Settings size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">系統設定</h3>
                    <p className="text-slate-500 mt-2">帳號管理與 API 金鑰設定功能即將推出。</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
