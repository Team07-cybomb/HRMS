const Team = require('../models/Team.js');

// GET all teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new team
exports.createTeam = async (req, res) => {
  try {
    const { name, lead, department, location, budget, status, members } = req.body;

    // Check if team already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ error: 'Team already exists' });
    }

    const newTeam = new Team({
      name,
      lead,
      department,
      location,
      budget: budget || '',
      status: status || 'active',
      members: members || []
    });

    await newTeam.save();
    res.status(201).json({ 
      team: newTeam,
      message: `Team "${name}" created successfully` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE team
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    Object.keys(updateData).forEach(key => {
      team[key] = updateData[key];
    });
    team.updatedAt = Date.now();

    await team.save();
    res.json({ 
      team,
      message: `Team "${team.name}" updated successfully` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE team
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: `Team "${team.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD member to team
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.members.includes(employeeId)) {
      return res.status(400).json({ error: 'Employee already in team' });
    }

    team.members.push(employeeId);
    team.updatedAt = Date.now();
    await team.save();

    res.json({ 
      team,
      message: 'Member added to team successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE member from team
exports.removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    team.members = team.members.filter(member => member !== employeeId);
    team.updatedAt = Date.now();
    await team.save();

    res.json({ 
      team,
      message: 'Member removed from team successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};