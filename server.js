import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'pphdt';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Helia183@';
const DB_NAME = process.env.DB_NAME || 'music_app';

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log('REQUEST', req.method, req.originalUrl, 'BODY:', JSON.stringify(req.body));
  next();
});

const apiRouter = express.Router();
app.use('/api', apiRouter);

let db;

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await connection.query(`USE \`${DB_NAME}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500),
      role ENUM('customer', 'staff', 'vendor') NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await connection.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE');
  } catch (error) {
    // Column already exists, ignore
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email_or_phone VARCHAR(255) NOT NULL UNIQUE,
      otp VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id VARCHAR(255) NOT NULL,
      item_type ENUM('song', 'album') NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_item_unique (user_id, item_id, item_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id VARCHAR(255) NOT NULL,
      item_type ENUM('song', 'album') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_wishlist_unique (user_id, item_id, item_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'processing', 'completed', 'cancelled', 'refund_requested') NOT NULL DEFAULT 'pending',
      payment_method ENUM('card', 'ewallet') NOT NULL,
      can_cancel BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id VARCHAR(255) NOT NULL,
      item_type ENUM('song', 'album') NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  return connection;
}

const init = async () => {
  try {
    db = await initializeDatabase();
    console.log('Connected to MySQL database and initialized schema');

    // Ensure phone column exists and is properly set up
    try {
      await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE');
      console.log('Added phone column to users table');
    } catch (error) {
      // Column already exists
    }

    // Create default staff/admin user
    const [existingStaff] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      ['staff@example.com']
    );
    if (!Array.isArray(existingStaff) || existingStaff.length === 0) {
      await db.query(
        'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['staff@example.com', 'staff123', 'Admin Staff', '0987654321', 'staff']
      );
      console.log('Created default staff user: staff@example.com / staff123');
    }

    apiRouter.post('/auth/register', async (req, res) => {
      const { email, password, name, phone } = req.body;
      if (!email || !password || !name || !phone) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
      }

      const normalizedEmail = email.toLowerCase();
      const [existing] = await db.query(
        'SELECT id FROM users WHERE email = ? OR phone = ?',
        [normalizedEmail, phone]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(409).json({ error: 'Email hoặc số điện thoại đã được sử dụng' });
      }

      const [result] = await db.query(
        'INSERT INTO users (email, password, name, address, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [normalizedEmail, password, name, '', phone, 'customer']
      );

      const [newUserRows] = await db.query(
        'SELECT id, email, name, phone, role FROM users WHERE id = ?',
        [result.insertId]
      );
      return res.status(201).json(newUserRows[0]);
    });

    apiRouter.post('/auth/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' });
      }

      const [rows] = await db.query(
        'SELECT id, email, name, phone, role FROM users WHERE email = ? AND password = ?',
        [email.toLowerCase(), password]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows[0]);
      }

      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    });

    apiRouter.post('/auth/password-reset/request', async (req, res) => {
      const { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ error: 'Thiếu email hoặc số điện thoại' });
      }

      const normalizedIdentifier = identifier.includes('@') ? identifier.toLowerCase() : identifier;
      const [users] = await db.query(
        'SELECT id FROM users WHERE email = ? OR phone = ?',
        [normalizedIdentifier, normalizedIdentifier]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.query(
        `INSERT INTO password_reset_tokens (email_or_phone, otp, expires_at, verified)
         VALUES (?, ?, ?, false)
         ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at), verified = VALUES(verified)`,
        [normalizedIdentifier, otp, expiresAt]
      );

      return res.json({ success: true });
    });

    apiRouter.post('/auth/password-reset/verify', async (req, res) => {
      const { identifier, otp } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({ error: 'Thiếu mã xác nhận hoặc thông tin' });
      }

      const normalizedIdentifier = identifier.includes('@') ? identifier.toLowerCase() : identifier;
      const [rows] = await db.query(
        'SELECT id FROM password_reset_tokens WHERE email_or_phone = ? AND otp = ? AND expires_at > NOW()',
        [normalizedIdentifier, otp]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'OTP không hợp lệ hoặc đã hết hạn' });
      }

      await db.query(
        'UPDATE password_reset_tokens SET verified = TRUE WHERE email_or_phone = ? AND otp = ?',
        [normalizedIdentifier, otp]
      );

      return res.json({ success: true });
    });

    apiRouter.post('/auth/password-reset/confirm', async (req, res) => {
      const { identifier, otp, newPassword } = req.body;
      if (!identifier || !otp || !newPassword) {
        return res.status(400).json({ error: 'Thiếu thông tin xác nhận mật khẩu mới' });
      }

      const normalizedIdentifier = identifier.includes('@') ? identifier.toLowerCase() : identifier;
      const [rows] = await db.query(
        'SELECT id FROM password_reset_tokens WHERE email_or_phone = ? AND otp = ? AND verified = TRUE AND expires_at > NOW()',
        [normalizedIdentifier, otp]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'OTP chưa được xác thực hoặc đã hết hạn' });
      }

      await db.query(
        'UPDATE users SET password = ? WHERE email = ? OR phone = ?',
        [newPassword, normalizedIdentifier, normalizedIdentifier]
      );
      await db.query('DELETE FROM password_reset_tokens WHERE email_or_phone = ?', [normalizedIdentifier]);

      return res.json({ success: true });
    });

    apiRouter.get('/cart', async (req, res) => {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'Thiếu userId' });
      }

      const [rows] = await db.query(
        'SELECT item_id AS id, item_type AS type, quantity FROM carts WHERE user_id = ?',
        [Number(userId)]
      );
      return res.json(rows);
    });

    apiRouter.post('/cart', async (req, res) => {
      const { userId, itemId, type } = req.body;
      if (!userId || !itemId || !type) {
        return res.status(400).json({ error: 'Thiếu dữ liệu giỏ hàng' });
      }

      await db.query(
        'INSERT INTO carts (user_id, item_id, item_type, quantity) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
        [Number(userId), itemId, type]
      );

      const [rows] = await db.query('SELECT item_id AS id, item_type AS type, quantity FROM carts WHERE user_id = ?', [Number(userId)]);
      return res.json(rows);
    });

    apiRouter.delete('/cart/:itemId', async (req, res) => {
      const { userId } = req.query;
      const { itemId } = req.params;
      if (!userId || !itemId) {
        return res.status(400).json({ error: 'Thiếu dữ liệu xóa giỏ hàng' });
      }

      await db.query('DELETE FROM carts WHERE user_id = ? AND item_id = ?', [Number(userId), itemId]);
      const [rows] = await db.query('SELECT item_id AS id, item_type AS type, quantity FROM carts WHERE user_id = ?', [Number(userId)]);
      return res.json(rows);
    });

    apiRouter.delete('/cart/clear', async (req, res) => {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'Thiếu userId' });
      }

      await db.query('DELETE FROM carts WHERE user_id = ?', [Number(userId)]);
      return res.json([]);
    });

    apiRouter.get('/wishlist', async (req, res) => {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'Thiếu userId' });
      }

      const [rows] = await db.query(
        'SELECT item_id AS id, item_type AS type FROM wishlists WHERE user_id = ?',
        [Number(userId)]
      );
      return res.json(rows);
    });

    apiRouter.post('/wishlist', async (req, res) => {
      const { userId, itemId, type } = req.body;
      if (!userId || !itemId || !type) {
        return res.status(400).json({ error: 'Thiếu dữ liệu wishlist' });
      }

      await db.query(
        'INSERT IGNORE INTO wishlists (user_id, item_id, item_type) VALUES (?, ?, ?)',
        [Number(userId), itemId, type]
      );
      const [rows] = await db.query('SELECT item_id AS id, item_type AS type FROM wishlists WHERE user_id = ?', [Number(userId)]);
      return res.json(rows);
    });

    apiRouter.delete('/wishlist/:itemId', async (req, res) => {
      const { userId } = req.query;
      const { itemId } = req.params;
      if (!userId || !itemId) {
        return res.status(400).json({ error: 'Thiếu dữ liệu xóa wishlist' });
      }

      await db.query('DELETE FROM wishlists WHERE user_id = ? AND item_id = ?', [Number(userId), itemId]);
      const [rows] = await db.query('SELECT item_id AS id, item_type AS type FROM wishlists WHERE user_id = ?', [Number(userId)]);
      return res.json(rows);
    });

    apiRouter.post('/orders', async (req, res) => {
      const { userId, paymentMethod, total, items } = req.body;
      if (!userId || !paymentMethod || !total || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Thiếu dữ liệu đơn hàng' });
      }

      const [orderResult] = await db.query(
        'INSERT INTO orders (user_id, total, payment_method, status, can_cancel) VALUES (?, ?, ?, ?, ?)',
        [Number(userId), Number(total), paymentMethod, 'pending', true]
      );

      const orderId = orderResult.insertId;
      const itemValues = items.flatMap(item => [orderId, item.id, item.type, item.quantity, item.price]);
      const placeholder = items.map(() => '(?, ?, ?, ?, ?)').join(', ');
      await db.query(
        `INSERT INTO order_items (order_id, item_id, item_type, quantity, price) VALUES ${placeholder}`,
        itemValues
      );

      await db.query('DELETE FROM carts WHERE user_id = ?', [Number(userId)]);
      const [rows] = await db.query(
        'SELECT id, user_id AS userId, total, status, payment_method AS paymentMethod, can_cancel AS canCancel, created_at AS date FROM orders WHERE id = ?',
        [orderId]
      );
      const orderRow = rows[0];

      const [orderItems] = await db.query(
        'SELECT item_id AS id, item_type AS type, quantity, price FROM order_items WHERE order_id = ?',
        [orderId]
      );

      const formattedOrder = {
        ...orderRow,
        total: Number(orderRow.total),
        canCancel: Boolean(orderRow.canCancel),
        items: orderItems.map((item) => ({
          ...item,
          price: Number(item.price)
        }))
      };

      return res.status(201).json(formattedOrder);
    });

    apiRouter.get('/orders', async (req, res) => {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'Thiếu userId' });
      }

      const [orderRows] = await db.query(
        'SELECT id, user_id AS userId, total, status, payment_method AS paymentMethod, can_cancel AS canCancel, created_at AS date FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [Number(userId)]
      );

      const orderIds = orderRows.map(order => order.id);
      if (orderIds.length === 0) {
        return res.json([]);
      }

      const [itemRows] = await db.query(
        `SELECT order_id, item_id AS id, item_type AS type, quantity, price FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );

      const orders = orderRows.map(order => ({
        ...order,
        total: Number(order.total),
        canCancel: Boolean(order.canCancel),
        items: []
      }));
      itemRows.forEach(item => {
        const order = orders.find(o => o.id === item.order_id);
        if (order) {
          order.items.push({
            id: item.id,
            type: item.type,
            quantity: item.quantity,
            price: Number(item.price)
          });
        }
      });

      return res.json(orders);
    });

    apiRouter.put('/orders/:orderId/cancel', async (req, res) => {
      const { userId } = req.body;
      const { orderId } = req.params;
      if (!userId || !orderId) {
        return res.status(400).json({ error: 'Thiếu dữ liệu hủy đơn hàng' });
      }

      await db.query(
        'UPDATE orders SET status = ?, can_cancel = ? WHERE id = ? AND user_id = ? AND status = ?',
        ['cancelled', false, Number(orderId), Number(userId), 'pending']
      );
      return res.json({ success: true });
    });

    apiRouter.put('/orders/:orderId/refund', async (req, res) => {
      const { userId } = req.body;
      const { orderId } = req.params;
      if (!userId || !orderId) {
        return res.status(400).json({ error: 'Thiếu dữ liệu hoàn tiền' });
      }

      await db.query(
        'UPDATE orders SET status = ? WHERE id = ? AND user_id = ? AND status = ?',
        ['refund_requested', Number(orderId), Number(userId), 'completed']
      );
      return res.json({ success: true });
    });

    const routePaths = app._router?.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: layer.route.methods })) || [];
    console.log('Registered routes:', routePaths);

    app.use((req, res) => {
      res.status(404).json({ error: `Không tìm thấy ${req.method} ${req.originalUrl}` });
    });

    app.use((err, req, res, next) => {
      console.error('SERVER ERROR', err);
      res.status(500).json({ error: 'Lỗi server nội bộ' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

init();