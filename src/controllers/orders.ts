import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { db } from '../db';
import { orders, orderItems, products } from '../db/schema';
import { eq } from 'drizzle-orm';

export const orderRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/v1/orders - Checkout (Customer)
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { items } = request.body as { items: Array<{ productId: number; jumlah: number }> };

      if (!items || items.length === 0) {
        return reply.status(400).send({ error: 'Daftar produk tidak boleh kosong' });
      }

      const userId = request.user.id;

      // Gunakan transaksi untuk memastikan isolasi stok
      const orderId = await db.transaction(async (tx) => {
        let totalHarga = 0;
        const processedItems = [];

        for (const item of items) {
          // Fetch product data to verify stock and price
          const [product] = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);

          if (!product) {
            throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
          }

          if (product.stok < item.jumlah) {
            throw new Error(`Stok tidak mencukupi untuk produk: ${product.nama_produk}`);
          }

          const hargaSatuan = product.harga;
          totalHarga += hargaSatuan * item.jumlah;

          // Subtract stock
          await tx.update(products)
            .set({ stok: product.stok - item.jumlah })
            .where(eq(products.id, item.productId));

          processedItems.push({
            productId: item.productId,
            jumlah: item.jumlah,
            hargaSatuan,
          });
        }

        // Insert new order
        const [orderResult] = await tx.insert(orders).values({
          userId,
          totalHarga,
          status: 'pending',
        });

        const newOrderId = orderResult.insertId;

        // Insert order items
        for (const pItem of processedItems) {
          await tx.insert(orderItems).values({
            orderId: newOrderId,
            productId: pItem.productId,
            jumlah: pItem.jumlah,
            hargaSatuan: pItem.hargaSatuan,
          });
        }

        return newOrderId;
      });

      return reply.status(201).send({ message: 'Checkout berhasil', orderId });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message || 'Gagal melakukan checkout' });
    }
  });

  // GET /api/v1/orders - Get user order history
  fastify.get('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const result = await db.select().from(orders).where(eq(orders.userId, userId));
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // GET /api/v1/orders/all - Admin Get All Orders
  fastify.get('/all', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Akses ditolak: Hanya admin yang dapat melihat semua pesanan' });
      }

      const result = await db.select().from(orders);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // PUT /api/v1/orders/:id/status - Admin Update Order Status
  fastify.put('/:id/status', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Akses ditolak: Hanya admin yang dapat mengubah status pesanan' });
      }

      const { id } = request.params as { id: string };
      const orderId = parseInt(id, 10);
      const { status } = request.body as { status: 'pending' | 'diproses' | 'selesai' };

      if (!['pending', 'diproses', 'selesai'].includes(status)) {
        return reply.status(400).send({ error: 'Status tidak valid' });
      }

      const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!existing) {
        return reply.status(404).send({ error: 'Pesanan tidak ditemukan' });
      }

      await db.update(orders).set({ status }).where(eq(orders.id, orderId));

      return reply.send({ message: 'Status pesanan berhasil diperbarui' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });
};
