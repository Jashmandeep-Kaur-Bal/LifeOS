import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Shopping() {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [budgetCap, setBudgetCap] = useState(500);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/shopping")
      .then(({ data }) => {
        setBudgetCap(data.budgetCap);
        setItems(data.items);
      })
      .catch((err) => console.error("Failed to load shopping data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName || !price || isNaN(price)) return;
    try {
      const { data } = await api.post("/shopping/items", { name: itemName, price: parseFloat(price) });
      setItems([...items, data]);
      setItemName("");
      setPrice("");
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  const toggleBought = async (id) => {
    try {
      const { data } = await api.patch(`/shopping/items/${id}`);
      setItems(items.map((i) => (i._id === id ? data : i)));
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  const totalCost = items.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Shopping & Budget Cap</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <SourceChecklist module="shopping" title="Shopping Source Checklist" />

        <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wishlist Budget Cap</h2>
            <div className="text-3xl font-black text-white mt-1">
              ${totalCost} <span className="text-sm font-normal text-slate-400">/ ${budgetCap} Goal</span>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Budget Usage</span>
              <span className={totalCost > budgetCap ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {Math.round((totalCost / budgetCap) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  totalCost > budgetCap ? "bg-rose-500" : "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                }`}
                style={{ width: `${Math.min((totalCost / budgetCap) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Add Wishlist Item</h2>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Est. Price ($)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:opacity-90 cursor-pointer"
              >
                + Save Item
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md md:col-span-2">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Saved Wishlist</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading wishlist...</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => toggleBought(item._id)}
                    className="p-4 rounded-xl bg-slate-900/60 border border-violet-900/30 flex items-center justify-between cursor-pointer"
                  >
                    <span className={`text-sm font-semibold ${item.bought ? "line-through text-slate-500" : "text-white"}`}>
                      {item.name}
                    </span>
                    <span className="text-xs font-mono text-fuchsia-400">${item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget module="shopping" label="Shopping Assistant" context={{ items, budgetCap }} />
    </div>
  );
}
