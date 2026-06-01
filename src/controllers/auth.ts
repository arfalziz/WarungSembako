import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/register', async (request, reply) => {
    try {
      const { nama, email, password } = request.body as any;

      if (!nama || !email || !password) {
        return reply.status(400).send({ error: 'Nama, email, dan password wajib diisi' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert ke database
      const [result] = await db.insert(users).values({
        nama,
        email,
        password: hashedPassword,
        role: 'customer', // default role
      });

      return reply.status(201).send({ message: 'Registrasi berhasil', userId: result.insertId });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.status(409).send({ error: 'Email sudah terdaftar' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as any;

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email dan password wajib diisi' });
      }

      // Cari user berdasarkan email
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = result[0];

      if (!user) {
        return reply.status(401).send({ error: 'Email atau password salah' });
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Email atau password salah' });
      }

      // Generate JWT
      const token = fastify.jwt.sign({ id: user.id, role: user.role });

      return reply.send({ message: 'Login berhasil', token });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Terjadi kesalahan pada server' });
    }
  });

  // Contoh endpoint yang dilindungi (protected)
  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    return { user: request.user };
  });
};
