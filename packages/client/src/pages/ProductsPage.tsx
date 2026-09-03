import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Package,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Badge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import type { Product, ProductCategory, CreateProductInput } from '@crm/shared';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductInput>({
    code: '',
    name: '',
    description: '',
    category: 'PRODUCT',
    unitPrice: 100,
    cost: 50,
    stock: 10,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setForm({
      code: `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      description: '',
      category: 'PRODUCT',
      unitPrice: 100,
      cost: 50,
      stock: 10,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      code: p.code,
      name: p.name,
      description: p.description || '',
      category: p.category,
      unitPrice: p.unitPrice,
      cost: p.cost || 0,
      stock: p.stock,
      active: p.active,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        unitPrice: Number(form.unitPrice),
        cost: form.cost ? Number(form.cost) : undefined,
        stock: Number(form.stock),
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
      } else {
        await api.products.create(payload);
      }

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto/servicio del catálogo?')) return;
    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar producto');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código SKU, nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'SERVICE', label: 'Servicios' },
            { id: 'SUBSCRIPTION', label: 'Suscripciones' },
            { id: 'PRODUCT', label: 'Productos Físicos' },
            { id: 'OTHER', label: 'Otros' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenCreateModal}
          className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo Ítem
        </button>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-100 text-center text-slate-400">
            No se encontraron productos o servicios registrados.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const margin = product.cost && product.unitPrice > 0
              ? Math.round(((product.unitPrice - product.cost) / product.unitPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {product.code}
                    </span>
                    <Badge variant="category" value={product.category} />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug mb-1">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {product.description || 'Sin descripción adicional.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Precio Unitario</p>
                      <p className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(product.unitPrice)}
                      </p>
                    </div>

                    {margin !== null && (
                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Margen Est.</p>
                        <p className="text-xs font-bold text-emerald-600">{margin}%</p>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Disponibilidad</p>
                      <p className="text-xs font-bold text-slate-700">{product.stock} u.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs">
                      {product.active ? (
                        <span className="inline-flex items-center text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-400 font-medium">
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Inactivo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Ítem del Catálogo' : 'Nuevo Producto / Servicio'}
        description="Define las características, categoría y precio unitario."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Código / SKU *
              </label>
              <input
                type="text"
                required
                placeholder="SRV-01 o PRD-101"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Categoría *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="SERVICE">Servicio</option>
                <option value="SUBSCRIPTION">Suscripción Recurrente</option>
                <option value="PRODUCT">Producto Físico</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Nombre del Producto / Servicio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Licencia Anual ERP o Desarrollo Web"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Descripción Comercial
            </label>
            <textarea
              rows={2}
              placeholder="Detalle de las características o alcance del servicio..."
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Precio Unitario ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Costo Unitario ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost || 0}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Stock Inicial
              </label>
              <input
                type="number"
                min="0"
                value={form.stock || 0}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="product-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="product-active" className="text-sm font-medium text-slate-700">
              Disponible en cotizaciones y ventas activas
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear Ítem'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
