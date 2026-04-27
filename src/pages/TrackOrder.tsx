import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  ArrowLeft,
  Search,
  Clock,
  RefreshCw,
  CheckCircle,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TrackOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactWa, setContactWa] = useState("https://wa.me/6281234567890");

  React.useEffect(() => {
    const fetchWa = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "landingPage"));
        if (docSnap.exists() && docSnap.data().contactWa) {
          setContactWa(docSnap.data().contactWa);
        }
      } catch (err) {
        console.error("Error fetching WA contact:", err);
      }
    };
    fetchWa();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      const docRef = doc(db, "orders", orderId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrderData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Pesanan tidak ditemukan. Pastikan ID Pesanan benar.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan saat mencari pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-500 hover:text-accent mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Kembali ke Beranda
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Lacak Pesanan
            </h1>
            <p className="text-gray-600 mt-2">
              Masukkan ID Pesanan Anda untuk melihat status saat ini.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="p-6 md:p-8 border-b border-gray-100"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Masukkan ID Pesanan..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Search size={20} />
                )}
                <span className="hidden sm:inline">Cari</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Lupa ID Pesanan Anda?
              </p>
              <a
                href={`${contactWa}?text=Halo%20Admin,%20saya%20lupa%20ID%20Pesanan%20saya.%20Mohon%20bantuannya%20untuk%20mengecek%20status%20pesanan%20saya.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent font-medium hover:text-accent/80 transition-colors"
              >
                Hubungi CS via WhatsApp
              </a>
            </div>
          </form>

          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 bg-gray-50"
            >
              <h2 className="text-xl font-semibold mb-6">Detail Pesanan</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">ID Pesanan</span>
                    <span className="font-mono font-medium text-gray-900">
                      {orderData.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">
                      Tanggal Detail
                    </span>
                    <span className="font-medium text-gray-900">
                      {orderData.createdAt
                        ? new Date(
                            orderData.createdAt.toMillis(),
                          ).toLocaleDateString("id-ID")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Nama</span>
                    <span className="font-medium text-gray-900">
                      {orderData.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">
                      Total Harga
                    </span>
                    <span className="font-medium text-accent">
                      Rp {orderData.totalPrice?.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <span className="text-gray-500 text-sm block mb-3">
                    Status Saat Ini
                  </span>
                  <div className="flex items-center gap-3">
                    {orderData.status === "pending" ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                          <Clock size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-yellow-600 text-lg">
                            Menunggu Diproses
                          </div>
                          <p className="text-sm text-gray-600">
                            Pesanan Anda sudah kami terima dan sedang menunggu
                            untuk diproses penjual.
                          </p>
                        </div>
                      </>
                    ) : orderData.status === "processed" ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <RefreshCw size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-blue-600 text-lg">
                            Sedang Diproses/Dikirim
                          </div>
                          <p className="text-sm text-gray-600">
                            Pesanan Anda sedang dipersiapkan atau dalam
                            perjalanan pengiriman.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-green-600 text-lg">
                            Pesanan Selesai
                          </div>
                          <p className="text-sm text-gray-600">
                            Pesanan ini telah selesai dan sudah diterima.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
