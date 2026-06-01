import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import 'dotenv/config';
import router from './routes';
import './types/fastify.d'; // Ensure types are loaded

const fastify = Fastify({
  logger: true,
});

// Register JWT Plugin
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecret_fallback_key',
});

// Add authenticate decorator
fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Register API Routes
fastify.register(router);

// Health check route
fastify.get('/ping', async (request, reply) => {
  return { status: 'OK' };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
