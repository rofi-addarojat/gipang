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
    title: "Sejarah Gipang: Cemilan Manis nan Renyah Warisan Banten",
    slug: "sejarah-gipang-banten",
    excerpt:
      "Gipang telah lama menjadi bagian dari tradisi kuliner masyarakat Banten. Temukan bagaimana cemilan sederhana dari ketan ini bertransformasi menjadi oleh-oleh wajib khas Cilegon.",
    content: `Gipang merupakan salah satu makanan tradisional khas dari daerah Banten, khususnya Cilegon. Terbuat dari bahan dasar beras ketan dan gula cair (karamel) yang kadang dicampur dengan kacang, gipang menawarkan perpaduan tekstur renyah dan rasa manis yang legit.

## Asal Usul Gipang
Dahulu, gipang sering disajikan pada acara-acara perayaan penting seperti Lebaran, pernikahan, atau acara khitanan. Proses pembuatannya yang memerlukan ketelitian membuat gipang menjadi simbol rasa syukur dan kebersamaan. 

## Transformasi Menjadi Oleh-Oleh
Kini, Gipang tidak hanya bisa dinikmati saat Lebaran saja. Banyak produsen lokal di Cilegon yang terus memproduksi gipang dan menjadikannya sebagai identitas kuliner Cilegon. Kemasannya pun kini semakin modern dan praktis, sehingga sangat cocok dijadikan buah tangan bagi siapa saja yang berkunjung ke kota baja ini.

Bagi warga banten, mencicipi sepotong gipang layaknya mengingat kembali manisnya kenangan masa kecil.`,
    status: "published",
    coverImage: "https://i.ibb.co.com/V0chxYHg/image.png",
  },
  {
    title: "3 Alasan Kenapa Gipang Cilegon Adalah Teman Ngopi Terbaik",
    slug: "alasan-gipang-teman-ngopi",
    excerpt:
      "Lupakan biskuit atau kue kering biasa. Jika Anda belum pernah memadukan kopi hitam hangat dengan renyahnya Gipang Cilegon, Anda melewatkan sensasi ngopi yang luar biasa.",
    content: `Bagi pecinta kopi, mencari camilan pendamping yang pas adalah sebuah keharusan. Biskuit atau bolu mungkin sudah biasa. Namun, pernahkah Anda mencoba memadukan kopi favorit Anda dengan sepotong Gipang Cilegon?

Berikut adalah 3 alasan mengapa Gipang merupakan teman sejati secangkir kopi:

### 1. Kontras Rasa yang Sempurna
Rasa pahit dari kopi hitam akan langsung dinetralkan oleh rasa manis karamel dari gipang. Perpaduan pahit dan manis legit ini akan menciptakan harmoni rasa yang memanjakan lidah Anda di setiap sesapannya.

### 2. Tekstur Renyah yang Menggugah Selera
Tekstur gipang yang lengket namun super renyah memberikan dimensi baru saat Anda menikmati kopi. Sensasi *crunchy* ini membuat momen bersantai terasa tidak membosankan.

### 3. Mengenyangkan Tapi Ringan
Terbuat dari beras ketan, gipang cukup memberikan rasa kenyang ringan yang pas untuk mengganjal perut di sore atau pagi hari, tanpa membuat Anda merasa terlalu begah.

Jadi, tunggu apa lagi? Seduh kopi Anda sekarang dan temani dengan renyahnya Gipang Cilegon.`,
    status: "published",
    coverImage: "https://i.ibb.co.com/6R11ZbwR/image.png",
  },
  {
    title: "Tips Menyimpan Gipang Agar Tetap Renyah Tahan Lama",
    slug: "tips-simpan-gipang",
    excerpt:
      "Pernah mengalami gipang menjadi alot setelah beberapa hari? Ikuti tips praktis berikut ini untuk menjaga tekstur gipang Anda agar selalu renyah seperti baru dibeli.",
    content: `Gipang dikenal dengan teksturnya yang sangat renyah. Namun, karena terbuat dari gula karamel dan beras ketan, gipang sangat rentan terhadap udara lembab yang bisa membuatnya menjadi alot atau melempem.

Untuk menjaga gipang Anda tetap *crunchy* dan enak dinikmati kapan saja, ikuti tips penyimpanan berikut:

- **Masukkan ke Wadah Kedap Udara:** Segera pindahkan gipang yang sudah terbuka dari plastiknya ke dalam stoples kaca atau plastik yang memiliki tutup kedap udara (*airtight*). Udara adalah musuh utama kerenyahan gipang.
- **Simpan di Suhu Ruang yang Sejuk:** Hindari menyimpan gipang di tempat yang terkena sinar matahari langsung atau ruangan yang terlalu panas, karena dapat membuat karamelnya sedikit meleleh dan lengket.
- **Jangan Simpan di Kulkas:** Walaupun kulkas dingin, kelembabannya dapat mengubah tekstur gipang menjadi keras membatu dan menghilangkan kelezatan aslinya.
- **Ambil Secukupnya:** Saat ingin ngemil, ambil gipang secukupnya lalu segera tutup kembali stoplesnya rapat-rapat.

Dengan mengikuti cara di atas, gipang andalan Anda akan siap sedia menemani hari-hari Anda dengan kerenyahan yang maksimal!`,
    status: "published",
    coverImage: "https://i.ibb.co.com/cSGgfcnd/image.png",
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
