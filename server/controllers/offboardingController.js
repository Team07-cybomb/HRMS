const Offboarding = require('../models/offboardingModel');
const Employee = require('../models/Employee');

// Get all offboarding records
const getAllOffboarding = async (req, res) => {
  try {
    const offboardingRecords = await Offboarding.find().sort({ createdAt: -1 });
    res.json(offboardingRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get offboarding by employee ID
const getOffboardingByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const offboarding = await Offboarding.findOne({ employeeId });
    
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }
    
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start new offboarding process
const startOffboarding = async (req, res) => {
  try {
    const { employeeId, lastWorkingDay, reason, assignedTo, notes } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if offboarding already exists for this employee
    const existingOffboarding = await Offboarding.findOne({ employeeId });
    if (existingOffboarding) {
      return res.status(400).json({ error: 'Offboarding process already exists for this employee' });
    }

    // Initialize steps
    const steps = Offboarding.initializeSteps(assignedTo);

    // Create new offboarding record
    const offboarding = new Offboarding({
      employeeId,
      name: employee.name,
      email: employee.email,
      position: employee.designation || employee.position,
      department: employee.department,
      startDate: new Date(),
      lastWorkingDay,
      reason,
      assignedTo,
      steps,
      notes,
      status: 'in-progress',
      progress: 0,
      currentStep: 'Resignation/Termination',
      completedSteps: 0,
      totalSteps: steps.length,
      finalSettlement: {
        lastSalary: employee.salary || 0,
        pendingLeaves: employee.pendingLeaves || 0
      }
    });

    await offboarding.save();
    
    // Update employee status
    await Employee.findOneAndUpdate(
      { employeeId }, 
      { status: 'offboarding' }
    );

    res.status(201).json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update offboarding status
const updateOffboardingStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, notes } = req.body;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    offboarding.status = status;
    if (notes) offboarding.notes = notes;
    offboarding.updatedAt = new Date();

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete a step
const completeStep = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { stepId, notes } = req.body;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    // Find the step
    const step = offboarding.steps.find(s => s.stepId === stepId);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Update step
    step.completed = true;
    step.completedAt = new Date();
    if (notes) step.notes = notes;

    // Save and let pre-save middleware handle progress calculation
    await offboarding.save();
    
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update step notes
const updateStepNotes = async (req, res) => {
  try {
    const { employeeId, stepId } = req.params;
    const { notes } = req.body;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    const step = offboarding.steps.find(s => s.stepId === parseInt(stepId));
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    step.notes = notes;
    await offboarding.save();

    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add asset to recovery list
const addAsset = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const assetData = req.body;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    offboarding.assets.push({
      ...assetData,
      returnedDate: null
    });

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark asset as returned
const returnAsset = async (req, res) => {
  try {
    const { employeeId, assetId } = req.params;
    const { condition, notes } = req.body;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    const asset = offboarding.assets.id(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    asset.returnedDate = new Date();
    asset.condition = condition;
    if (notes) asset.notes = notes;

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update final settlement
const updateFinalSettlement = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const settlementData = req.body;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    offboarding.finalSettlement = {
      ...offboarding.finalSettlement,
      ...settlementData
    };

    // Recalculate settlement
    offboarding.calculateFinalSettlement();

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete offboarding process
const completeOffboarding = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const offboarding = await Offboarding.findOne({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    // Mark all steps as completed
    offboarding.steps.forEach(step => {
      if (!step.completed) {
        step.completed = true;
        step.completedAt = new Date();
      }
    });

    offboarding.status = 'completed';
    offboarding.progress = 100;

    await offboarding.save();

    // Update employee status to inactive
    await Employee.findOneAndUpdate(
      { employeeId }, 
      { 
        status: 'inactive',
        exitDate: new Date()
      }
    );

    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete offboarding record
const deleteOffboarding = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const offboarding = await Offboarding.findOneAndDelete({ employeeId });
    if (!offboarding) {
      return res.status(404).json({ error: 'Offboarding record not found' });
    }

    res.json({ message: 'Offboarding record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get offboarding statistics
const getOffboardingStats = async (req, res) => {
  try {
    const total = await Offboarding.countDocuments();
    const inProgress = await Offboarding.countDocuments({ status: 'in-progress' });
    const completed = await Offboarding.countDocuments({ status: 'completed' });
    const onHold = await Offboarding.countDocuments({ status: 'on-hold' });
    const pendingFinal = await Offboarding.countDocuments({ status: 'pending-final' });

    // Calculate average duration for completed offboardings
    const completedOffboardings = await Offboarding.find({ status: 'completed' });
    const avgDuration = completedOffboardings.length > 0 
      ? completedOffboardings.reduce((acc, curr) => {
          const duration = Math.ceil((new Date(curr.updatedAt) - new Date(curr.createdAt)) / (1000 * 60 * 60 * 24));
          return acc + duration;
        }, 0) / completedOffboardings.length
      : 0;

    res.json({
      total,
      inProgress,
      completed,
      onHold,
      pendingFinal,
      avgDuration: Math.round(avgDuration)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};