const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const tasksRoutes = require('../modules/tasks/tasks.routes');
const usersRoutes = require('../modules/users/users.routes');

const router = express.Router();

/**
 * API Version 1 Router
 * All routes prefixed with /api/v1/
 *
 * Versioning strategy: Run v2 alongside v1 without breaking clients.
 * Deprecation is communicated via Sunset and Deprecation headers.
 */
router.use('/v1/auth', authRoutes);
router.use('/v1/tasks', tasksRoutes);
router.use('/v1/users', usersRoutes);

module.exports = router;
