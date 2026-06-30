import { Router } from 'express';
import { register, login, selectRole, logout, me } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { createStore, getMyStore, updateStore, getStoreById } from '../controllers/store.controller';
import { createProduct, getMyProducts, updateProduct, deleteProduct, getProducts, getProductById } from '../controllers/product.controller';
import { getWallet, topUpWallet } from '../controllers/wallet.controller';
import { addToCart, getCart, removeFromCart } from '../controllers/cart.controller';
import { checkout, getMyOrders } from '../controllers/order.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/select-role', verifyToken, selectRole);
router.post('/auth/logout', verifyToken, logout);
router.get('/auth/me', verifyToken, me);

// Buyer Wallet & Cart
router.get('/wallet', verifyToken, requireRole('BUYER'), getWallet);
router.post('/wallet/topup', verifyToken, requireRole('BUYER'), topUpWallet);

router.get('/cart', verifyToken, requireRole('BUYER'), getCart);
router.post('/cart', verifyToken, requireRole('BUYER'), addToCart);
router.delete('/cart/:id', verifyToken, requireRole('BUYER'), removeFromCart);
router.post('/checkout', verifyToken, requireRole('BUYER'), checkout);
router.get('/orders/my', verifyToken, requireRole('BUYER'), getMyOrders);

// Store (Seller only for management)
router.post('/stores', verifyToken, requireRole('SELLER'), createStore);
router.get('/stores/my', verifyToken, requireRole('SELLER'), getMyStore);
router.put('/stores/my', verifyToken, requireRole('SELLER'), updateStore);
router.get('/stores/:id', getStoreById);

// Products
router.post('/products', verifyToken, requireRole('SELLER'), createProduct);
router.get('/products/my', verifyToken, requireRole('SELLER'), getMyProducts);
router.put('/products/:id', verifyToken, requireRole('SELLER'), updateProduct);
router.delete('/products/:id', verifyToken, requireRole('SELLER'), deleteProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Reviews
router.post('/reviews', (req, res, next) => { verifyToken(req, res, (err) => { if (err) return next(); next(); }); }, createReview);
router.get('/reviews', getReviews);

// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default router;
