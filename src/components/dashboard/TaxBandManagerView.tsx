import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export const TaxBandManagerView: React.FC = () => {
  const [bands, setBands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBand, setNewBand] = useState({ name: '', min_turnover: 0, max_turnover: 0, daily_tax: 0 });

  useEffect(() => {
    fetchBands();
  }, []);

  const fetchBands = async () => {
    try {
      const res = await fetch('/api/lga-bands');
      if (res.ok) {
        setBands(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/lga-bands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBand, id: `band-${Date.now()}` })
      });
      if (res.ok) {
        fetchBands();
        setIsAdding(false);
        setNewBand({ name: '', min_turnover: 0, max_turnover: 0, daily_tax: 0 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif italic">Tax Band Manager</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#141414] text-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-all"
        >
          <Plus size={16} /> Add New Band
        </button>
      </div>

      <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f5f5f5] border-b border-[#141414]">
              <th className="p-4 font-mono text-[10px] uppercase opacity-50">Band Name</th>
              <th className="p-4 font-mono text-[10px] uppercase opacity-50">Min Turnover</th>
              <th className="p-4 font-mono text-[10px] uppercase opacity-50">Max Turnover</th>
              <th className="p-4 font-mono text-[10px] uppercase opacity-50">Daily Tax</th>
              <th className="p-4 font-mono text-[10px] uppercase opacity-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {isAdding && (
              <tr className="bg-amber-50">
                <td className="p-4"><input type="text" value={newBand.name} onChange={e => setNewBand({...newBand, name: e.target.value})} className="w-full border border-[#141414] p-1 text-sm" /></td>
                <td className="p-4"><input type="number" value={newBand.min_turnover} onChange={e => setNewBand({...newBand, min_turnover: parseInt(e.target.value)})} className="w-full border border-[#141414] p-1 text-sm" /></td>
                <td className="p-4"><input type="number" value={newBand.max_turnover} onChange={e => setNewBand({...newBand, max_turnover: parseInt(e.target.value)})} className="w-full border border-[#141414] p-1 text-sm" /></td>
                <td className="p-4"><input type="number" value={newBand.daily_tax} onChange={e => setNewBand({...newBand, daily_tax: parseInt(e.target.value)})} className="w-full border border-[#141414] p-1 text-sm" /></td>
                <td className="p-4 flex gap-2">
                  <button onClick={handleAdd} className="p-2 bg-emerald-600 text-white"><Save size={16} /></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 bg-red-600 text-white"><X size={16} /></button>
                </td>
              </tr>
            )}
            {bands.map(band => (
              <tr key={band.id} className="hover:bg-[#f9f9f9]">
                <td className="p-4 font-medium">{band.name}</td>
                <td className="p-4 font-mono text-sm">₦{band.min_turnover.toLocaleString()}</td>
                <td className="p-4 font-mono text-sm">₦{band.max_turnover.toLocaleString()}</td>
                <td className="p-4 font-mono text-sm font-bold">₦{band.daily_tax.toLocaleString()}</td>
                <td className="p-4 flex gap-2">
                  <button className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-white transition-all"><Edit2 size={16} /></button>
                  <button className="p-2 border border-[#141414] hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
