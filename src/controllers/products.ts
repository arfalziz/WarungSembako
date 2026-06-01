import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, like, and } from 'drizzle-orm';

export const productRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/products - Public
  fastify.get('/', async (request, reply) => {
    try {
      const { search, category } = request.query as any;

      let filters = [];
      if (search) {
        filters.push(like(products.nama_produk, `%${search}%`));
      }
      if (category) {
        filters.push(eq(products.kategori, category));
      }

      let query = db.select().from(products);
      
      if (filters.length > 0) {
        const result = await db.select().from(products).where(and(...filters));
        return reply.send(result);
      } else {
        const result = await db.select().from(products);
        return reply.send(result);
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // GET /api/v1/products/:id - Public
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const productId = parseInt(id, 10);

      const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

      if (!product) {
        return reply.status(404).send({ error: 'Produk tidak ditemukan' });
      }

      return reply.send(product);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // POST /api/v1/products - Admin Only
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Akses ditolak: Hanya admin yang dapat menambah produk' });
      }

      const { nama_produk, kategori, harga, stok, foto_produk } = request.body as any;

      if (!nama_produk || !kategori || harga === undefined || stok === undefined) {
        return reply.status(400).send({ error: 'Nama, kategori, harga, dan stok wajib diisi' });
      }

      if (stok < 0) {
        return reply.status(400).send({ error: 'Stok tidak boleh bernilai minus' });
      }

      const [result] = await db.insert(products).values({
        nama_produk,
        kategori,
        harga,
        stok,
        foto_produk,
      });

      return reply.status(201).send({ message: 'Produk berhasil ditambahkan', productId: result.insertId });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // PUT /api/v1/products/:id - Admin Only
  fastify.put('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Akses ditolak: Hanya admin yang dapat mengubah produk' });
      }

      const { id } = request.params as { id: string };
      const productId = parseInt(id, 10);
      const { nama_produk, kategori, harga, stok, foto_produk } = request.body as any;

      if (stok !== undefined && stok < 0) {
        return reply.status(400).send({ error: 'Stok tidak boleh bernilai minus' });
      }

      // Check if product exists
      const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!existing) {
        return reply.status(404).send({ error: 'Produk tidak ditemukan' });
      }

      const updateData: any = {};
      if (nama_produk) updateData.nama_produk = nama_produk;
      if (kategori) updateData.kategori = kategori;
      if (harga !== undefined) updateData.harga = harga;
      if (stok !== undefined) updateData.stok = stok;
      if (foto_produk !== undefined) updateData.foto_produk = foto_produk;

      await db.update(products).set(updateData).where(eq(products.id, productId));

      return reply.send({ message: 'Produk berhasil diperbarui' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // DELETE /api/v1/products/:id - Admin Only
  fastify.delete('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Akses ditolak: Hanya admin yang dapat menghapus produk' });
      }

      const { id } = request.params as { id: string };
      const productId = parseInt(id, 10);

      const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!existing) {
        return reply.status(404).send({ error: 'Produk tidak ditemukan' });
      }

      await db.delete(products).where(eq(products.id, productId));

      return reply.send({ message: 'Produk berhasil dihapus' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });
};
