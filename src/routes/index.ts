import { FastifyInstance } from 'fastify';
import { authRoutes } from '../controllers/auth';
import { productRoutes } from '../controllers/products';

export default async function router(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  fastify.register(productRoutes, { prefix: '/api/v1/products' });
  
  // Future route groups can be registered here:
  // fastify.register(orderRoutes, { prefix: '/api/v1/orders' });
}
