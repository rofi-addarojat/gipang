import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import ImageInput from "../components/ImageInput";

export default function AdminDashboard() {
  const [data, setData] = useState({
    faviconImage: "",
    logoImage: "https://i.ibb.co.com/4RpzdRff/image.png",
    logoTextMain: "Gipang Cilegon",
    logoTextSub: "Go Internasional 🌍",

    // Contacts
    contactShopee: "https://shopee.co.id",
    contactTokopedia: "https://tokopedia.com",

    // Hero Section
    heroBadge: "✨ Cemilan Autentik Banten",
    heroTitle: "Kriuknya Bikin Kangen, Manis Legitnya Pas di Hati!",
    heroSubtitle:
      "Sensasi cemilan legendaris khas Cilegon yang diolah dari ketan pilihan dan karamel alami. Teman ngopi paling sempurna yang bikin kamu gak bisa berhenti ngunyah.",
    heroCtaText: "Cobain Renyahnya Sekarang!",
    heroImageBig: "https://i.ibb.co.com/V0chxYHg/image.png",

    // Keunggulan Section
    keunggulanTitle: "Bukan Cemilan Biasa, Ini Alasan Kamu Wajib Coba",
    keunggulanImage: "https://i.ibb.co.com/cSGgfcnd/image.png",
    k1Title: "1. Tekstur Super Renyah",
    k1Desc:
      "Digoreng dengan suhu presisi, menghasilkan tekstur crunchy yang pecah di mulut sejak gigitan pertama.",
    k2Title: "2. Manis Legit Anti-Serik",
    k2Desc:
      "Menggunakan takaran karamel yang pas, manisnya sopan dan tidak bikin tenggorokan sakit.",
    k3Title: "3. Kemasan Aman & Rapi",
    k3Desc:
      "Dikemas rapi dalam toples kokoh. Menjaga kualitas tetap baik saat di pengiriman dan mudah ditaruh di mana saja.",
    k3Image: "https://i.ibb.co.com/wh3MrWpC/image.png",

    // Teman Ngopi
    temanNgopiText:
      '"Jadikan setiap momen santai, kumpul keluarga, atau suguhan tamu lebih istimewa dengan Gipang Cilegon."',
    temanNgopiImg1: "https://i.ibb.co.com/6R11ZbwR/image.png",
    temanNgopiImg2: "https://i.ibb.co.com/Y4tvbXSm/image.png",

    // Testimoni
    testimoniTitle: "Mereka Sudah Buktikan Renyahnya!",
    t1Text:
      '"Gila sih, baru buka kemasan langsung ludes setengah. Renyah banget dan karamelnya kerasa premium!"',
    t1Name: "Rina",
    t1City: "JKT",
    t1Initial: "R",
    t2Text:
      '"Oleh-oleh wajib kalau ingat Cilegon. Sekarang kemasannya makin bagus, rasanya tetep juara dari dulu."',
    t2Name: "Budi",
    t2City: "BDG",
    t2Initial: "B",
    t3Text:
      '"Suka banget! Manisnya pas, dimakan pakai kopi pait sore-sore itu the best banget."',
    t3Name: "Dinda",
    t3City: "SBY",
    t3Initial: "D",

    // Blog Title
    blogTitle: "Kabar Terbaru",

    // CTA Bottom
    ctaBottomTitle: "Siap Ngemil Enak Hari Ini?",
    ctaBottomText:
      "Pesan lebih mudah, aman, dan nikmati promo gratis ongkir di marketplace kesayanganmu sekarang juga sebelum kehabisan stok!",
    ctaOrderShopee: "Beli di Shopee",
    ctaOrderTokopedia: "Beli di Tokopedia",
    ctaOrderDirect: "Beli Langsung",

    // Footer
    footerTitle: "Gipang Cilegon",
    footerSlogan: '"Cemilane Wong Cilegon"',
    footerCopyright: "© 2026 Gipang Cilegon. All rights reserved.",

    // Social Media Links
    socialInstagram: "",
    socialTiktok: "",
    socialFacebook: "",
    socialYoutube: "",

    // Custom Scripts
    customHeadScripts: "",
    customBodyScripts: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});

  const isValidUrl = (value: string) => {
    if (!value) return true; // Let other validation handle required fields if needed
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:" || value.startsWith('data:image');
    } catch {
      return value.startsWith('data:image');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(db, "settings", "landingPage");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setData((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));

    const urlFields = [
      "faviconImage",
      "logoImage",
      "contactShopee",
      "contactTokopedia",
      "heroImageBig",
      "keunggulanImage",
      "k3Image",
      "temanNgopiImg1",
      "temanNgopiImg2",
      "socialInstagram",
      "socialTiktok",
      "socialFacebook",
      "socialYoutube",
    ];

    if (urlFields.includes(name)) {
      if (value && !isValidUrl(value)) {
        setUrlErrors((prev) => ({
          ...prev,
          [name]: "Format URL tidak valid (harus dimulai dengan http:// atau https://)",
        }));
      } else {
        setUrlErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(urlErrors).length > 0) {
      setMessage("Terdapat format URL yang tidak valid. Harap perbaiki sebelum menyimpan.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await setDoc(
        doc(db, "settings", "landingPage"),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setMessage("Saved successfully!");
    } catch (err: any) {
      if (err?.message?.includes("Missing or insufficient permissions")) {
        handleFirestoreError(err, OperationType.UPDATE, "settings/landingPage");
      }
      setMessage("Failed to save.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">
        Landing Page Settings
      </h2>
      {message && (
        <div
          className={`p-4 mb-6 rounded font-semibold ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Nav & Brand */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            1. Branding & Kontak
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageInput
              label="Favicon Image (URL atau Upload)"
              name="faviconImage"
              value={data.faviconImage}
              onChange={handleChange}
              error={urlErrors.faviconImage}
            />
            <ImageInput
              label="Logo Image (URL atau Upload)"
              name="logoImage"
              value={data.logoImage}
              onChange={handleChange}
              error={urlErrors.logoImage}
            />
            <div>
              <label className="block text-sm font-semibold mb-1">
                Logo Text Main
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="logoTextMain"
                value={data.logoTextMain}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Logo Text Sub
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="logoTextSub"
                value={data.logoTextSub}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Link Shopee
              </label>
              <input
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${urlErrors.contactShopee ? "border-red-500" : ""}`}
                name="contactShopee"
                value={data.contactShopee}
                onChange={handleChange}
              />
              {urlErrors.contactShopee && <p className="text-red-500 text-xs mt-1">{urlErrors.contactShopee}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Link Tokopedia
              </label>
              <input
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${urlErrors.contactTokopedia ? "border-red-500" : ""}`}
                name="contactTokopedia"
                value={data.contactTokopedia}
                onChange={handleChange}
              />
              {urlErrors.contactTokopedia && <p className="text-red-500 text-xs mt-1">{urlErrors.contactTokopedia}</p>}
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            2. Hero Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Hero Badge Text
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="heroBadge"
                value={data.heroBadge}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Hero Title
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="heroTitle"
                value={data.heroTitle}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan kata "Manis Legitnya" jika ingin diwarnai orange.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Hero Subtitle
              </label>
              <textarea
                className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-accent outline-none"
                name="heroSubtitle"
                value={data.heroSubtitle}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Hero CTA Button Text
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="heroCtaText"
                value={data.heroCtaText}
                onChange={handleChange}
              />
            </div>
            <ImageInput
              label="Hero Image Big (URL atau Upload)"
              name="heroImageBig"
              value={data.heroImageBig}
              onChange={handleChange}
              error={urlErrors.heroImageBig}
            />
          </div>
        </section>

        {/* Keunggulan */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            3. Bagian Keunggulan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Section Title
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="keunggulanTitle"
                value={data.keunggulanTitle}
                onChange={handleChange}
              />
            </div>
            <ImageInput
              label="Image Utama Keunggulan"
              name="keunggulanImage"
              value={data.keunggulanImage}
              onChange={handleChange}
              error={urlErrors.keunggulanImage}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keunggulan 1 - Title
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="k1Title"
                  value={data.k1Title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keunggulan 1 - Desc
                </label>
                <textarea
                  className="w-full border p-2 rounded h-16 focus:ring-2 focus:ring-accent outline-none"
                  name="k1Desc"
                  value={data.k1Desc}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keunggulan 2 - Title
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="k2Title"
                  value={data.k2Title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keunggulan 2 - Desc
                </label>
                <textarea
                  className="w-full border p-2 rounded h-16 focus:ring-2 focus:ring-accent outline-none"
                  name="k2Desc"
                  value={data.k2Desc}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keunggulan 3 - Title
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="k3Title"
                  value={data.k3Title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keunggulan 3 - Desc
                </label>
                <textarea
                  className="w-full border p-2 rounded h-16 focus:ring-2 focus:ring-accent outline-none"
                  name="k3Desc"
                  value={data.k3Desc}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <ImageInput
                  label="Keunggulan 3 - Image"
                  name="k3Image"
                  value={data.k3Image}
                  onChange={handleChange}
                  error={urlErrors.k3Image}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Teman Ngopi */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            4. Teman Ngopi Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Quote Text
              </label>
              <textarea
                className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-accent outline-none"
                name="temanNgopiText"
                value={data.temanNgopiText}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageInput
                label="Image 1"
                name="temanNgopiImg1"
                value={data.temanNgopiImg1}
                onChange={handleChange}
                error={urlErrors.temanNgopiImg1}
              />
              <ImageInput
                label="Image 2"
                name="temanNgopiImg2"
                value={data.temanNgopiImg2}
                onChange={handleChange}
                error={urlErrors.temanNgopiImg2}
              />
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            5. Testimoni Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Testimoni Title
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="testimoniTitle"
                value={data.testimoniTitle}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Testimoni 1 - Text
                </label>
                <textarea
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="t1Text"
                  value={data.t1Text}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nama</label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent"
                  name="t1Name"
                  value={data.t1Name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">
                    Kota
                  </label>
                  <input
                    className="w-full border p-2 rounded focus:ring-2"
                    name="t1City"
                    value={data.t1City}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-20">
                  <label className="block text-sm font-semibold mb-1">
                    Inisial
                  </label>
                  <input
                    className="w-full border p-2 rounded focus:ring-2"
                    name="t1Initial"
                    value={data.t1Initial}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Testimoni 2 - Text
                </label>
                <textarea
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="t2Text"
                  value={data.t2Text}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nama</label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent"
                  name="t2Name"
                  value={data.t2Name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">
                    Kota
                  </label>
                  <input
                    className="w-full border p-2 rounded focus:ring-2"
                    name="t2City"
                    value={data.t2City}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-20">
                  <label className="block text-sm font-semibold mb-1">
                    Inisial
                  </label>
                  <input
                    className="w-full border p-2 rounded focus:ring-2"
                    name="t2Initial"
                    value={data.t2Initial}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Testimoni 3 - Text
                </label>
                <textarea
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="t3Text"
                  value={data.t3Text}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nama</label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent"
                  name="t3Name"
                  value={data.t3Name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">
                    Kota
                  </label>
                  <input
                    className="w-full border p-2 rounded focus:ring-2"
                    name="t3City"
                    value={data.t3City}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-20">
                  <label className="block text-sm font-semibold mb-1">
                    Inisial
                  </label>
                  <input
                    className="w-full border p-2 rounded focus:ring-2"
                    name="t3Initial"
                    value={data.t3Initial}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            6. Artikel / Kabar Section
          </h3>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Section Title
            </label>
            <input
              className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
              name="blogTitle"
              value={data.blogTitle}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">7. CTA Bottom</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                CTA Title
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="ctaBottomTitle"
                value={data.ctaBottomTitle}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                CTA Description Text
              </label>
              <textarea
                className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-accent outline-none"
                name="ctaBottomText"
                value={data.ctaBottomText}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Teks Tombol Shopee
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="ctaOrderShopee"
                  value={data.ctaOrderShopee}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Teks Tombol Tokopedia
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="ctaOrderTokopedia"
                  value={data.ctaOrderTokopedia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Teks Tombol Beli Langsung
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                  name="ctaOrderDirect"
                  value={data.ctaOrderDirect}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">8. Footer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Footer Title
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="footerTitle"
                value={data.footerTitle}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Footer Slogan
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="footerSlogan"
                value={data.footerSlogan}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">
                Copyright Text
              </label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none"
                name="footerCopyright"
                value={data.footerCopyright}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Social Media Links */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">9. Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Instagram URL
              </label>
              <input
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${urlErrors.socialInstagram ? "border-red-500" : ""}`}
                name="socialInstagram"
                value={data.socialInstagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
              {urlErrors.socialInstagram && <p className="text-red-500 text-xs mt-1">{urlErrors.socialInstagram}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                TikTok URL
              </label>
              <input
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${urlErrors.socialTiktok ? "border-red-500" : ""}`}
                name="socialTiktok"
                value={data.socialTiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/..."
              />
              {urlErrors.socialTiktok && <p className="text-red-500 text-xs mt-1">{urlErrors.socialTiktok}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Facebook URL
              </label>
              <input
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${urlErrors.socialFacebook ? "border-red-500" : ""}`}
                name="socialFacebook"
                value={data.socialFacebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
              />
              {urlErrors.socialFacebook && <p className="text-red-500 text-xs mt-1">{urlErrors.socialFacebook}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                YouTube URL
              </label>
              <input
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${urlErrors.socialYoutube ? "border-red-500" : ""}`}
                name="socialYoutube"
                value={data.socialYoutube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
              />
              {urlErrors.socialYoutube && <p className="text-red-500 text-xs mt-1">{urlErrors.socialYoutube}</p>}
            </div>
          </div>
        </section>

        {/* Custom Scripts */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">
            10. Custom Scripts (Analytics, Meta, dll)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Tambahkan kode script pihak ketiga (Google Analytics, Search
            Console, Pixel, dll) di sini.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Head Scripts (Masuk ke dalam tag &lt;head&gt;)
              </label>
              <textarea
                className="w-full border p-3 rounded h-32 font-mono text-sm focus:ring-2 focus:ring-accent outline-none"
                name="customHeadScripts"
                value={data.customHeadScripts}
                onChange={handleChange}
                placeholder="<script>...</script>"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Body Scripts (Masuk ke sebelum &lt;/body&gt;)
              </label>
              <textarea
                className="w-full border p-3 rounded h-32 font-mono text-sm focus:ring-2 focus:ring-accent outline-none"
                name="customBodyScripts"
                value={data.customBodyScripts}
                onChange={handleChange}
                placeholder="<script>...</script>"
              />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t flex justify-end">
          <button
            disabled={saving}
            type="submit"
            className="bg-accent text-white px-8 py-3 rounded-lg font-bold hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
