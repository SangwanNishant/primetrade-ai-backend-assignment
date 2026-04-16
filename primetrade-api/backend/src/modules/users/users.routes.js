const express = require('express');
const router = express.Router();

const controller = require('./users.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users (Admin)]
 *     summary: List all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All registered users
 *       403:
 *         description: Admin access required
 */
router.get('/', controller.getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users (Admin)]
 *     summary: Get user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', controller.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}/role:
 *   patch:
 *     tags: [Users (Admin)]
 *     summary: Update user role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', controller.updateUserRole);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users (Admin)]
 *     summary: Delete user (Admin only)
 *     description: Deletes a user and all their tasks (cascade). Cannot delete own account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', controller.deleteUser);

module.exports = router;
