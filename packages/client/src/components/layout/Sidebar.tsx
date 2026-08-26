import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Package,
  Receipt,
  Layers,
  UserCog,
  LogOut,
  ShieldCheck,
  UserCheck,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export type NavigationTab = 'dashboard' | 'pipeline' | 'customers' | 'products' | 'sales' | 'users';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout, isAdmin, isViewer } = useAuth();

  const allNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    allowedRoles: ('ADMIN' | 'SELLER' | 'VIEWER')[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'SELLER', 'VIEWER'],
    },
    {
      id: 'pipeline',
      label: 'Pipeline de Ventas',
      icon: <Kanban className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'SELLER'],
    },
    {
      id: 'customers',
      label: 'Clientes & Leads',
      icon: <Users className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'SELLER'],
    },
    {
      id: 'products',
      label: 'Catálogo de Productos',
      icon: <Package className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'SELLER'],
    },
    {
      id: 'sales',
      label: 'Cotizaciones & Ventas',
      icon: <Receipt className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'SELLER'],
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: <UserCog className="h-5 w-5" />,
      allowedRoles: ['ADMIN'],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    user ? item.allowedRoles.includes(user.role) : false
  );

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrador';
    if (isViewer) return 'Lector';
    return 'Vendedor';
  };

  const getRoleIcon = () => {
    if (isAdmin) return <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />;
    if (isViewer) return <Eye className="h-3.5 w-3.5 text-amber-400" />;
    return <UserCheck className="h-3.5 w-3.5 text-emerald-400" />;
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight text-lg">CRM Pro</span>
          <span className="block text-[11px] text-brand-400 font-semibold uppercase tracking-wider">
            Control de Ventas
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          {isViewer ? 'Módulo Disponible' : 'Módulos'}
        </p>
        {visibleNavItems.map((item) => {
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
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {user?.name?.slice(0, 2) || 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Usuario'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {getRoleIcon()}
              <span className="text-[11px] text-slate-400 font-medium truncate">
                {getRoleLabel()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Cerrar Sesión"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
