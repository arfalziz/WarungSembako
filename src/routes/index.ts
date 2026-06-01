import { FastifyInstance } from 'fastify';
import { authRoutes } from '../controllers/auth';

export default async function router(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  
  // Future route groups can be registered here:
  // fastify.register(productRoutes, { prefix: '/api/v1/products' });
  // fastify.register(orderRoutes, { prefix: '/api/v1/orders' });
}
