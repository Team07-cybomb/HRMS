const express = require('express');
const router = express.Router();
const {
  getAllOnboarding,
  getOnboardingByEmployeeId,
  startOnboarding,
  updateOnboardingStatus,
  completeStep,
  updateStepNotes,
  deleteOnboarding,
  getOnboardingStats
} = require('../controllers/onboardingController');

// Get all onboarding records
router.get('/', getAllOnboarding);

// Get onboarding statistics
router.get('/stats', getOnboardingStats);

// Get onboarding by employee ID
router.get('/:employeeId', getOnboardingByEmployeeId);

// Start new onboarding process
router.post('/', startOnboarding);

// Update onboarding status
router.put('/:employeeId', updateOnboardingStatus);

// Complete a step
router.put('/:employeeId/step', completeStep);

// Update step notes
router.put('/:employeeId/step/:stepId/notes', updateStepNotes);

// Delete onboarding record
router.delete('/:employeeId', deleteOnboarding);

module.exports = router;