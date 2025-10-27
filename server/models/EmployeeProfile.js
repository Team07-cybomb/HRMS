// models/EmployeeProfile.js
const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  instituteName: { type: String, required: true },
  degree: { type: String, required: true },
  specialization: { type: String },
  dateOfCompletion: { type: Date }
});

const workExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date },
  jobDescription: { type: String },
  relevant: { type: Boolean, default: true }
});

const dependentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  dateOfBirth: { type: Date }
});

const identityDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // PAN, Aadhaar, Passport, etc.
  filePath: { type: String },
  uploadDate: { type: Date, default: Date.now },
  fileSize: { type: Number },
  mimeType: { type: String },
  identificationNumber: { type: String } // Store the actual ID number
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  filePath: { type: String },
  uploadDate: { type: Date, default: Date.now },
  fileSize: { type: Number },
  mimeType: { type: String }
});

const employeeProfileSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  
  // Profile Picture
  profilePicture: { type: String },
  
  // Basic Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nickName: { type: String },
  email: { type: String, required: true },
  
  // Work Information
  department: { type: String },
  location: { type: String },
  designation: { type: String },
  zohoRole: { type: String },
  employmentType: { type: String },
  employeeStatus: { type: String, default: 'Active' },
  sourceOfHire: { type: String },
  dateOfJoining: { type: Date },
  totalExperience: { type: String },
  reportingManager: { type: String },
  
  // Personal Details
  dateOfBirth: { type: Date },
  maritalStatus: { type: String },
  aboutMe: { type: String },
  expertise: { type: String },
  
  // Identity Information
  uan: { type: String },
  pan: { type: String },
  aadhaar: { type: String },
  
  // Identity Documents
  identityDocuments: [identityDocumentSchema],
  
  // Contact Details
  workPhone: { type: String },
  extension: { type: String },
  seatingLocation: { type: String },
  tags: [{ type: String }],
  presentAddress: { type: String },
  permanentAddress: { type: String },
  personalMobile: { type: String },
  personalEmail: { type: String },
  
  // Arrays
  education: [educationSchema],
  workExperience: [workExperienceSchema],
  dependents: [dependentSchema],
  documents: [documentSchema],
  
  // System Fields
  addedBy: { type: String },
  addedTime: { type: Date, default: Date.now },
  modifiedBy: { type: String },
  modifiedTime: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
employeeProfileSchema.index({ employeeId: 1 });
employeeProfileSchema.index({ email: 1 });
employeeProfileSchema.index({ department: 1 });
employeeProfileSchema.index({ location: 1 });

// Virtual for full name
employeeProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Ensure virtual fields are serialized
employeeProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);