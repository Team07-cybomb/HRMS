import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "../components/ui/use-toast";
import { Badge } from "../components/ui/badge";

const PayrollSection = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPayroll, setCurrentPayroll] = useState([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedMonthHistory, setSelectedMonthHistory] = useState("");
  const [selectedYearHistory, setSelectedYearHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [payrollHistoryLoading, setPayrollHistoryLoading] = useState(false);
  const [generatingPayslip, setGeneratingPayslip] = useState(null);
  const [runPayrollLoading, setRunPayrollLoading] = useState(false);
  const [showPayrollResults, setShowPayrollResults] = useState(false);
  const [payrollResults, setPayrollResults] = useState(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [2023, 2024, 2025];

  // API base URL - change this based on your environment
  const API_BASE =
    process.env.NODE_ENV === "production"
      ? "" // Use relative URLs in production
      : "http://localhost:5000"; // Use absolute URLs in development

  useEffect(() => {
    fetchEmployees();
    fetchPayrollHistory();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/payroll/employees`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data);

      toast({
        title: "Success",
        description: `Loaded ${data.length} employees`,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollHistory = async () => {
    try {
      setPayrollHistoryLoading(true);
      const response = await fetch(`${API_BASE}/api/payroll/history`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPayrollHistory(data || []);
    } catch (error) {
      console.error("Error fetching payroll history:", error);
      setPayrollHistory([]);
    } finally {
      setPayrollHistoryLoading(false);
    }
  };

  const fetchPayrollByMonth = async (month, year) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/payroll/month/${month}/${year}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setCurrentPayroll([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentPayroll(data || []);
      setSelectedMonthHistory(month);
      setSelectedYearHistory(year);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      setCurrentPayroll([]);
    }
  };

  const handleRunPayroll = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: "Error",
        description: "Please select month and year",
        variant: "destructive",
      });
      return;
    }

    const employeesWithoutSalary = employees.filter(
      (emp) =>
        emp.basicSalary === 0 && emp.allowances === 0 && emp.deductions === 0
    );

    if (employeesWithoutSalary.length > 0) {
      toast({
        title: "Warning",
        description: `${employeesWithoutSalary.length} employees have zero salary. Please set salaries first.`,
        variant: "destructive",
      });
      setActiveTab("employees");
      return;
    }

    try {
      setRunPayrollLoading(true);
      const response = await fetch(`${API_BASE}/api/payroll/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPayrollResults(data);
      setShowPayrollResults(true);

      toast({
        title: "Success",
        description: `${data.message} (${data.createdCount} created, ${data.updatedCount} updated)`,
      });

      // Refresh payroll history in background
      fetchPayrollHistory();
    } catch (error) {
      console.error("Error running payroll:", error);
      toast({
        title: "Error",
        description: "Failed to run payroll",
        variant: "destructive",
      });
    } finally {
      setRunPayrollLoading(false);
    }
  };

  const handleUpdateSalary = async (
    employeeId,
    basicSalary,
    allowances,
    deductions
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/payroll/salary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          basicSalary: parseFloat(basicSalary),
          allowances: parseFloat(allowances),
          deductions: parseFloat(deductions),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: `Salary updated for ${data.employee?.name || employeeId}`,
      });

      fetchEmployees();
    } catch (error) {
      console.error("Error updating salary:", error);
      toast({
        title: "Error",
        description: "Failed to update salary",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePayslip = async (payrollId, employeeName) => {
    try {
      setGeneratingPayslip(payrollId);
      const response = await fetch(
        `${API_BASE}/api/payroll/payslip/${payrollId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const payslipData = await response.json();
      generatePDF(payslipData, employeeName);

      toast({
        title: "Success",
        description: "Payslip downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating payslip:", error);
      toast({
        title: "Error",
        description: "Failed to download payslip",
        variant: "destructive",
      });
    } finally {
      setGeneratingPayslip(null);
    }
  };

  const generatePDF = (payslipData, employeeName) => {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text("Cybomb Technologies LLP", 105, 20, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("PAYSLIP", 105, 30, { align: "center" });

    // Add line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    // Employee Details
    doc.setFontSize(10);
    doc.text(`Employee Name: ${payslipData.employeeName}`, 20, 45);
    doc.text(`Employee ID: ${payslipData.employeeId}`, 20, 52);
    doc.text(`Department: ${payslipData.department}`, 20, 59);
    doc.text(`Designation: ${payslipData.designation}`, 20, 66);
    doc.text(`Employment Type: ${payslipData.employmentType}`, 20, 73);
    doc.text(`Location: ${payslipData.location}`, 20, 80);
    doc.text(`Month: ${payslipData.month} ${payslipData.year}`, 20, 87);

    // Add line separator
    doc.line(20, 95, 190, 95);

    // Salary Breakdown - Using "Rs." instead of rupee symbol for PDF compatibility
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("SALARY BREAKDOWN", 20, 105);
    doc.setFont(undefined, "normal");

    doc.setFontSize(10);
    doc.text(
      `Basic Salary: Rs. ${payslipData.basicSalary.toFixed(2)}`,
      30,
      115
    );
    doc.text(`Allowances: Rs. ${payslipData.allowances.toFixed(2)}`, 30, 122);
    doc.text(`Deductions: Rs. ${payslipData.deductions.toFixed(2)}`, 30, 129);

    // Add line for total
    doc.setDrawColor(100, 100, 100);
    doc.line(25, 136, 85, 136);

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`NET PAY: Rs. ${payslipData.netPay.toFixed(2)}`, 30, 145);
    doc.setFont(undefined, "normal");

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${payslipData.generatedDate}`, 20, 160);
    doc.text("This is a computer generated payslip", 105, 170, {
      align: "center",
    });
    doc.text("No signature required", 105, 175, { align: "center" });

    // Save the PDF
    doc.save(
      `payslip-${employeeName}-${payslipData.month}-${payslipData.year}.pdf`
    );
  };

  const handleRunNewPayroll = () => {
    setShowPayrollResults(false);
    setPayrollResults(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage employee salaries and process payroll
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "employees" ? "default" : "outline"}
            onClick={() => setActiveTab("employees")}
            className="px-4 py-2"
          >
            Manage Salaries
          </Button>
          <Button
            variant={activeTab === "run" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("run");
              setShowPayrollResults(false);
              setPayrollResults(null);
            }}
            className="px-4 py-2"
          >
            Run Payroll
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="px-4 py-2"
          >
            Payroll History
          </Button>
        </div>
      </div>

      {activeTab === "employees" && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <span>Manage Employee Salaries</span>
              {!loading && (
                <Badge variant="secondary" className="ml-2">
                  {employees.length} employees
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading employees data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {employees.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Employee ID
                        </TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">
                          Department
                        </TableHead>
                        <TableHead className="font-semibold">
                          Designation
                        </TableHead>
                        <TableHead className="font-semibold">
                          Employment Type
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">
                          Basic Salary (₹)
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Allowances (₹)
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Deductions (₹)
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Net Pay (₹)
                        </TableHead>
                        <TableHead className="font-semibold text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <EmployeeSalaryRow
                          key={employee.employeeId}
                          employee={employee}
                          onUpdateSalary={handleUpdateSalary}
                        />
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-lg">No employees found.</p>
                    <Button onClick={fetchEmployees} variant="outline">
                      Retry Loading Employees
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "run" && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">
              {showPayrollResults ? "Payroll Results" : "Run Payroll"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {showPayrollResults
                ? `Payroll processed for ${selectedMonth} ${selectedYear}`
                : "Process payroll for all active employees for the selected month"}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {!showPayrollResults ? (
              // RUN PAYROLL FORM
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="month" className="text-sm font-medium">
                      Month
                    </Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year
                    </Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleRunPayroll}
                  className="w-full py-3 text-lg font-semibold"
                  disabled={
                    runPayrollLoading ||
                    !selectedMonth ||
                    !selectedYear ||
                    employees.length === 0
                  }
                  size="lg"
                >
                  {runPayrollLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payroll...
                    </div>
                  ) : employees.length === 0 ? (
                    "No Employees Available"
                  ) : (
                    `Run Payroll for ${selectedMonth} ${selectedYear}`
                  )}
                </Button>

                {employees.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span>Employees to be Processed</span>
                      <Badge variant="secondary">
                        {employees.length} active employees
                      </Badge>
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-semibold">
                              Employee ID
                            </TableHead>
                            <TableHead className="font-semibold">
                              Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Department
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Basic Salary
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Allowances
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Deductions
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Net Pay
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees.slice(0, 5).map((employee) => (
                            <TableRow
                              key={employee.employeeId}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="font-medium">
                                {employee.employeeId}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {employee.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {employee.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{employee.department}</TableCell>
                              <TableCell className="text-right">
                                ₹{employee.basicSalary.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{employee.allowances.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{employee.deductions.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{employee.netPay.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {employees.length > 5 && (
                        <div className="text-center py-3 text-sm text-gray-600 bg-gray-50 border-t">
                          ... and {employees.length - 5} more employees
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // PAYROLL RESULTS
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Payroll Processed Successfully!
                      </h3>
                      <p className="text-green-600">
                        {payrollResults?.message ||
                          `Payroll processed for ${selectedMonth} ${selectedYear}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700">
                        Created:{" "}
                        <strong>{payrollResults?.createdCount || 0}</strong> |
                        Updated:{" "}
                        <strong>{payrollResults?.updatedCount || 0}</strong>
                      </p>
                      <p className="text-sm text-green-700">
                        Total Processed:{" "}
                        <strong>
                          {payrollResults?.processedEmployees || 0}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <Button onClick={handleRunNewPayroll} variant="outline">
                    Run New Payroll
                  </Button>
                  <Button onClick={() => setActiveTab("history")}>
                    View All Payroll History
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Employee ID
                        </TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">
                          Department
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Basic
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Allowances
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Deductions
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Net Pay
                        </TableHead>
                        <TableHead className="font-semibold text-center">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-center">
                          Download Payslip
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollResults?.payrolls?.map((payroll) => {
                        const employee = employees.find(
                          (emp) => emp.employeeId === payroll.employeeId
                        );
                        return (
                          <TableRow
                            key={payroll._id || payroll.employeeId}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {payroll.employeeId}
                            </TableCell>
                            <TableCell>{employee?.name || "N/A"}</TableCell>
                            <TableCell>
                              {employee?.department || "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{payroll.basicSalary?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{payroll.allowances?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{payroll.deductions?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              ₹{payroll.netPay?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="default">
                                {payroll.status || "processed"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleGeneratePayslip(
                                    payroll._id,
                                    employee?.name || "Employee"
                                  )
                                }
                                variant="outline"
                                disabled={generatingPayslip === payroll._id}
                                className="min-w-[140px] whitespace-nowrap"
                              >
                                {generatingPayslip === payroll._id ? (
                                  <div className="flex items-center gap-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                    Generating...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span>📄</span>
                                    <span>Download Payslip</span>
                                  </div>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Payroll History</CardTitle>
            <p className="text-sm text-gray-600">
              View and manage previous payroll runs
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {payrollHistoryLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payroll history...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Previous Payroll Runs
                  </h3>
                  {payrollHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {payrollHistory.map((history) => (
                        <Card
                          key={`${history._id.month}-${history._id.year}`}
                          className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                            selectedMonthHistory === history._id.month &&
                            selectedYearHistory === history._id.year
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                          onClick={() =>
                            fetchPayrollByMonth(
                              history._id.month,
                              history._id.year
                            )
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {history._id.month} {history._id.year}
                              </h3>
                              <Badge
                                variant={
                                  selectedMonthHistory === history._id.month &&
                                  selectedYearHistory === history._id.year
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {history.count} employees
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Total Payout:{" "}
                              <span className="font-semibold text-green-600">
                                ₹{history.totalNetPay.toFixed(2)}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last Updated:{" "}
                              {new Date(
                                history.lastUpdated
                              ).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📋</div>
                      <p className="text-lg">No payroll history found.</p>
                      <p className="text-sm">
                        Run payroll for a month to see history here.
                      </p>
                    </div>
                  )}
                </div>

                {currentPayroll.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Payroll Details for {selectedMonthHistory}{" "}
                        {selectedYearHistory}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          {currentPayroll.length} employees processed
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Last updated:{" "}
                          {new Date(
                            currentPayroll[0]?.updatedAt
                          ).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-semibold">
                              Employee ID
                            </TableHead>
                            <TableHead className="font-semibold">
                              Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Department
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Basic
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Allowances
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Deductions
                            </TableHead>
                            <TableHead className="font-semibold text-right">
                              Net Pay
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPayroll.map((payroll) => (
                            <TableRow
                              key={payroll._id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="font-medium">
                                {payroll.employeeId?.employeeId ||
                                  payroll.employeeId}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {payroll.employeeId?.name || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {payroll.employeeId?.email || ""}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {payroll.employeeId?.department || "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{payroll.basicSalary.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{payroll.allowances.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{payroll.deductions.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{payroll.netPay.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleGeneratePayslip(
                                      payroll._id,
                                      payroll.employeeId?.name || "Employee"
                                    )
                                  }
                                  variant="outline"
                                  disabled={generatingPayslip === payroll._id}
                                  className="min-w-[140px] whitespace-nowrap"
                                >
                                  {generatingPayslip === payroll._id ? (
                                    <div className="flex items-center gap-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                      Generating...
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <span>📄</span>
                                      <span>Download Payslip</span>
                                    </div>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : selectedMonthHistory && selectedYearHistory ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg">
                      No payroll data found for {selectedMonthHistory}{" "}
                      {selectedYearHistory}
                    </p>
                    <p className="text-sm">
                      Run payroll for this month to see details here.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">👆</div>
                    <p className="text-lg">
                      Select a payroll period to view details
                    </p>
                    <p className="text-sm">
                      Click on any payroll card above to view the details.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EmployeeSalaryRow = ({ employee, onUpdateSalary }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    basicSalary: employee.basicSalary || 0,
    allowances: employee.allowances || 0,
    deductions: employee.deductions || 0,
  });

  const handleSave = () => {
    if (
      formData.basicSalary < 0 ||
      formData.allowances < 0 ||
      formData.deductions < 0
    ) {
      toast({
        title: "Error",
        description: "Salary values cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (formData.deductions > formData.basicSalary + formData.allowances) {
      toast({
        title: "Error",
        description: "Deductions cannot be greater than total salary",
        variant: "destructive",
      });
      return;
    }

    onUpdateSalary(
      employee.employeeId,
      formData.basicSalary,
      formData.allowances,
      formData.deductions
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      basicSalary: employee.basicSalary || 0,
      allowances: employee.allowances || 0,
      deductions: employee.deductions || 0,
    });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const netPay =
    formData.basicSalary + formData.allowances - formData.deductions;

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{employee.employeeId}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-gray-500">{employee.email}</div>
        </div>
      </TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell>{employee.designation}</TableCell>
      <TableCell>
        <Badge
          variant={
            employee.employmentType === "Full-time" ? "default" : "secondary"
          }
        >
          {employee.employmentType}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={employee.status === "active" ? "default" : "destructive"}
        >
          {employee.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <Input
            type="number"
            value={formData.basicSalary}
            onChange={(e) => handleChange("basicSalary", e.target.value)}
            className="w-24 text-right"
            min="0"
          />
        ) : (
          `₹${employee.basicSalary.toFixed(2)}`
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <Input
            type="number"
            value={formData.allowances}
            onChange={(e) => handleChange("allowances", e.target.value)}
            className="w-24 text-right"
            min="0"
          />
        ) : (
          `₹${employee.allowances.toFixed(2)}`
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <Input
            type="number"
            value={formData.deductions}
            onChange={(e) => handleChange("deductions", e.target.value)}
            className="w-24 text-right"
            min="0"
          />
        ) : (
          `₹${employee.deductions.toFixed(2)}`
        )}
      </TableCell>
      <TableCell className="text-right font-semibold text-green-600">
        ₹{netPay.toFixed(2)}
      </TableCell>
      <TableCell className="text-center">
        {isEditing ? (
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            variant="outline"
          >
            Edit
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PayrollSection;
