const Employee = require("../models/Employee");
const EmployeeSalary = require("../models/EmployeeSalary");
const Payroll = require("../models/Payroll");

// Get all employees with their salary info
const getEmployeesWithSalary = async (req, res) => {
  try {
    const employees = await Employee.find({ status: "active" });

    const employeesWithSalary = await Promise.all(
      employees.map(async (employee) => {
        const salaryInfo = await EmployeeSalary.findOne({
          employeeId: employee.employeeId,
        }).sort({ effectiveFrom: -1 });

        const basicSalary = salaryInfo?.basicSalary || 0;
        const allowances = salaryInfo?.allowances || 0;
        const deductions = salaryInfo?.deductions || 0;
        const netPay = basicSalary + allowances - deductions;

        return {
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          employmentType: employee.employmentType,
          status: employee.status,
          location: employee.location,
          dateOfJoining: employee.dateOfJoining,
          totalExperience: employee.totalExperience,
          basicSalary: basicSalary,
          allowances: allowances,
          deductions: deductions,
          netPay: netPay,
        };
      })
    );

    res.json(employeesWithSalary);
  } catch (error) {
    console.error("Error in getEmployeesWithSalary:", error);
    res.status(500).json({ message: error.message });
  }
};

// Run payroll for a specific month
const runPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const employees = await Employee.find({ status: "active" });
    const payrollResults = [];

    for (const employee of employees) {
      const salaryInfo = await EmployeeSalary.findOne({
        employeeId: employee.employeeId,
      }).sort({ effectiveFrom: -1 });

      if (salaryInfo) {
        const basicSalary = salaryInfo.basicSalary;
        const allowances = salaryInfo.allowances;
        const deductions = salaryInfo.deductions;
        const netPay = basicSalary + allowances - deductions;

        const existingPayroll = await Payroll.findOne({
          employeeId: employee.employeeId,
          month,
          year,
        });

        if (!existingPayroll) {
          const payroll = new Payroll({
            employeeId: employee.employeeId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            netPay,
          });

          await payroll.save();
          payrollResults.push(payroll);
        } else {
          payrollResults.push(existingPayroll);
        }
      }
    }

    res.json({
      message: `Payroll processed for ${month} ${year}`,
      payrolls: payrollResults,
      totalEmployees: employees.length,
      processedEmployees: payrollResults.length,
    });
  } catch (error) {
    console.error("Error in runPayroll:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get payroll history (all months with payroll)
const getPayrollHistory = async (req, res) => {
  try {
    const payrollHistory = await Payroll.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 },
          totalNetPay: { $sum: "$netPay" },
          processedDate: { $max: "$createdAt" },
        },
      },
      {
        $sort: { processedDate: -1 },
      },
    ]);

    res.json(payrollHistory || []);
  } catch (error) {
    console.error("Error in getPayrollHistory:", error);
    res.json([]);
  }
};

// Get payroll details for a specific month
const getPayrollByMonth = async (req, res) => {
  try {
    const { month, year } = req.params;

    const payrolls = await Payroll.find({ month, year });

    if (!payrolls || payrolls.length === 0) {
      return res.json([]);
    }

    const payrollsWithEmployeeDetails = await Promise.all(
      payrolls.map(async (payroll) => {
        const employee = await Employee.findOne({
          employeeId: payroll.employeeId,
        });
        return {
          _id: payroll._id,
          employeeId: {
            employeeId: employee?.employeeId,
            name: employee?.name,
            email: employee?.email,
            department: employee?.department,
            designation: employee?.designation,
          },
          month: payroll.month,
          year: payroll.year,
          basicSalary: payroll.basicSalary,
          allowances: payroll.allowances,
          deductions: payroll.deductions,
          netPay: payroll.netPay,
          status: payroll.status,
        };
      })
    );

    res.json(payrollsWithEmployeeDetails);
  } catch (error) {
    console.error("Error in getPayrollByMonth:", error);
    res.json([]);
  }
};

// Update employee salary
const updateEmployeeSalary = async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, effectiveFrom } =
      req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const salaryRecord = new EmployeeSalary({
      employeeId,
      basicSalary: parseFloat(basicSalary),
      allowances: parseFloat(allowances),
      deductions: parseFloat(deductions),
      effectiveFrom: effectiveFrom || new Date(),
    });

    await salaryRecord.save();

    res.json({
      message: "Salary updated successfully",
      salaryRecord,
      employee: {
        name: employee.name,
        department: employee.department,
        designation: employee.designation,
      },
    });
  } catch (error) {
    console.error("Error in updateEmployeeSalary:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get employee salary history
const getEmployeeSalaryHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salaryHistory = await EmployeeSalary.find({ employeeId }).sort({
      effectiveFrom: -1,
    });

    res.json(salaryHistory);
  } catch (error) {
    console.error("Error in getEmployeeSalaryHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

// Generate payslip
const generatePayslip = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    const employee = await Employee.findOne({
      employeeId: payroll.employeeId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const payslipData = {
      employeeName: employee.name,
      employeeId: employee.employeeId,
      department: employee.department,
      designation: employee.designation,
      employmentType: employee.employmentType,
      location: employee.location,
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      netPay: payroll.netPay,
      generatedDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };

    res.json(payslipData);
  } catch (error) {
    console.error("Error in generatePayslip:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployeesWithSalary,
  runPayroll,
  getPayrollHistory,
  getPayrollByMonth,
  updateEmployeeSalary,
  getEmployeeSalaryHistory,
  generatePayslip,
};
