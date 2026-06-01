import '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: number; role: 'admin' | 'customer' }; // payload type is used for signing and verifying
    user: {
      id: number;
      role: 'admin' | 'customer';
    }; // user type is return type of `request.user` object
  }
}
