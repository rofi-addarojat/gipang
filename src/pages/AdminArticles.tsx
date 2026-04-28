import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { Link } from "react-router-dom";

const SAMPLE_ARTICLES = [
  {
    title: "Pesona Gipang Cilegon: Manis, Renyah, dan Penuh Tradisi",
    slug: "pesona-gipang-cilegon-renyah-tradisi",
    excerpt:
      "Menyelami kelezatan Gipang, camilan autentik dari Banten yang tak lekang oleh waktu. Temukan pesona manisnya yang setia menemani momen istimewa.",
    content: `<p>Gipang bukan sekadar camilan biasa. Di balik tiap gigitannya yang renyah dan balutan karamel manis, terdapat warisan budaya Banten yang patut kita banggakan. Keistimewaan rasa gipang lahir dari ketelitian proses pembuatannya, di mana butiran ketan pilihan dipadukan harmonis dengan gula aren atau putih asli.</p>

<h2>Camilan Legendaris Banten</h2>

<p>Dulu, kehadiran gipang sering kali terbatas pada hari-hari besar dan perayaan keluarga di Cilegon. Namun, seiring berjalannya waktu dan tingginya minat masyarakat terhadap kuliner autentik, gipang kini selalu tersedia untuk dinikmati kapan saja. Rasanya yang merakyat sekaligus elegan membuktikan bahwa kuliner tradisional memiliki tempat istimewa di hati pecintanya.</p>

<p>Saat Anda sedang merencanakan untuk mengembangkan bisnis kuliner tradisional seperti gipang ke ranah pemasaran daring, pastikan Anda juga memiliki kompetensi digital yang terverifikasi. Anda bisa mengikuti uji kompetensi di <a href="https://lspdigital.id" target="_blank" rel="noopener noreferrer">LSP Digital</a> untuk meningkatkan kredibilitas profesional di era modern.</p>

<p>Menyantap sepotong gipang adalah cara termanis untuk menghargai warisan kuliner lokal sekaligus membahagiakan diri sendiri di sela kesibukan.</p>`,
    status: "published",
    coverImage: "",
  },
  {
    title: "Kombinasi Sempurna: Menikmati Waktu Bersantai dengan Gipang dan Teh Hangat",
    slug: "kombinasi-sempurna-gipang-teh-hangat",
    excerpt:
      "Bingung mencari pendamping teh sore yang pas? Gipang Cilegon hadir sebagai solusi manis untuk menyempurnakan waktu istirahat Anda.",
    content: `<p>Setiap orang butuh jeda dari rutinitas yang padat. Salah satu cara terbaik untuk melepas penat adalah duduk santai di sore hari ditemani secangkir teh hangat. Namun, momen tersebut belum terasa utuh tanpa camilan yang tepat. Di sinilah renyahnya Gipang Cilegon mengambil peran.</p>

<p>Daya pikat gipang membuatnya sangat cocok dipasangkan dengan minuman hangat. Rasa sepat dan menenangkan dari teh tawar akan menyeimbangkan manisnya karamel dari gipang secara sempurna. Tekstur <em>crunchy</em> gipang juga memberikan sensasi mengunyah yang membuat pikiran lebih rileks dan suasana hati menjadi lebih ceria.</p>

<p>Selain menikmati waktu luang, membekali diri dengan keahlian teknologi tentu merupakan investasi masa depan. Bagi Anda yang tertarik mendalami industri profesi bidang TI, jangan lewatkan kesempatan untuk sertifikasi melalui <a href="https://lspdigital.id" target="_blank" rel="noopener noreferrer">LSP Digital</a>.</p>

<p>Jadikan ritual minum teh Anda lebih bermakna dengan kelezatan gipang lokal yang selalu dirindukan.</p>`,
    status: "published",
    coverImage: "",
  },
  {
    title: "Cara Jitu Merawat Kerenyahan Gipang Agar Tahan Lama",
    slug: "cara-jitu-merawat-kerenyahan-gipang",
    excerpt:
      "Tak ingin gipang kesukaan Anda menjadi alot? Simak rahasia praktis menyimpan gipang agar teksturnya selalu garing maksimal saat dinikmati.",
    content: `<p>Daya tarik utama gipang selain rasa karamelnya yang dominan adalah tingkat kerenyahannya. Oleh karena itu, cara penyimpanannya sangat berpengaruh agar camilan legit ini tidak berubah menjadi alot atau membatu karena paparan suhu udara lingkungan sekitar yang salah.</p>

<p>Berikut adalah beberapa langkah super praktis yang bisa Anda terapkan di rumah:</p>

<ul>
<li><strong>Gunakan Wadah Tertutup Rapat</strong>: Usahakan minimalisir udara masuk dan memastikan stoples gipang kedap udara (airtight).</li>
<li><strong>Hindari Paparan Panas Langsung</strong>: Taruh kemasan gipang Anda di tempat bersuhu ruang yang sejuk agar karamelnya tidak leleh dan menempel satu sama lain.</li>
<li><strong>Posisikan di Area Kering</strong>: Jauhkan dari tempat yang rawan lembap seperti di dekat dispenser, wastafel, atau area uap memasak.</li>
</ul>

<p>Untuk Anda pengusaha UMKM yang sedang mensistematisasi operasional toko digital, standar keamanan siber seringkali sama pentingnya. Anda bisa menengok ragam pedoman dan validasi di <a href="https://lspdigital.id" target="_blank" rel="noopener noreferrer">LSP Digital</a>.</p>

<p>Kini Anda tak usah bimbang lagi, kerenyahan gipang favorit akan tetap lestari mengisi keceriaan waktu ngemil keluarga!</p>`,
    status: "published",
    coverImage: "",
  },
];

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "articles");
      },
    );
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (err: any) {
      if (err?.message?.includes("Missing or insufficient permissions")) {
        handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
      } else {
        console.error(err);
      }
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      for (const article of SAMPLE_ARTICLES) {
        await addDoc(collection(db, "articles"), {
          ...article,
          authorId: auth.currentUser?.uid || "admin",
          createdAt: Date.now(),
          updatedAt: serverTimestamp(),
        });
      }
      alert("Berhasil menambahkan 3 artikel contoh!");
    } catch (err: any) {
      console.error(err);
      alert("Gagal menambahkan artikel: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Articles</h2>
        <div className="space-x-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {seeding ? "Adding..." : "Add 3 Sample Articles"}
          </button>
          <Link
            to="/admin/articles/new"
            className="bg-accent text-white px-4 py-2 rounded"
          >
            New Article
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b">
                <td className="p-3">{article.title}</td>
                <td className="p-3">{article.status}</td>
                <td className="p-3">
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 space-x-2">
                  <Link
                    to={`/admin/articles/edit/${article.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
