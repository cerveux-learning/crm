import React from 'react';
import { Plus, Bell, RefreshCw } from 'lucide-react';
import type { NavigationTab } from './Sidebar.js';

interface NavbarProps {
  activeTab: NavigationTab;
  onQuickAction?: (type: 'deal' | 'customer' | 'sale' | 'product') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onQuickAction,
  onRefresh,
  isRefreshing = false,
}) => {
  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard General', subtitle: 'Resumen ejecutivo de ventas y embudo de conversión' },
    pipeline: { title: 'Pipeline de Oportunidades', subtitle: 'Seguimiento visual de tratos por etapas' },
    customers: { title: 'Clientes y Prospectos', subtitle: 'Directorio de contactos, empresas e interacciones' },
    products: { title: 'Catálogo de Productos y Servicios', subtitle: 'Gestión de inventario y precios' },
    sales: { title: 'Cotizaciones y Facturación', subtitle: 'Emisión de presupuestos, facturas y cobros' },
  };

  const current = titles[activeTab];

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{current.title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Recargar datos"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        )}

        <button
          type="button"
          title="Notificaciones"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white"></span>
        </button>

        {onQuickAction && (
          <div className="flex items-center gap-2">
            {activeTab === 'pipeline' && (
              <button
                onClick={() => onQuickAction('deal')}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva Oportunidad
              </button>
            )}
            {activeTab === 'customers' && (
              <button
                onClick={() => onQuickAction('customer')}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </button>
            )}
            {activeTab === 'products' && (
              <button
                onClick={() => onQuickAction('product')}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </button>
            )}
            {activeTab === 'sales' && (
              <button
                onClick={() => onQuickAction('sale')}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva Cotización / Factura
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
