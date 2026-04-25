import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (userDoc) => {
      setUser(userDoc);
      if (userDoc) {
        if (userDoc.email === 'masroficom@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', userDoc.uid));
            setIsAdmin(adminDoc.exists());
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, 'admins/' + userDoc.uid);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" />;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-accent">CMS Admin</div>
        <nav className="p-4 space-y-2">
          <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50 rounded">Dashboard / Landing Page</Link>
          <Link to="/admin/articles" className="block px-4 py-2 hover:bg-gray-50 rounded">Articles</Link>
          <button onClick={() => auth.signOut()} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded">Logout</button>
        </nav>
      </div>
      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
