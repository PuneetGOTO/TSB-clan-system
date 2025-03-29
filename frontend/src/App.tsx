import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 页面组件
import HomePage from './pages/HomePage';
import ClanDetails from './pages/ClanDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClanDashboard from './pages/clan/ClanDashboard';
import NotFound from './pages/NotFound';

// 布局组件
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ClanLayout from './components/layouts/ClanLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* 公共页面 */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="clan/:clanId" element={<ClanDetails />} />
        </Route>
        
        {/* 管理员页面 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* 其他管理员路由 */}
        </Route>
        
        {/* 战队页面 */}
        <Route path="/clan-dashboard" element={<ClanLayout />}>
          <Route index element={<ClanDashboard />} />
          {/* 其他战队仪表盘路由 */}
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
