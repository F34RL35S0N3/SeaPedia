'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState({ reviewerName: '', rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reviews', form);
      toast.success('Review submitted!');
      setForm({ reviewerName: '', rating: 5, comment: '' });
      fetchReviews();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to submit review');
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">SEAPEDIA</h1>
        <p className="text-xl mb-8">Marketplace yang menghubungkan Pembeli, Penjual, dan Pengemudi</p>
        <Button size="lg" variant="secondary" onClick={() => window.location.href = '/products'}>
          Jelajahi Produk
        </Button>
      </section>

      <section className="max-w-7xl mx-auto px-4 w-full grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader><CardTitle>Untuk Pembeli</CardTitle></CardHeader>
          <CardContent>Temukan berbagai produk menarik dari berbagai toko dengan sistem keranjang yang mudah.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Untuk Penjual</CardTitle></CardHeader>
          <CardContent>Buka toko Anda sendiri dan kelola produk serta pesanan dengan dashboard interaktif.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Untuk Pengemudi</CardTitle></CardHeader>
          <CardContent>Ambil pekerjaan pengiriman dan dapatkan penghasilan dari setiap pesanan yang diantar.</CardContent>
        </Card>
      </section>

      <section className="max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Ulasan Pengguna</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map(r => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{r.reviewerName}</span>
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{r.comment}</p>
                <small className="text-gray-500 mt-2 block">{new Date(r.createdAt).toLocaleDateString()}</small>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader><CardTitle>Tulis Ulasan</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitReview} className="space-y-4">
              <Input placeholder="Nama Anda" value={form.reviewerName} onChange={e => setForm({...form, reviewerName: e.target.value})} required />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Bintang</option>)}
              </select>
              <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Komentar Anda..." value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} required />
              <Button type="submit" className="w-full">Kirim Ulasan</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
