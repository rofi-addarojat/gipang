import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';

export default function AdminDashboard() {
  const [data, setData] = useState({
    logoImage: 'https://i.ibb.co.com/4RpzdRff/image.png',
    logoTextMain: 'Gipang Cilegon',
    logoTextSub: 'Go Internasional 🌍',

    // Contacts
    contactWa: 'https://wa.me/6281234567890',
    contactShopee: 'https://shopee.co.id',
    contactTokopedia: 'https://tokopedia.com',

    // Hero Section
    heroBadge: '✨ Cemilan Autentik Banten',
    heroTitle: 'Kriuknya Bikin Kangen, Manis Legitnya Pas di Hati!',
    heroSubtitle: 'Sensasi cemilan legendaris khas Cilegon yang diolah dari ketan pilihan dan karamel alami. Teman ngopi paling sempurna yang bikin kamu gak bisa berhenti ngunyah.',
    heroCtaText: 'Cobain Renyahnya Sekarang!',
    heroImageBig: 'https://i.ibb.co.com/V0chxYHg/image.png',
    
    // Keunggulan Section
    keunggulanTitle: 'Bukan Cemilan Biasa, Ini Alasan Kamu Wajib Coba',
    keunggulanImage: 'https://i.ibb.co.com/cSGgfcnd/image.png',
    k1Title: '1. Tekstur Super Renyah',
    k1Desc: 'Digoreng dengan suhu presisi, menghasilkan tekstur crunchy yang pecah di mulut sejak gigitan pertama.',
    k2Title: '2. Manis Legit Anti-Serik',
    k2Desc: 'Menggunakan takaran karamel yang pas, manisnya sopan dan tidak bikin tenggorokan sakit.',
    k3Title: '3. Kemasan Aman & Rapi',
    k3Desc: 'Dikemas rapi dalam toples kokoh. Menjaga kualitas tetap baik saat di pengiriman dan mudah ditaruh di mana saja.',
    k3Image: 'https://i.ibb.co.com/wh3MrWpC/image.png',

    // Teman Ngopi
    temanNgopiText: '"Jadikan setiap momen santai, kumpul keluarga, atau suguhan tamu lebih istimewa dengan Gipang Cilegon."',
    temanNgopiImg1: 'https://i.ibb.co.com/6R11ZbwR/image.png',
    temanNgopiImg2: 'https://i.ibb.co.com/Y4tvbXSm/image.png',

    // Testimoni
    testimoniTitle: 'Mereka Sudah Buktikan Renyahnya!',

    // CTA Bottom
    ctaBottomTitle: 'Siap Ngemil Enak Hari Ini?',
    ctaBottomText: 'Pesan lebih mudah, aman, dan nikmati promo gratis ongkir di marketplace kesayanganmu sekarang juga sebelum kehabisan stok!',

    // Footer
    footerTitle: 'Gipang Cilegon',
    footerSlogan: '"Cemilane Wong Cilegon"',
    footerCopyright: '© 2026 Gipang Cilegon. All rights reserved.'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(db, 'settings', 'landingPage');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setData(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'landingPage'), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMessage('Saved successfully!');
    } catch (err: any) {
      if (err?.message?.includes('Missing or insufficient permissions')) {
         handleFirestoreError(err, OperationType.UPDATE, 'settings/landingPage');
      }
      setMessage('Failed to save.');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">Landing Page Settings</h2>
      {message && <div className={`p-4 mb-6 rounded font-semibold ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</div>}
      
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Nav & Brand */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">1. Branding & Kontak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Logo Image URL</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="logoImage" value={data.logoImage} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Logo Text Main</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="logoTextMain" value={data.logoTextMain} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Logo Text Sub</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="logoTextSub" value={data.logoTextSub} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Link WhatsApp</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="contactWa" value={data.contactWa} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Link Shopee</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="contactShopee" value={data.contactShopee} onChange={handleChange} />
            </div>
             <div>
              <label className="block text-sm font-semibold mb-1">Link Tokopedia</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="contactTokopedia" value={data.contactTokopedia} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">2. Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Badge Text</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="heroBadge" value={data.heroBadge} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Title</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="heroTitle" value={data.heroTitle} onChange={handleChange} />
              <p className="text-xs text-gray-500 mt-1">Gunakan kata "Manis Legitnya" jika ingin diwarnai orange.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Subtitle</label>
              <textarea className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-accent outline-none" name="heroSubtitle" value={data.heroSubtitle} onChange={handleChange} />
            </div>
             <div>
              <label className="block text-sm font-semibold mb-1">Hero CTA Button Text</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="heroCtaText" value={data.heroCtaText} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Image URL</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="heroImageBig" value={data.heroImageBig} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Keunggulan */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">3. Bagian Keunggulan</h3>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-semibold mb-1">Section Title</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="keunggulanTitle" value={data.keunggulanTitle} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Image URL</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="keunggulanImage" value={data.keunggulanImage} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-semibold mb-1">Keunggulan 1 - Title</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="k1Title" value={data.k1Title} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Keunggulan 1 - Desc</label>
                <textarea className="w-full border p-2 rounded h-16 focus:ring-2 focus:ring-accent outline-none" name="k1Desc" value={data.k1Desc} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Keunggulan 2 - Title</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="k2Title" value={data.k2Title} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Keunggulan 2 - Desc</label>
                <textarea className="w-full border p-2 rounded h-16 focus:ring-2 focus:ring-accent outline-none" name="k2Desc" value={data.k2Desc} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Keunggulan 3 - Title</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="k3Title" value={data.k3Title} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Keunggulan 3 - Desc</label>
                <textarea className="w-full border p-2 rounded h-16 focus:ring-2 focus:ring-accent outline-none" name="k3Desc" value={data.k3Desc} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Keunggulan 3 - Image URL</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="k3Image" value={data.k3Image} onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>

        {/* Teman Ngopi */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">4. Teman Ngopi Section</h3>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-semibold mb-1">Quote Text</label>
              <textarea className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-accent outline-none" name="temanNgopiText" value={data.temanNgopiText} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-semibold mb-1">Image 1 URL</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="temanNgopiImg1" value={data.temanNgopiImg1} onChange={handleChange} />
              </div>
               <div>
                <label className="block text-sm font-semibold mb-1">Image 2 URL</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="temanNgopiImg2" value={data.temanNgopiImg2} onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">5. Testimoni Section</h3>
           <div>
              <label className="block text-sm font-semibold mb-1">Testimoni Title</label>
              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="testimoniTitle" value={data.testimoniTitle} onChange={handleChange} />
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">6. CTA Bottom</h3>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold mb-1">CTA Title</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="ctaBottomTitle" value={data.ctaBottomTitle} onChange={handleChange} />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-1">CTA Description Text</label>
                <textarea className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-accent outline-none" name="ctaBottomText" value={data.ctaBottomText} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="p-4 border rounded-xl bg-gray-50/50">
          <h3 className="text-xl font-bold mb-4 text-accent">7. Footer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold mb-1">Footer Title</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="footerTitle" value={data.footerTitle} onChange={handleChange} />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-1">Footer Slogan</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="footerSlogan" value={data.footerSlogan} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Copyright Text</label>
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none" name="footerCopyright" value={data.footerCopyright} onChange={handleChange} />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t flex justify-end">
          <button disabled={saving} type="submit" className="bg-accent text-white px-8 py-3 rounded-lg font-bold hover:bg-accent/90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
