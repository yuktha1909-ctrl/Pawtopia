import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem, Expense } from '../types';
import {
  Package,
  AlertTriangle,
  FileSpreadsheet,
  Coins,
  TrendingDown,
  CheckCircle2,
  ThermometerSnowflake,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const InventoryTracker: React.FC = () => {
  const { inventory, expenses, updateInventoryStock } = useApp();
  const [activeTab, setActiveTab] = useState<'inventory' | 'expenses'>('inventory');

  // Calculate totals
  const totalDosesRemaining = inventory
    .filter((i) => i.category === 'vaccine')
    .reduce((sum, item) => sum + item.remainingQuantity * (item.unit.includes('10 doses') ? 10 : 1), 0);

  const totalGrantExpenditure = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAnimalsHelped = expenses.reduce((sum, e) => sum + e.animalsCoveredCount, 0);
  const avgCostPerAnimal = totalAnimalsHelped > 0 ? Math.round(totalGrantExpenditure / totalAnimalsHelped) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-[#0B3E39]" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              Vaccine Cold-Chain Stock &amp; Grant Budget Tracker
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            Batch-level tracking of anti-rabies vials, surgical suture packs, microchips, and cost-per-animal grant metrics.
          </p>
        </div>

        <div className="flex bg-stone-200 p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'inventory' ? 'bg-[#0B3E39] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Vaccine &amp; Medical Stock
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'expenses' ? 'bg-[#0B3E39] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Grant Utilization &amp; ROI
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase mb-1">
            <ThermometerSnowflake className="w-4 h-4 text-emerald-600" />
            <span>Anti-Rabies Doses Available</span>
          </div>
          <div className="text-2xl font-black text-[#0B3E39]">{totalDosesRemaining.toLocaleString()} doses</div>
          <p className="text-[11px] text-stone-500 mt-1">Monitored under 2°C to 8°C continuous cold chain</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-teal-800 text-xs font-black uppercase mb-1">
            <Coins className="w-4 h-4 text-teal-600" />
            <span>Average Cost / Animal Helped</span>
          </div>
          <div className="text-2xl font-black text-stone-900">₹{avgCostPerAnimal}</div>
          <p className="text-[11px] text-stone-500 mt-1">Includes vaccination, ABC spay/neuter &amp; ambulance</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-blue-800 text-xs font-black uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Animals Covered Under Grants</span>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalAnimalsHelped.toLocaleString()} strays</div>
          <p className="text-[11px] text-stone-500 mt-1">Supported by BBMP Rabies Free 2030 Fund</p>
        </div>
      </div>

      {/* Tab Content 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
              Active Medical Batches &amp; Expiry Surveillance
            </h2>
            <span className="text-[11px] font-bold text-stone-500">{inventory.length} Stock Line Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="text-[10px] text-stone-400 uppercase bg-stone-50 border-y border-stone-200">
                <tr>
                  <th className="px-4 py-3">Item &amp; Category</th>
                  <th className="px-4 py-3">Batch #</th>
                  <th className="px-4 py-3">Stock Level</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Storage Protocol</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventory.map((item) => {
                  const isLow = item.remainingQuantity <= item.lowStockThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-stone-900">{item.name}</div>
                        <div className="text-[11px] text-stone-400 capitalize">{item.category} • Supplier: {item.supplier}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-stone-800">{item.batchNumber}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-black text-stone-900">{item.remainingQuantity}</span>
                        <span className="text-[10px] text-stone-400"> / {item.totalQuantity} {item.unit}</span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{item.expiryDate}</td>
                      <td className="px-4 py-3.5 text-[11px] text-stone-600">{item.storageRequirement}</td>
                      <td className="px-4 py-3.5">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Adequate Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => updateInventoryStock(item.id, -10)}
                          className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] cursor-pointer"
                          title="Record use of 10 units"
                        >
                          -10 Doses
                        </button>
                        <button
                          onClick={() => updateInventoryStock(item.id, 50)}
                          className="px-2 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-[#0B3E39] font-bold text-[10px] cursor-pointer"
                          title="Restock 50 units"
                        >
                          +50 Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Expenses & Grant Utilization */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Grant-Ready Financial &amp; Impact Accountability
              </h2>
              <span className="text-[11px] text-stone-500">Every rupee tied directly to animal welfare outcomes</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-400 block uppercase">Total Disbursed:</span>
              <span className="text-base font-black text-[#0B3E39]">₹{totalGrantExpenditure.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700">
                      {exp.date}
                    </span>
                    <span className="font-black text-stone-900">{exp.description}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Grant Source: <strong>{exp.grantOrDonorFund}</strong>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                  <div className="text-sm font-black text-stone-900">₹{exp.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                    {exp.animalsCoveredCount} animals • ₹{exp.costPerAnimal}/animal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
