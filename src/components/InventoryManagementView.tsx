import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  X, 
  TrendingDown, 
  Layers,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types';

interface InventoryManagementViewProps {
  inventory: InventoryItem[];
  onAddInventory: (item: Partial<InventoryItem>) => Promise<void>;
  onUpdateInventory: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  onDeleteInventory: (id: string) => Promise<void>;
}

const CATEGORIES: InventoryCategory[] = [
  'Hardware',
  'Software Licenses',
  'Networking',
  'Office Supplies',
  'Electronics'
];

export const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({
  inventory,
  onAddInventory,
  onUpdateInventory,
  onDeleteInventory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Hardware' as InventoryCategory,
    quantity: 10,
    minThreshold: 5,
    unitPrice: 450,
    location: 'Warehouse A - Sec 1',
    supplier: 'Dell Business Direct'
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sku: `HW-ITEM-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Hardware',
      quantity: 12,
      minThreshold: 5,
      unitPrice: 299,
      location: 'Warehouse A - Rack 3',
      supplier: 'Enterprise Supply Co'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minThreshold: item.minThreshold,
      unitPrice: item.unitPrice,
      location: item.location,
      supplier: item.supplier
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sku: formData.sku.toUpperCase(),
      quantity: Number(formData.quantity),
      minThreshold: Number(formData.minThreshold),
      unitPrice: Number(formData.unitPrice)
    };

    if (editingItem) {
      await onUpdateInventory(editingItem.id, payload);
    } else {
      await onAddInventory(payload);
    }
    setIsModalOpen(false);
  };

  const handleQuickRestock = async (item: InventoryItem, amount: number = 10) => {
    await onUpdateInventory(item.id, {
      quantity: item.quantity + amount
    });
  };

  const filteredInventory = inventory.filter(i => {
    const matchesCat = selectedCategory === 'All' || i.category === selectedCategory;
    const matchesStat = selectedStatus === 'All' || i.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      i.name.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.supplier.toLowerCase().includes(q);

    return matchesCat && matchesStat && matchesSearch;
  });

  const lowStockCount = inventory.filter(i => i.quantity <= i.minThreshold).length;
  const totalValuation = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>IT Assets & Inventory Supply</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track hardware provisions, software licensing, reorder thresholds, and warehouse logistics.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Summary Valuation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Asset Valuation</span>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              ${totalValuation.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total SKUs in Catalog</span>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {inventory.length} Items
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Low Stock Trigger Warnings</span>
            <div className={`text-xl font-bold font-mono mt-0.5 ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockCount} Critical
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, item name, supplier or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Stock Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU / Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Location / Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* SKU & Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-[11px] font-bold text-indigo-400">{item.sku}</div>
                    <div className="font-semibold text-slate-100 text-xs mt-0.5">{item.name}</div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </td>

                  {/* Stock Level & Status Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-100">{item.quantity}</span>
                      <span className="text-[10px] text-slate-500 font-mono">(min {item.minThreshold})</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        item.status === 'In Stock' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        item.status === 'Low Stock' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>

                  {/* Unit Cost */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    ${item.unitPrice.toLocaleString()}
                  </td>

                  {/* Total Value */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                    ${(item.quantity * item.unitPrice).toLocaleString()}
                  </td>

                  {/* Location & Supplier */}
                  <td className="py-3.5 px-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{item.location}</span>
                    </div>
                    <div className="text-slate-500 mt-0.5">{item.supplier}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleQuickRestock(item, 5)}
                        title="Restock +5 units"
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[10px] font-mono font-medium transition-colors cursor-pointer"
                      >
                        +5 Restock
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete item [${item.sku}] ${item.name}?`)) {
                            onDeleteInventory(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                {editingItem ? 'Edit Asset Record' : 'Register Inventory Asset'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">SKU Barcode</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="HW-MBP16-M3"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="MacBook Pro 16 M3 Max"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Current Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Warehouse B - Sec 2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Supplier / Vendor</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Apple Enterprise Direct"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  {editingItem ? 'Save Changes' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
