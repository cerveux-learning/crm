import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Package,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'pipeline' | 'customers' | 'products' | 'sales';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'pipeline', label: 'Pipeline de Ventas', icon: <Kanban className="h-5 w-5" /> },
    { id: 'customers', label: 'Clientes & Leads', icon: <Users className="h-5 w-5" /> },
    { id: 'products', label: 'Catálogo de Productos', icon: <Package className="h-5 w-5" /> },
    { id: 'sales', label: 'Cotizaciones & Ventas', icon: <Receipt className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight text-lg">CRM Pro</span>
          <span className="block text-[11px] text-brand-400 font-semibold uppercase tracking-wider">TypeScript CRM</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Principal
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-brand-500/20 text-brand-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pro Banner */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-slate-800/80 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">TS 5.8+ Strict</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tipado estricto end-to-end con SQLite y Prisma ORM.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/80 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm">
          AD
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">Administrador</p>
          <p className="text-xs text-slate-400 truncate">admin@crmpro.local</p>
        </div>
      </div>
    </aside>
  );
};
