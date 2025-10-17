const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember
} = require('../controllers/teamController.js');

// GET all teams
router.get('/', getTeams);

// GET single team
router.get('/:id', getTeamById);

// CREATE new team
router.post('/', createTeam);

// UPDATE team
router.put('/:id', updateTeam);

// DELETE team
router.delete('/:id', deleteTeam);

// ADD member to team
router.post('/:id/members', addMember);

// REMOVE member from team
router.delete('/:id/members', removeMember);

module.exports = router;