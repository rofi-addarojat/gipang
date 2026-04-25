import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
      } catch (err: any) {
        if (err?.message?.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
        } else {
           console.error(err);
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Articles</h2>
        <Link to="/admin/articles/new" className="bg-accent text-white px-4 py-2 rounded">New Article</Link>
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
            {articles.map(article => (
              <tr key={article.id} className="border-b">
                <td className="p-3">{article.title}</td>
                <td className="p-3">{article.status}</td>
                <td className="p-3">{new Date(article.createdAt).toLocaleDateString()}</td>
                <td className="p-3 space-x-2">
                  <Link to={`/admin/articles/edit/${article.id}`} className="text-blue-500 hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
