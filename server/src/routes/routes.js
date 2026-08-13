const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers');

// Health Check
router.get('/health', controllers.getHealth);

// Skills Catalog
router.get('/skills', controllers.getSkills);

// Role Recommendations for a User
router.get('/recommendations/:userId', controllers.getRecommendations);

// Specific Role details
router.get('/roles/:roleId', controllers.getRole);

// Skill gaps for a Role and User
router.get('/roles/:roleId/gaps/:userId', controllers.getRoleGaps);

// Resources teaching skills for a specific Role
router.get('/roles/:roleId/resources', controllers.getRoleResources);

// Career Path traversal from User skills to a Role
router.get('/career-path/:userId/:roleId', controllers.getCareerPath);

// User skill management routes
router.get('/users/:userId/skills', controllers.getUserSkills);
router.post('/users/:userId/skills/:skillId', controllers.addUserSkill);
router.delete('/users/:userId/skills/:skillId', controllers.removeUserSkill);

module.exports = router;

