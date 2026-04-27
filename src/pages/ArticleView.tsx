import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ArticleView() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const q = query(
          collection(db, "articles"),
          where("slug", "==", slug),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setArticle(snap.docs[0].data());
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    if (slug) loadArticle();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen pt-32 text-center text-xl">Loading...</div>
    );
  if (!article)
    return (
      <div className="min-h-screen pt-32 text-center text-xl">
        Article not found.
      </div>
    );

  return (
    <div className="font-sans min-h-screen bg-gray-50 pb-20">
      <header className="w-full bg-white border-b border-black/5 shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="text-accent font-bold text-lg">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 bg-white p-8 rounded-2xl shadow-sm border border-black/5">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-auto aspect-video object-cover rounded-xl mb-8"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>
        <div className="text-gray-500 mb-8 border-b pb-8 border-gray-100">
          Dipublikasikan pada {new Date(article.createdAt).toLocaleDateString()}
        </div>

        <div
          className="prose prose-lg max-w-none prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
