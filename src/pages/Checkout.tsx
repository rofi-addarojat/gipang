import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { createDynamicQris } from "../lib/qris";

export default function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
    paymentMethod: "cod", // 'cod' | 'qris'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [uniqueCode] = useState(() => Math.floor(Math.random() * 100)); // 0-99
  const [qrisUrl, setQrisUrl] = useState("");
  const [staticQrisContent, setStaticQrisContent] = useState("");
  const [adminWhatsappContent, setAdminWhatsappContent] = useState("6281234567890");

  const PRICE_PER_ITEM = 55000;
  const basePrice = formData.quantity * PRICE_PER_ITEM;
  const totalPrice = formData.paymentMethod === "qris" ? basePrice + uniqueCode : basePrice;

  const [orderStatus, setOrderStatus] = useState("pending");

  useEffect(() => {
    async function loadQrisSettings() {
      try {
        const docRef = doc(db, "settings", "qris");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.staticQris) {
            setStaticQrisContent(data.staticQris);
          }
          if (data.adminWhatsapp) {
            let processedWa = data.adminWhatsapp.trim();
            if (processedWa.startsWith('0')) processedWa = '62' + processedWa.slice(1);
            if (processedWa.startsWith('+')) processedWa = processedWa.slice(1);
            setAdminWhatsappContent(processedWa);
          }
        }
      } catch (error) {
        // fail silently if not found
      }
    }
    loadQrisSettings();
  }, []);

  useEffect(() => {
    if (formData.paymentMethod === "qris" && staticQrisContent) {
      try {
        const dynamicString = createDynamicQris(staticQrisContent, totalPrice);
        QRCode.toDataURL(dynamicString, { width: 300, margin: 2, scale: 5 }, (err, url) => {
          if (!err) setQrisUrl(url);
        });
      } catch (err) {
        console.error("Failed to generate Dynamic QRIS", err);
      }
    }
  }, [totalPrice, formData.paymentMethod, staticQrisContent]);

  useEffect(() => {
    let unsubscribe: any;
    if (success && createdOrderId && formData.paymentMethod === "qris") {
      import("firebase/firestore").then(({ doc, onSnapshot }) => {
        unsubscribe = onSnapshot(doc(db, "orders", createdOrderId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.status === "paid") {
              setOrderStatus("paid");
            }
          }
        });
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [success, createdOrderId, formData.paymentMethod]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap harus diisi";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    const phoneRegex = /^[0-9+\-\s]{9,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor WhatsApp/HP harus diisi";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Nomor telepon tidak valid. Gunakan 9-15 digit angka.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Alamat lengkap harus diisi";
    }

    if (formData.quantity < 1 || !Number.isInteger(formData.quantity)) {
      newErrors.quantity = "Jumlah pesanan minimal 1";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    console.log("Mulai memproses pesanan...", formData, totalPrice);
    setLoading(true);

    try {
      console.log("Attempting addDoc to orders collection...");
      const docRef = await addDoc(collection(db, "orders"), {
        ...formData,
        totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      console.log("Berhasil menambahkan doc:", docRef.id);
      
      // Trigger confirmation email
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: docRef.id,
            ...formData,
            totalPrice,
          })
        });
      } catch (err) {
        console.error("Gagal mengirim email konfirmasi", err);
      }
      
      setCreatedOrderId(docRef.id);
      setSuccess(true);
    } catch (error: any) {
      console.error("Terjadi error saat addDoc:", error);
      alert("Terjadi kesalahan saat membuat pesanan: " + error.message);
    } finally {
      console.log("Selesai memproses (finally block)");
      setLoading(false);
    }
  };

  if (success) {
    if (formData.paymentMethod === "qris" && orderStatus !== "paid") {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-lg border border-black/5 text-center max-w-md w-full"
          >
            <div className="animate-pulse mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-orange-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Menunggu Pembayaran</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Silakan scan QRIS di bawah ini untuk menyelesaikan pembayaran. Sistem akan mendeteksi pembayaran Anda secara otomatis.
            </p>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6 inline-block">
              {qrisUrl ? (
                <img
                  src={qrisUrl || undefined}
                  alt="QRIS Dinamis"
                  className="w-48 h-48 object-contain mx-auto bg-white p-2 rounded-xl border border-gray-200"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-xl mx-auto"></div>
              )}
              <div className="mt-4 pt-4 border-t border-orange-200">
                 <p className="text-sm font-medium text-orange-900 mb-1">Total Tagihan:</p>
                 <p className="text-2xl font-black text-orange-600">Rp {totalPrice.toLocaleString("id-ID")}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Nomor Pesanan</p>
              <div className="font-mono font-bold text-gray-900 border border-gray-200 py-1.5 px-3 rounded-lg bg-white inline-block">
                {createdOrderId}
              </div>
            </div>

            {/* Tombol simulasi untuk testing (bisa dihapus nanti, di MVP kita biarkan untuk demo) */}
            {process.env.NODE_ENV !== 'production' && (
              <button
                onClick={async () => {
                   // Simulate successful payment detection
                   const { updateDoc, doc } = await import("firebase/firestore");
                   await updateDoc(doc(db, "orders", createdOrderId), { status: "paid" });
                }}
                className="text-xs text-blue-500 underline mb-4"
              >
                Simulasikan Pembayaran Berhasil (Dev Only)
              </button>
            )}

            <button
              onClick={() => {
                const text = `Halo Admin Gipang Cilegon,%0A%0ASaya sudah membuat pesanan dengan ID: ${createdOrderId}%0ANama: ${formData.name}%0ATotal: Rp ${totalPrice.toLocaleString("id-ID")}%0AMetode: QRIS.%0A%0ASaya mengalami kendala pembayaran. Mohon bantuannya.`;
                window.open(`https://wa.me/${adminWhatsappContent}?text=${text}`, "_blank");
              }}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium"
            >
              Mengalami kendala? Hubungi Admin
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 text-center max-w-md w-full"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pesanan & Pembayaran Berhasil!</h2>
          <p className="text-gray-600 mb-6">
            Terima kasih telah memesan Gipang Cilegon.{" "}
            {formData.paymentMethod === "cod"
              ? "Kami akan segera memproses pesanan Anda dan Anda dapat membayar di tempat."
              : "Pembayaran QRIS Anda telah berhasil dideteksi sistem! Pesanan sedang kami proses."}
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">ID Pesanan Anda</p>
            <div className="font-mono text-lg font-bold text-gray-900 bg-white border border-gray-200 py-2 px-4 rounded-lg inline-block">
              {createdOrderId}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Simpan ID ini untuk melacak status pesanan Anda.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                const text = `Halo Admin Gipang Cilegon,%0A%0AIni adalah konfirmasi pesanan saya:%0A- *ID Pesanan*: ${createdOrderId}%0A- *Nama*: ${formData.name}%0A- *Jumlah*: ${formData.quantity} Box%0A- *Total Harga*: Rp ${totalPrice.toLocaleString("id-ID")}%0A- *Metode*: ${formData.paymentMethod === "cod" ? "COD" : "QRIS (Sudah Terbayar)"}%0A%0AMohon segera diproses. Terima kasih!`;
                window.open(`https://wa.me/${adminWhatsappContent}?text=${text}`, "_blank");
              }}
              className="w-full bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
            >
              Kirim Konfirmasi WhatsApp
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Beranda
              </button>
              <button
                onClick={() => navigate("/lacak-pesanan")}
                className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors"
              >
                Lacak
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-500 hover:text-accent mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-gray-100 bg-orange-50/50">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Checkout Pesanan
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Isi detail Anda untuk menyelesaikan pembelian Gipang Cilegon.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold border-b border-gray-100 pb-2">1. Informasi Pengiriman</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                    errors.name
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 placeholder-red-300"
                      : "border-gray-200 bg-gray-50 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10"
                  }`}
                  placeholder="Misal: Budi Santoso"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={16} />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                    errors.email
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 placeholder-red-300"
                      : "border-gray-200 bg-gray-50 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10"
                  }`}
                  placeholder="Misal: budi@gmail.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={16} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Nomor WhatsApp/HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                    errors.phone
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 placeholder-red-300"
                      : "border-gray-200 bg-gray-50 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10"
                  }`}
                  placeholder="Misal: 081234567890"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={16} />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                    errors.address
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 placeholder-red-300"
                      : "border-gray-200 bg-gray-50 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10"
                  }`}
                  placeholder="Nama jalan, RT/RW, kelurahan, kecamatan, kota/kabupaten, kode pos"
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={16} />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 space-y-5">
              <h2 className="text-xl font-semibold border-b border-gray-100 pb-2">2. Detail Pesanan</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Gipang Cilegon</p>
                  <p className="text-sm text-gray-500">Rp 55.000 / pcs</p>
                  {errors.quantity && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                      <AlertCircle size={16} />
                      {errors.quantity}
                    </p>
                  )}
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        quantity: Math.max(1, p.quantity - 1),
                      }))
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-accent hover:bg-orange-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    -
                  </button>
                  <span className="font-bold w-12 text-center text-gray-900 border-x border-gray-100 flex items-center justify-center h-8">
                    {formData.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, quantity: p.quantity + 1 }))
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-accent hover:bg-orange-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-5">
              <h2 className="text-xl font-semibold border-b border-gray-100 pb-2">3. Metode Pembayaran</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 ${formData.paymentMethod === "cod" ? "border-accent bg-accent/5 shadow-sm ring-1 ring-accent" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-gray-900 mb-1">
                    COD (Bayar di Tempat)
                  </div>
                  <p className="text-sm text-gray-500">
                    Bayar saat pesanan Anda sampai.
                  </p>
                </label>
                <label
                  className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 ${formData.paymentMethod === "qris" ? "border-accent bg-accent/5 shadow-sm ring-1 ring-accent" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qris"
                    checked={formData.paymentMethod === "qris"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-gray-900 mb-1">
                    QRIS / E-Wallet
                  </div>
                  <p className="text-sm text-gray-500">
                    Scan QR Code setelah pesanan dibuat.
                  </p>
                </label>
              </div>

              {formData.paymentMethod === "qris" && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-800 flex flex-col items-center">
                  {!staticQrisContent ? (
                    <div className="text-center p-4">
                      <p className="font-semibold text-red-600">Sistem QRIS sedang dalam pemeliharaan.</p>
                      <p className="text-gray-600 mt-1">Metode pembayaran QRIS belum dikonfigurasi oleh Admin.</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-2 text-center text-gray-700">
                        Scan QRIS di bawah ini untuk membayar:
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-48 h-48 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden relative"
                      >
                        {qrisUrl ? (
                          <img
                            src={qrisUrl || undefined}
                            alt="QRIS Dinamis"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="animate-pulse w-full h-full bg-gray-200"></div>
                        )}
                      </motion.div>
                      <p className="mt-2 text-xs text-orange-600 font-semibold">
                        *Pastikan nominal sesuai dengan Total Tagihan: Rp {totalPrice.toLocaleString("id-ID")}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 mt-8 hidden-when-success">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-600 font-medium">Total Tagihan</span>
                <span className="text-3xl font-extrabold text-accent">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || (formData.paymentMethod === "qris" && !staticQrisContent)}
                className="w-full bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-accent/90 focus:ring-4 focus:ring-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? "Memproses Pesanan..." : "Buat Pesanan Sekarang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
