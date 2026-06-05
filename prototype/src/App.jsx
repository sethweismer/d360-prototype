import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { UserProvider } from './context/UserContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import DelegateDetail from './pages/DelegateDetail';
import CAPReport from './pages/CAPReport';
import DelegationTypeReport from './pages/DelegationTypeReport';
import LOBReport from './pages/LOBReport';
import ProductReport from './pages/ProductReport';
import theme from './styles/theme';

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <UserProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/delegates/:id" element={<DelegateDetail />} />
              <Route path="/reports/open-caps" element={<CAPReport />} />
              <Route path="/reports/delegation-type/:type" element={<DelegationTypeReport />} />
              <Route path="/reports/lob/:lob" element={<LOBReport />} />
              <Route path="/reports/product/:product" element={<ProductReport />} />
            </Route>
          </Routes>
        </HashRouter>
      </UserProvider>
    </ConfigProvider>
  );
}
