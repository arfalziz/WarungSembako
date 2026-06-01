import { mysqlTable, int, varchar, timestamp, mysqlEnum, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'customer']).default('customer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable('products', {
  id: int('id').autoincrement().primaryKey(),
  nama_produk: varchar('nama', { length: 255 }).notNull(),
  kategori: varchar('kategori', { length: 255 }).notNull(),
  harga: int('harga').notNull(),
  stok: int('stok').notNull(),
  foto_produk: text('foto'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable('orders', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id).notNull(),
  totalHarga: int('total_harga').notNull(),
  status: mysqlEnum('status', ['pending', 'diproses', 'selesai']).default('pending').notNull(),
  buktiPembayaran: text('bukti_pembayaran'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable('order_items', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').references(() => orders.id).notNull(),
  productId: int('product_id').references(() => products.id).notNull(),
  jumlah: int('jumlah').notNull(),
  hargaSatuan: int('harga_satuan').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
