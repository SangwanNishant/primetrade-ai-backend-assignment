const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().required().messages({
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(2000).trim().allow('').optional().default(''),
  status: Joi.string()
    .valid('todo', 'in_progress', 'done')
    .default('todo')
    .messages({
      'any.only': 'Status must be one of: todo, in_progress, done',
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high',
    }),
  due_date: Joi.string().isoDate().allow(null, '').optional().default(null),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().optional(),
  description: Joi.string().max(2000).trim().allow('').optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  due_date: Joi.string().isoDate().allow(null, '').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const querySchema = Joi.object({
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  search: Joi.string().max(100).trim().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, querySchema };
