import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const [data, setData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    coverImage: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      getDoc(doc(db, 'articles', id)).then(snap => {
        if (snap.exists()) {
          setData(snap.data() as any);
        }
      });
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title' && isNew) {
      setData(prev => ({
        ...prev,
        [name]: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    } else {
      setData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...data,
        authorId: auth.currentUser?.uid,
        updatedAt: serverTimestamp(),
      };

      if (isNew) {
        await addDoc(collection(db, 'articles'), {
          ...payload,
          createdAt: Date.now() // Just simplifying for the query orderBy constraint
        });
      } else {
        await setDoc(doc(db, 'articles', id!), payload, { merge: true });
      }
      navigate('/admin/articles');
    } catch (err: any) {
      if (err?.message?.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, isNew ? 'articles' : `articles/${id}`);
      } else {
          console.error(err);
          alert('Failed to save');
      }
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">{isNew ? 'New Article' : 'Edit Article'}</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input required className="w-full border p-2 rounded" name="title" value={data.title} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input required className="w-full border p-2 rounded" name="slug" value={data.slug} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea className="w-full border p-2 rounded h-20" name="excerpt" value={data.excerpt} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
          <textarea required className="w-full border p-2 rounded h-64 font-mono text-sm" name="content" value={data.content} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL</label>
          <input className="w-full border p-2 rounded" name="coverImage" value={data.coverImage} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border p-2 rounded" name="status" value={data.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button disabled={saving} type="submit" className="bg-accent text-white px-6 py-2 rounded hover:bg-accent/90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
