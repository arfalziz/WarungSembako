import Fastify from 'fastify';
import 'dotenv/config';

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async (request, reply) => {
  return { message: 'Server is running!' };
});

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
