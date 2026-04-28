/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import {
  ShoppingBag,
  Star,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
  Heart,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react";
import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";

// Animation Helper
const FadeIn = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  key?: React.Key;
}) => {
  const directionOffsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const marketplaceReviews = [
  {
    id: 1,
    name: "Siska Amelia",
    source: "Shopee",
    rating: 5,
    date: "12 Okt 2023",
    text: "Packing sangat aman berlapis bubble wrap. Gipangnya beneran renyah dan wangiii karamel. Pas banget buat teman ngeteh sore.",
    variant: "Variant: Original 500g"
  },
  {
    id: 2,
    name: "budi_santoso88",
    source: "Tokopedia",
    rating: 5,
    date: "24 Nov 2023",
    text: "Barang cepat sampai. Udah sering beli oleh-oleh di sini dan gapernah ngecewain. Rasanya konsisten sama kayak yang dulu.",
    variant: "Variant: Varian Duo"
  },
  {
    id: 3,
    name: "Cinta P.",
    source: "Shopee",
    rating: 5,
    date: "05 Jan 2024",
    text: "Manisnya beneran pas, ngga bikin serik di tenggorokan. Anak-anak pada suka banget! Bakalan langganan pokoknya.",
    variant: "Variant: Original 250g"
  },
  {
    id: 4,
    name: "Ria R.",
    source: "Tokopedia",
    rating: 5,
    date: "14 Feb 2024",
    text: "Mantap!! Beli buat oleh-oleh mertua, katanya enak. Bikin nagih dan kemasannya itu lho tebel jadi aman ngga ancur.",
    variant: "Variant: Premium Pouch"
  },
  {
    id: 5,
    name: "dian_eka",
    source: "Shopee",
    rating: 5,
    date: "02 Mar 2024",
    text: "Gila sih, baru buka kemasan langsung ludes setengah. Renyah banget dan karamelnya kerasa premium! Seller juga ramah.",
    variant: "Variant: Original 500g"
  },
  {
    id: 6,
    name: "Andi Wijaya",
    source: "Tokopedia",
    rating: 5,
    date: "18 Mei 2024",
    text: "Oleh-oleh wajib kalau ingat Cilegon. Sekarang kemasannya makin bagus, rasanya tetep juara dari dulu. Recommended banget.",
    variant: "Variant: Premium Pouch"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  const [cmsData, setCmsData] = useState({
    logoImage: "https://i.ibb.co.com/4RpzdRff/image.png",
    logoTextMain: "Gipang Cilegon",
    logoTextSub: "Go Internasional 🌍",

    // Contacts
    contactWa: "https://wa.me/6281234567890",
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

    // Blog
    blogTitle: "Kabar Terbaru",

    // CTA Bottom
    ctaBottomTitle: "Siap Ngemil Enak Hari Ini?",
    ctaBottomText:
      "Pesan lebih mudah, aman, dan nikmati promo gratis ongkir di marketplace kesayanganmu sekarang juga sebelum kehabisan stok!",
    ctaOrderShopee: "Beli di Shopee",
    ctaOrderTokopedia: "Beli di Tokopedia",
    ctaOrderDirect: "Beli Langsung",
    ctaOrderWa: "Pesan via WhatsApp",

    // Footer
    footerTitle: "Gipang Cilegon",
    footerSlogan: '"Cemilane Wong Cilegon"',
    footerCopyright: "© 2026 Gipang Cilegon. All rights reserved.",

    // Social
    socialInstagram: "",
    socialTiktok: "",
    socialFacebook: "",
    socialYoutube: "",
  });

  const [articles, setArticles] = useState<any[]>([]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, "settings", "landingPage"),
      (doc) => {
        if (doc.exists()) {
          setCmsData((prev) => ({ ...prev, ...doc.data() }));
        }
      },
    );
    const q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
    );
    const unsubArticles = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubSettings();
      unsubArticles();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "Testimoni", href: "#testimoni" },
    { name: "Pesan Sekarang", href: "#pesan" },
    { name: "Lacak Pesanan", href: "/lacak-pesanan" },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      navigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="font-sans min-h-screen overflow-x-hidden selection:bg-accent selection:text-white">
      {/* 1. NAVBAR */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-primary/95 backdrop-blur-md border-b border-accent/10 shadow-sm py-0" : "bg-transparent py-2"}`}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main Navigation"
        >
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a
                href="#beranda"
                aria-label="Kembali ke Beranda"
                className="flex items-center gap-2 md:gap-3 group"
                onClick={(e) => handleNavClick(e, "#beranda")}
              >
                <img
                  className="h-10 md:h-11 w-auto object-contain transition-all duration-500 group-hover:scale-105"
                  src={cmsData.logoImage || undefined}
                  alt="Logo Gipang Cilegon"
                  width="120"
                  height="40"
                />
                <div className="hidden sm:flex flex-col justify-center border-l-2 border-accent/20 pl-2.5 sm:pl-3 py-0.5">
                  <span className="font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4813A] via-[#E89E5E] to-[#A05D24] text-[14px] sm:text-lg md:text-xl tracking-wider group-hover:brightness-110 transition-all duration-300 leading-none mb-1">
                    {cmsData.logoTextMain}
                  </span>
                  <span className="text-[8px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.3em] text-accent/90 whitespace-nowrap">
                    {cmsData.logoTextSub}
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-text-main hover:text-accent font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#pesan"
                onClick={(e) => handleNavClick(e, "#pesan")}
                className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Beli Sekarang
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-main hover:text-accent focus:outline-none"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigasi menu"
              >
                {isMobileMenuOpen ? (
                  <X size={28} aria-hidden="true" />
                ) : (
                  <Menu size={28} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-primary border-t border-accent/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-3 py-4 text-center text-text-main font-medium border-b border-black/5 hover:text-accent"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#pesan"
                onClick={(e) => handleNavClick(e, "#pesan")}
                className="block mt-4 text-center bg-accent text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all shadow-md"
              >
                Beli Sekarang
              </a>
            </div>
          </motion.div>
        )}
      </header>

      <main>
              {/* 2. HERO SECTION */}
        <section
          id="beranda"
          className="pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
              {/* Left Content */}
              <FadeIn
                direction="right"
                className="order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-accent/20 text-sm font-semibold text-accent mb-4 md:mb-6 shadow-sm">
                  {cmsData.heroBadge}
                </span>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-text-main mb-4 md:mb-6"
                  dangerouslySetInnerHTML={{
                    __html: cmsData.heroTitle.replace(
                      "Manis Legitnya",
                      '<span className="text-accent">Manis Legitnya</span>',
                    ),
                  }}
                ></h1>
                <p className="text-base sm:text-lg text-text-main/80 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                  {cmsData.heroSubtitle}
                </p>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#pesan"
                  onClick={(e: any) => handleNavClick(e, "#pesan")}
                  className="inline-block bg-accent text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-accent/30 hover:shadow-accent/40 transition-shadow mb-6 md:mb-8"
                  aria-label="Gulir ke bagian Pesan Sekarang"
                >
                  {cmsData.heroCtaText}
                </motion.a>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm font-medium text-text-main/70">
                  <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-md">
                    <span>🌟</span> 100% Alami
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-md">
                    <span>🍯</span> Gula Asli
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-md">
                    <span>🛡️</span> Higienis
                  </div>
                </div>
              </FadeIn>

              {/* Right Content */}
              <FadeIn direction="left" className="order-1 md:order-2 relative w-full max-w-sm sm:max-w-md md:max-w-none mx-auto mb-8 md:mb-0">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl transform scale-90 -z-10"></div>
                <img
                  src={cmsData.heroImageBig || undefined}
                  alt="Gipang Cilegon Cemilan Renyah Bikin Kangen"
                  fetchPriority="high"
                  width="600"
                  height="600"
                  className="w-full aspect-[4/3] sm:aspect-square md:aspect-auto md:h-[400px] lg:h-[500px] object-cover rounded-[2rem] shadow-2xl border-4 border-white transform hover:rotate-1 transition-transform duration-500"
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 3. SECTION: KENAPA HARUS GIPANG CILEGON? (Manfaat) */}
        <section id="keunggulan" className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="none" className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-bold text-text-main"
                dangerouslySetInnerHTML={{ __html: cmsData.keunggulanTitle }}
              ></h2>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Image */}
              <FadeIn direction="right">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/10 rounded-[2.5rem] transform -translate-x-4 translate-y-4 -z-10"></div>
                  <img
                    src={cmsData.keunggulanImage || undefined}
                    alt="Proses Pembuatan Gipang Cilegon Super Renyah"
                    loading="lazy"
                    width="600"
                    height="600"
                    className="w-full aspect-[4/3] sm:aspect-square object-cover rounded-[2.5rem] shadow-lg border border-gray-100"
                  />
                </div>
              </FadeIn>

              {/* Right List */}
              <div className="space-y-10">
                <FadeIn direction="up" delay={0.1}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center text-accent rounded-2xl shadow-sm border border-accent/10">
                        <Star size={24} className="fill-accent text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-main mb-2">
                        {cmsData.k1Title}
                      </h3>
                      <p className="text-text-main/75 leading-relaxed">
                        {cmsData.k1Desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn direction="up" delay={0.2}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center text-accent rounded-2xl shadow-sm border border-accent/10">
                        <Heart size={24} className="fill-accent text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-main mb-2">
                        {cmsData.k2Title}
                      </h3>
                      <p className="text-text-main/75 leading-relaxed">
                        {cmsData.k2Desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn direction="up" delay={0.3}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center text-accent rounded-2xl shadow-sm border border-accent/10">
                        <ShieldCheck size={24} className="text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-main mb-2">
                        {cmsData.k3Title}
                      </h3>
                      <p className="text-text-main/75 leading-relaxed mb-4">
                        {cmsData.k3Desc}
                      </p>
                      <div className="flex items-center justify-start gap-4">
                        <div className="relative group cursor-pointer inline-block">
                          <img
                            src={cmsData.k3Image || undefined}
                            alt="Ilustrasi Kemasan Toples Aman Gipang Cilegon"
                            loading="lazy"
                            width="96"
                            height="96"
                            className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-md group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-sm font-medium text-text-main/60 italic max-w-[150px]">
                          Gambar ilustrasi kemasan toples kokoh.
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SECTION: TEMAN NGOPI TERBAIK */}
        <section
          aria-label="Momen Menikmati Gipang"
          className="py-20 bg-primary-dark"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <FadeIn direction="right">
                <div className="group overflow-hidden rounded-[2rem] shadow-lg border border-white/50 bg-white">
                  <img
                    src={cmsData.temanNgopiImg1 || undefined}
                    alt="Menikmati Gipang Cilegon saat santai bebas cemas"
                    loading="lazy"
                    width="600"
                    height="400"
                    className="w-full aspect-video md:aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </FadeIn>
              <FadeIn direction="left" delay={0.2}>
                <div className="group overflow-hidden rounded-[2rem] shadow-lg border border-white/50 bg-white">
                  <img
                    src={cmsData.temanNgopiImg2 || undefined}
                    alt="Gipang Cilegon sebagai pendamping kopi di sore hari"
                    loading="lazy"
                    width="600"
                    height="400"
                    className="w-full aspect-video md:aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 hover:object-bottom"
                  />
                </div>
              </FadeIn>
            </div>

            <FadeIn direction="up">
              <p
                className="text-center text-xl md:text-2xl font-medium text-text-main max-w-4xl mx-auto leading-relaxed px-4"
                dangerouslySetInnerHTML={{
                  __html: cmsData.temanNgopiText.replace(
                    "Gipang Cilegon",
                    '<span className="font-bold text-accent">Gipang Cilegon</span>',
                  ),
                }}
              ></p>
            </FadeIn>
          </div>
        </section>

        {/* 5. SECTION: CARA PEMESANAN */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="none" className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-main">
                Cara Mudah Menikmati Gipang Cilegon
              </h2>
              <p className="text-text-main/70 mt-4 text-lg">Pesan langsung dari rumah, biar kami yang antarkan rasa renyah ini ke depan pintu Anda.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Pilih Produk",
                  desc: "Lihat dan pilih varian gipang yang Anda inginkan di halaman checkout kami."
                },
                {
                  step: "02",
                  title: "Isi Data Diri",
                  desc: "Masukkan alamat pengiriman dan pilih metode pembayaran favorit Anda (QRIS / COD)."
                },
                {
                  step: "03",
                  title: "Konfirmasi",
                  desc: "Selesaikan pembayaran, dan pesanan Anda akan langsung kami verifikasi."
                },
                {
                  step: "04",
                  title: "Tunggu Dirumah",
                  desc: "Duduk manis, kurir kami akan memastikan pesanan sampai dengan aman dan utuh."
                }
              ].map((item, i) => (
                <FadeIn key={item.step} direction="up" delay={i * 0.1} className="relative">
                  <div className="bg-primary/30 border border-black/5 rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300">
                    <span className="text-5xl font-black text-accent/20 mb-6 block">{item.step}</span>
                    <h3 className="text-xl font-bold text-text-main mb-3">{item.title}</h3>
                    <p className="text-text-main/70 leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-accent/30 -translate-y-1/2 z-10"></div>
                  )}
                </FadeIn>
              ))}
            </div>
            
            <FadeIn direction="up" className="mt-12 text-center">
              <a href="#pesan" onClick={(e) => handleNavClick(e, "#pesan")} className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all hover:brightness-110">
                Mulai Pesan Sekarang <span aria-hidden="true">&rarr;</span>
              </a>
            </FadeIn>
          </div>
        </section>

        {/* 6. SECTION: KATA MEREKA */}
        <section id="testimoni" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAEDDF] via-white to-primary animate-gradient-xy pointer-events-none -z-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <FadeIn direction="none" className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">
                {cmsData.testimoniTitle}
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <div className="relative flex flex-col gap-6 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-4">
                {/* Decorative gradients for fading edges */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none hidden md:block"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none hidden md:block"></div>

                {/* Marquee Row 1 */}
                <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused] pl-6">
                  {[...marketplaceReviews, ...marketplaceReviews].map((r, i) => (
                    <div
                      key={`row1-${i}`}
                      className="w-[320px] md:w-[400px] shrink-0 bg-white p-6 rounded-3xl border border-primary-dark shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 relative flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 font-bold rounded-full flex items-center justify-center text-lg ${i % 2 === 0 ? 'bg-[#EE4D2D]/10 text-[#EE4D2D]' : 'bg-[#00AA5B]/10 text-[#00AA5B]'}`}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-text-main text-sm truncate w-32">{r.name}</h4>
                            <div className="flex gap-0.5 text-yellow-400">
                              {[...Array(r.rating)].map((_, idx) => (
                                <Star key={idx} size={12} className="fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                          <p className="text-[11px] text-text-main/50 font-medium">{r.date}</p>
                        </div>
                      </div>
                      <p className="text-text-main/80 text-sm leading-relaxed mb-4 flex-grow">
                        "{r.text}"
                      </p>
                      <div className="mt-auto px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-text-main/60 truncate">
                        {r.variant}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Marquee Row 2 (Reverse, or just different timing, but since we use same animation, we can shift the items or make another animation if we wanted, but let's just use same animation with slow speed) */}
                <div className="flex w-max animate-marquee-slow gap-6 hover:[animation-play-state:paused] pl-6" style={{ animationDirection: "reverse" }}>
                  {[...marketplaceReviews.slice().reverse(), ...marketplaceReviews.slice().reverse()].map((r, i) => (
                    <div
                      key={`row2-${i}`}
                      className="w-[320px] md:w-[400px] shrink-0 bg-white p-6 rounded-3xl border border-primary-dark shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 relative flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 font-bold rounded-full flex items-center justify-center text-lg ${i % 2 === 0 ? 'bg-[#00AA5B]/10 text-[#00AA5B]' : 'bg-[#EE4D2D]/10 text-[#EE4D2D]'}`}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-text-main text-sm truncate w-32">{r.name}</h4>
                            <div className="flex gap-0.5 text-yellow-400">
                              {[...Array(r.rating)].map((_, idx) => (
                                <Star key={idx} size={12} className="fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                          <p className="text-[11px] text-text-main/50 font-medium">{r.date}</p>
                        </div>
                      </div>
                      <p className="text-text-main/80 text-sm leading-relaxed mb-4 flex-grow">
                        "{r.text}"
                      </p>
                      <div className="mt-auto px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-text-main/60 truncate">
                        {r.variant}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 7. BLOG / ARTICLES SECTION */}
        {articles.length > 0 && (
          <section id="artikel" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeIn direction="none" className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">
                  {cmsData.blogTitle}
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.slice(0, 3).map((article) => (
                  <FadeIn key={article.id} direction="up" className="h-full">
                    <Link
                      to={`/artikel/${article.slug}`}
                      className="group bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="overflow-hidden">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage || undefined}
                            alt={article.title}
                            loading="lazy"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-tr from-accent/20 to-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <span className="text-accent/60 font-serif italic text-xl tracking-wider">
                              {cmsData.logoTextMain}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-3 text-text-main group-hover:text-accent transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-text-main/70 mb-8 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <span className="mt-auto text-accent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Baca Selengkapnya{" "}
                          <span aria-hidden="true">&rarr;</span>
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. FAQ SECTION */}
        <section id="faq" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="none" className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-text-main/70 text-lg">Punya pertanyaan? Kami punya jawabannya.</p>
            </FadeIn>
            
            <div className="space-y-4">
              {[
                {
                  q: "Berapa lama masa simpan Gipang Cilegon?",
                  a: "Dalam wadah tertutup rapat, Gipang merapat Cilegon bisa tahan hingga 1-2 bulan sejak tanggal pembelian dengan mempertahankan kerenyahannya."
                },
                {
                  q: "Apakah Gipang ini keras saat digigit?",
                  a: "Tidak. Kami memastikan tekstur karamel dari gula dan ketan sangat pas, sehingga mudah digigit, renyah (crunchy), dan tidak membuat gigi sakit."
                },
                {
                  q: "Apakah bisa request kemasan khusus untuk hampers / oleh-oleh?",
                  a: "Tentu bisa! Silakan hubungi admin kami melalui WhatsApp untuk membicarakan kebutuhan pesanan jumlah besar, souvenir, atau hampers."
                },
                {
                  q: "Untuk pembayaran bisa pakai apa saja?",
                  a: "Kami saat ini melayani pembayaran melalui COD (Bayar di Tempat) dan QRIS yang akan terdeteksi otomatis oleh sistem sehingga Anda tidak perlu repot mengirimkan bukti transfer."
                }
              ].map((faq, i) => (
                <FadeIn key={i} direction="up" delay={i * 0.1}>
                  <details className="group bg-gray-50 border border-black/5 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-text-main text-lg">
                      <span>{faq.q}</span>
                      <span className="relative ml-4 shrink-0 w-6 h-6 flex items-center justify-center">
                        <svg className="w-4 h-4 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-text-main/70 leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA & CHECKOUT */}
        <section
          id="pesan"
          className="py-24 bg-[#E0D8C3] relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl mix-blend-multiply"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <FadeIn direction="up">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-main mb-6">
                {cmsData.ctaBottomTitle}
              </h2>
              <p className="text-xl text-text-main/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                {cmsData.ctaBottomText}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 md:gap-5">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={cmsData.contactShopee}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Beli Gipang Cilegon di Shopee"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-shopee text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_30px_rgb(238,77,45,0.4)] hover:shadow-[0_15px_40px_rgb(238,77,45,0.6)] transition-all border border-shopee/50"
                >
                  <ShoppingBag size={24} aria-hidden="true" />
                  {cmsData.ctaOrderShopee}
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={cmsData.contactTokopedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Beli Gipang Cilegon di Tokopedia"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-tokopedia text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_30px_rgb(0,170,91,0.4)] hover:shadow-[0_15px_40px_rgb(0,170,91,0.6)] transition-all border border-tokopedia/50"
                >
                  <ShoppingBag size={24} aria-hidden="true" />
                  {cmsData.ctaOrderTokopedia}
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/checkout")}
                  aria-label="Beli Gipang Cilegon Langsung"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_30px_rgb(251,146,60,0.4)] hover:shadow-[0_15px_40px_rgb(251,146,60,0.6)] transition-all border border-accent/50"
                >
                  <ShoppingBag size={24} aria-hidden="true" />
                  {cmsData.ctaOrderDirect}
                </motion.button>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer
        role="contentinfo"
        className="bg-white border-t border-black/5 pt-16 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <img
            src={cmsData.logoImage || undefined}
            alt="Logo Bawah Gipang Cilegon"
            loading="lazy"
            width="140"
            height="80"
            className="h-20 w-auto object-contain mb-6 grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100"
          />
          <h3 className="text-xl font-bold text-text-main mb-1">
            {cmsData.footerTitle}
          </h3>
          <p className="text-text-main/70 italic mb-8 font-medium">
            {cmsData.footerSlogan}
          </p>

          {/* Social Media Links */}
          <div className="flex gap-4 mb-8 justify-center">
            {cmsData.socialInstagram && (
              <a href={cmsData.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram size={24} />
              </a>
            )}
            {cmsData.socialFacebook && (
              <a href={cmsData.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent transition-colors" aria-label="Facebook">
                <Facebook size={24} />
              </a>
            )}
            {cmsData.socialYoutube && (
              <a href={cmsData.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent transition-colors" aria-label="Youtube">
                <Youtube size={24} />
              </a>
            )}
            {cmsData.socialTiktok && (
              <a href={cmsData.socialTiktok} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent transition-colors" aria-label="TikTok">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            )}
          </div>

          <div className="w-12 h-1 bg-accent/30 rounded-full mb-8"></div>
          <p className="text-sm text-text-main/50 font-medium tracking-wide">
            {cmsData.footerCopyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
