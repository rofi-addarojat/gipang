import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [qrisSettings, setQrisSettings] = useState({
    staticQris: "",
    nmid: "",
    webhookUrl: "",
    apiKey: "",
    adminWhatsapp: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, "settings", "qris");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQrisSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "settings/qris");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setQrisSettings((prev) => ({ ...prev, [name]: value }));
  };

  const generateApiKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setQrisSettings((prev) => ({ ...prev, apiKey: result }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      await setDoc(doc(db, "settings", "qris"), qrisSettings, { merge: true });

      // Hit backend API to save the new instance settings into our Node server memory / daemon
      await fetch("/api/qris/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qrisSettings),
      });

      setSuccessMsg(
        "Pengaturan QRIS berhasil disimpan dan disinkronkan ke server.",
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan pengaturan QRIS.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        General & QRIS Settings
      </h1>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nomor WhatsApp Admin
          </label>
          <input
            type="text"
            name="adminWhatsapp"
            value={qrisSettings.adminWhatsapp}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
            placeholder="6281234567890 (Gunakan 62)"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Nomor ini digunakan untuk tombol "Kirim via WhatsApp" pada saat pelanggan checkout.
          </p>
        </div>

        <hr className="my-6" />
        <h2 className="text-lg font-bold text-gray-800">API QRIS Dinamis</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Static QRIS String (DANA Bisnis dsb)
          </label>
          <textarea
            name="staticQris"
            value={qrisSettings.staticQris}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
            placeholder="00020101021126560011ID.DANA.WWW..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NMID
            </label>
            <input
              type="text"
              name="nmid"
              value={qrisSettings.nmid}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
              placeholder="ID102220494488"
            />
            <p className="text-xs text-gray-400 mt-1">
              Opsional, jika ingin spesifik NMid-nya.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              name="webhookUrl"
              value={qrisSettings.webhookUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-400 mt-1">
              URL yang akan di hit ketika ada mutasi/pembayaran.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            API Key (untuk Node.js Server)
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              name="apiKey"
              value={qrisSettings.apiKey}
              onChange={handleChange}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none"
              placeholder="Belum ada API Key (klik Generate)"
              required
            />
            <button
              type="button"
              onClick={generateApiKey}
              className="px-6 py-3 bg-gray-200 font-medium text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
