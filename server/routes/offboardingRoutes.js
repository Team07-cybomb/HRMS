const express = require('express');
const router = express.Router();
const {
  getAllOffboarding,
  getOffboardingByEmployeeId,
  startOffboarding,
  updateOffboardingStatus,
  completeStep,
  updateStepNotes,
  addAsset,
  returnAsset,
  updateFinalSettlement,
  completeOffboarding,
  deleteOffboarding,
  getOffboardingStats
} = require('../controllers/offboardingController');

// Get all offboarding records
router.get('/', getAllOffboarding);

// Get offboarding statistics
router.get('/stats', getOffboardingStats);

// Get offboarding by employee ID
router.get('/:employeeId', getOffboardingByEmployeeId);

// Start new offboarding process
router.post('/start', startOffboarding);

// Update offboarding status
router.put('/:employeeId/status', updateOffboardingStatus);

// Complete a step
router.put('/:employeeId/complete-step', completeStep);

// Update step notes
router.put('/:employeeId/steps/:stepId/notes', updateStepNotes);

// Add asset to recovery
router.post('/:employeeId/assets', addAsset);

// Mark asset as returned
router.put('/:employeeId/assets/:assetId/return', returnAsset);

// Update final settlement
router.put('/:employeeId/settlement', updateFinalSettlement);

// Complete offboarding process
router.put('/:employeeId/complete', completeOffboarding);

// Delete offboarding record
router.delete('/:employeeId', deleteOffboarding);

module.exports = router;