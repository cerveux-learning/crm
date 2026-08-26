import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Receipt,
  FileText,
  DollarSign,
  CheckCircle,
  ArrowRightCircle,
  Trash2,
  Printer,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Badge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import type { SaleOrder, SaleType, Customer, Product, CreateSaleOrderItemInput } from '@crm/shared';

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Sale Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleType, setSaleType] = useState<SaleType>('QUOTE');
  const [customerId, setCustomerId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('Condiciones de pago: Transferencia a 30 días.');
  const [items, setItems] = useState<CreateSaleOrderItemInput[]>([
    { productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // View / Print Document Modal
  const [viewingSale, setViewingSale] = useState<SaleOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, customersData, productsData] = await Promise.all([
        api.sales.getAll(),
        api.customers.getAll(),
        api.products.getAll(),
      ]);
      setSales(salesData);
      setCustomers(customersData);
      setProducts(productsData);

      if (customersData.length > 0 && !customerId && customersData[0]) {
        setCustomerId(customersData[0]!.id);
      }
    } catch (err) {
      console.error('Error loading sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = (defaultType: SaleType = 'QUOTE') => {
    setSaleType(defaultType);
    if (products.length > 0 && products[0]) {
      const first = products[0];
      setItems([
        {
          productId: first.id,
          description: first.name,
          quantity: 1,
          unitPrice: first.unitPrice,
          discount: 0,
        },
      ]);
    } else {
      setItems([{ productId: '', description: '', quantity: 1, unitPrice: 100, discount: 0 }]);
    }
    const todayPlus30 = new Date();
    todayPlus30.setDate(todayPlus30.getDate() + 30);
    setDueDate(todayPlus30.toISOString().split('T')[0]!);
    setIsModalOpen(true);
  };

  const handleProductSelect = (index: number, pId: string) => {
    const selected = products.find(p => p.id === pId);
    const updated = [...items];
    if (selected && updated[index]) {
      updated[index].productId = selected.id;
      updated[index].description = selected.name;
      updated[index].unitPrice = selected.unitPrice;
    } else if (updated[index]) {
      updated[index].productId = '';
    }
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof CreateSaleOrderItemInput, val: any) => {
    const updated = [...items];
    if (updated[index]) {
      (updated[index] as any)[field] = val;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
      const disc = item.discount ? (lineTotal * item.discount) / 100 : 0;
      return sum + (lineTotal - disc);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const taxRate = 0.21;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Debes seleccionar un cliente.');
      return;
    }

    try {
      setSubmitting(true);
      await api.sales.create({
        type: saleType,
        customerId,
        dueDate: dueDate ? new Date(dueDate) : null,
        taxRate: 0.21,
        notes,
        items: items.map(it => ({
          ...it,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          discount: Number(it.discount || 0),
        })),
      });

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al crear el documento de venta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertQuote = async (quoteId: string) => {
    if (!confirm('¿Deseas convertir esta cotización en una factura formal?')) return;
    try {
      await api.sales.convertQuoteToInvoice(quoteId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al convertir cotización');
    }
  };

  const handleMarkAsPaid = async (saleId: string) => {
    try {
      await api.sales.updateStatus(saleId, 'PAID');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al marcar como pagada');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este documento?')) return;
    try {
      await api.sales.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar documento');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const filteredSales = sales.filter(s => {
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch =
      s.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.customer?.company && s.customer.company.toLowerCase().includes(search.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° comprobante o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Type & Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          {/* Type tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'QUOTE', label: 'Cotizaciones' },
              { id: 'INVOICE', label: 'Facturas' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  typeFilter === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="SENT">Enviada</option>
            <option value="PAID">Pagada</option>
            <option value="ACCEPTED">Aceptada</option>
            <option value="REJECTED">Rechazada</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => handleOpenCreateModal('QUOTE')}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Cotización
          </button>
          <button
            onClick={() => handleOpenCreateModal('INVOICE')}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Documento</th>
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-6">Fecha Emisión / Venc.</th>
                <th className="py-3.5 px-6">Ítems</th>
                <th className="py-3.5 px-6">Total</th>
                <th className="py-3.5 px-6">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron cotizaciones ni facturas.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Order Number & Type */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            sale.type === 'INVOICE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-indigo-50 text-brand-700'
                          }`}
                        >
                          {sale.type === 'INVOICE' ? <Receipt className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              setViewingSale(sale);
                              setIsViewModalOpen(true);
                            }}
                            className="font-mono font-bold text-slate-900 hover:text-brand-600 transition-colors"
                          >
                            {sale.orderNumber}
                          </button>
                          <p className="text-xs text-slate-400">
                            {sale.type === 'INVOICE' ? 'Factura' : 'Cotización'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{sale.customer?.name}</p>
                      <p className="text-xs text-slate-400">{sale.customer?.company || 'Particular'}</p>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6">
                      <p className="text-xs text-slate-700">
                        {new Date(sale.issueDate).toLocaleDateString()}
                      </p>
                      {sale.dueDate && (
                        <p className="text-[11px] text-slate-400">
                          Vence: {new Date(sale.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </td>

                    {/* Items count */}
                    <td className="py-4 px-6">
                      <span className="text-xs text-slate-600 font-medium">
                        {sale.items?.length || 0} línea(s)
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-6">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(sale.total)}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        IVA: {formatCurrency(sale.taxAmount)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <Badge variant="sale" value={sale.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewingSale(sale);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Ver / Imprimir Comprobante"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {sale.type === 'QUOTE' && sale.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => handleConvertQuote(sale.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Convertir a Factura"
                          >
                            <ArrowRightCircle className="h-4 w-4" />
                          </button>
                        )}

                        {sale.type === 'INVOICE' && sale.status !== 'PAID' && (
                          <button
                            onClick={() => handleMarkAsPaid(sale.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                            title="Marcar como Pagada"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale / Quote Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={saleType === 'QUOTE' ? 'Nueva Cotización / Presupuesto' : 'Emitir Nueva Factura'}
        description="Selecciona el cliente y detalla los conceptos y cantidades."
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateSale} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Tipo de Documento *
              </label>
              <select
                value={saleType}
                onChange={(e) => setSaleType(e.target.value as SaleType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="QUOTE">Cotización (Presupuesto)</option>
                <option value="INVOICE">Factura Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cliente *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Line Items Table Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Líneas de Detalle / Ítems *
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar Ítem
              </button>
            </div>

            <div className="space-y-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
              {items.map((item, index) => {
                const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                const discountVal = item.discount ? (lineTotal * item.discount) / 100 : 0;
                const rowTotal = lineTotal - discountVal;

                return (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Catálogo</label>
                      <select
                        value={item.productId || ''}
                        onChange={(e) => handleProductSelect(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                      >
                        <option value="">Personalizado</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Descripción *</label>
                      <input
                        type="text"
                        required
                        placeholder="Descripción del concepto"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">P. Unit ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Desc %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount || 0}
                        onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1 flex items-center justify-between gap-1">
                      <div className="text-right flex-1 font-mono font-bold text-xs text-slate-800">
                        ${rowTotal.toFixed(0)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className="text-slate-300 hover:text-rose-500 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Notas y Términos
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (21%):</span>
                <span className="font-mono font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span className="font-mono text-brand-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
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
              {submitting ? 'Generando...' : saleType === 'QUOTE' ? 'Crear Cotización' : 'Emitir Factura'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View / Print Invoice Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewingSale?.type === 'QUOTE' ? `Cotización ${viewingSale?.orderNumber}` : `Factura ${viewingSale?.orderNumber}`}
        maxWidth="2xl"
      >
        {viewingSale && (
          <div className="space-y-6 print:p-0">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h2 className="font-extrabold text-xl text-slate-900">CRM Pro S.A.</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">Av. Libertador 1500, Oficina 401</p>
                <p className="text-xs text-slate-500">contacto@crmpro.com</p>
              </div>

              <div className="text-right">
                <Badge variant="sale" value={viewingSale.status} />
                <p className="text-sm font-mono font-bold text-slate-900 mt-2">{viewingSale.orderNumber}</p>
                <p className="text-xs text-slate-500">
                  Emisión: {new Date(viewingSale.issueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Facturar a:
              </p>
              <p className="font-bold text-slate-900 text-sm">{viewingSale.customer?.name}</p>
              <p className="text-xs text-slate-600">{viewingSale.customer?.company || 'Particular'}</p>
              <p className="text-xs text-slate-500">{viewingSale.customer?.email}</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2">Descripción</th>
                  <th className="py-2 text-center">Cant.</th>
                  <th className="py-2 text-right">P. Unit</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewingSale.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-slate-800 font-medium">{item.description}</td>
                    <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">{formatCurrency(viewingSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA ({Math.round(viewingSale.taxRate * 100)}%):</span>
                  <span className="font-mono font-semibold">{formatCurrency(viewingSale.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Documento:</span>
                  <span className="font-mono text-brand-600">{formatCurrency(viewingSale.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {viewingSale.notes && (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-bold">Observaciones: </span>
                {viewingSale.notes}
              </div>
            )}

            {/* Print Button */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
