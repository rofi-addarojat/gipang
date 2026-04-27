import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { RefreshCw, CheckCircle, Clock, Trash2 } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, "orders");
        } catch (e: any) {
          setErrorMsg(e.message);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus,
      });
    } catch (err: any) {
      if (err?.message?.includes("Missing or insufficient permissions")) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
      } else {
        console.error(err);
        alert("Gagal update status pesanan");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "orders", id));
    } catch (err: any) {
      if (err?.message?.includes("Missing or insufficient permissions")) {
        handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
      } else {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (errorMsg) return <div className="p-6 text-red-500">Error loading orders: {errorMsg}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daftar Pesanan</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-700">Tanggal</th>
              <th className="p-3 font-semibold text-gray-700">Customer</th>
              <th className="p-3 font-semibold text-gray-700">Pesanan</th>
              <th className="p-3 font-semibold text-gray-700">Total</th>
              <th className="p-3 font-semibold text-gray-700">Metode</th>
              <th className="p-3 font-semibold text-gray-700">Status</th>
              <th className="p-3 font-semibold text-gray-700 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Belum ada pesanan
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <td className="p-3 align-top whitespace-nowrap text-sm">
                    {order.createdAt
                      ? new Date(order.createdAt.toMillis()).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-3 align-top">
                    <div className="font-semibold">{order.name}</div>
                    <div className="text-sm text-gray-600">{order.phone}</div>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs">
                      {order.address}
                    </div>
                  </td>
                  <td className="p-3 align-top whitespace-nowrap">
                    {order.quantity} pcs
                  </td>
                  <td className="p-3 align-top font-semibold text-accent whitespace-nowrap">
                    Rp {order.totalPrice?.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 align-top uppercase font-semibold text-sm">
                    {order.paymentMethod}
                  </td>
                  <td className="p-3 align-top">
                    {order.status === "pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        <Clock size={12} /> Pending
                      </span>
                    ) : order.status === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                        <CheckCircle size={12} /> Terbayar
                      </span>
                    ) : order.status === "processed" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <RefreshCw size={12} /> Diproses
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle size={12} /> Selesai
                      </span>
                    )}
                  </td>
                  <td className="p-3 align-top text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value)
                        }
                        className="text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-accent"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Terbayar</option>
                        <option value="processed">Diproses</option>
                        <option value="completed">Selesai</option>
                      </select>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Hapus Pesanan"
                      >
                        <Trash2 size={16} />
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
  );
}
