const express = require('express');
const router = express.Router();

const controller = require('./tasks.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { createTaskSchema, updateTaskSchema, querySchema } = require('./tasks.schema');

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks
 *     description: |
 *       Returns tasks for the authenticated user.
 *       **Admins** see all tasks across all users.
 *       **Users** see only their own tasks.
 *       Supports filtering by status, priority, and keyword search.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search on title and description
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', validate(querySchema, 'query'), controller.getTasks);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Implement Redis caching
 *               description:
 *                 type: string
 *                 example: Add a caching layer for GET /tasks
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 default: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-01"
 *     responses:
 *       201:
 *         description: Task created
 *       422:
 *         description: Validation error
 */
router.post('/', validate(createTaskSchema), controller.createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by ID
 *     description: Users can only access their own tasks. Admins can access any task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: a1b2c3d4-e5f6-...
 *     responses:
 *       200:
 *         description: Task found
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 */
router.get('/:id', controller.getTaskById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     description: Partial updates supported — only provide the fields you want to change.
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       422:
 *         description: Validation error
 */
router.put('/:id', validate(updateTaskSchema), controller.updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     description: Users can only delete their own tasks. Admins can delete any task.
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
 *         description: Task deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 */
router.delete('/:id', controller.deleteTask);

module.exports = router;
