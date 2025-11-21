'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token && role === 'SHOP') {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="container">
      <p>Loading...</p>
    </div>
  );
}

