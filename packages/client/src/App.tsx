import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar.js';
import { Navbar } from './components/layout/Navbar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PipelinePage } from './pages/PipelinePage.js';
import { CustomersPage } from './pages/CustomersPage.js';
import { ProductsPage } from './pages/ProductsPage.js';
import { SalesPage } from './pages/SalesPage.js';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleQuickAction = (type: 'deal' | 'customer' | 'sale' | 'product') => {
    switch (type) {
      case 'deal':
        setActiveTab('pipeline');
        break;
      case 'customer':
        setActiveTab('customers');
        break;
      case 'sale':
        setActiveTab('sales');
        break;
      case 'product':
        setActiveTab('products');
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onQuickAction={handleQuickAction}
          onRefresh={handleRefresh}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage key={refreshKey} onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'pipeline' && <PipelinePage key={refreshKey} />}
          {activeTab === 'customers' && <CustomersPage key={refreshKey} />}
          {activeTab === 'products' && <ProductsPage key={refreshKey} />}
          {activeTab === 'sales' && <SalesPage key={refreshKey} />}
        </main>
      </div>
    </div>
  );
}

export default App;
