// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/employee"; // POST new employee
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/employees"; // GET all employees

// DOM elements
const tbody = document.querySelector("#employeesTable tbody");
const employeeForm = document.getElementById("employeeForm");
const modal = document.getElementById("employeeModal");
const insertBtn = document.getElementById("insertEmployeeBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");
const genderChartCanvas = document.getElementById("genderChart");

let employeesData = [];
let genderChart = null;

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = "block";
    tbody.style.opacity = "0.5";
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = "none";
    tbody.style.opacity = "1";
}

// Show status message
function showStatus(message, isSuccess) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isSuccess ? 'success' : 'error'}`;
    statusMessage.style.display = "block";
    setTimeout(() => {
        statusMessage.style.display = "none";
    }, 5000);
}

// Render employees table
function renderTable() {
    tbody.innerHTML = "";

    if (employeesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center;">No employees found</td></tr>`;
        return;
    }

    employeesData.forEach((employee) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${employee.employeeid}</td>
            <td>${employee.firstname}</td>
            <td>${employee.lastname}</td>
            <td>${employee.gender}</td>
            <td>${employee.cnic}</td>
            <td>${employee.email}</td>
            <td>${employee.phone}</td>
            <td>${new Date(employee.hiredate).toLocaleDateString()}</td>
            <td>${employee.jobtitle}</td>
            <td>$${employee.salary.toLocaleString()}</td>
            <td>${employee.bankaccount}</td>
            <td>${employee.departmentid}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render gender pie chart
function renderGenderChart() {
    const genderCounts = employeesData.reduce((acc, emp) => {
        const gender = emp.gender.toLowerCase();
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(genderCounts);
    const data = Object.values(genderCounts);
    const colors = labels.map(label => label === "male" ? "#36A2EB" : "#FF6384");

    const ctx = genderChartCanvas.getContext("2d");

    if (genderChart) {
        genderChart.destroy();
    }

    genderChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: "#fff",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: "Employee Gender Distribution" }
            }
        }
    });
}

// Fetch all employees
async function fetchEmployees() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        employeesData = data;
        renderTable();
        renderGenderChart();
        showStatus("Employees loaded successfully", true);
    } catch (error) {
        console.error("Error fetching employees:", error);
        showStatus("Failed to load employees", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const employeeData = {
        firstname: document.getElementById("firstname").value.trim(),
        lastname: document.getElementById("lastname").value.trim(),
        gender: document.getElementById("gender").value.trim(),
        cnic: document.getElementById("cnic").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        hiredate: document.getElementById("hiredate").value.trim(),
        jobtitle: document.getElementById("jobtitle").value.trim(),
        salary: parseFloat(document.getElementById("salary").value.trim()),
        bankaccount: document.getElementById("bankaccount").value.trim(),
        departmentid: parseInt(document.getElementById("departmentid").value.trim())
    };

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    const validGenders = ["male", "female"];

    if (!employeeData.firstname || !employeeData.lastname || !employeeData.gender ||
        !employeeData.cnic || !employeeData.email || !employeeData.phone ||
        !employeeData.hiredate || !employeeData.jobtitle || isNaN(employeeData.salary)) {
        showStatus("Please fill in all required fields", false);
        return;
    }

    if (!emailRegex.test(employeeData.email)) {
        showStatus("Invalid email format", false);
        return;
    }

    if (!cnicRegex.test(employeeData.cnic)) {
        showStatus("Invalid CNIC format (e.g., 12345-1234567-1)", false);
        return;
    }

    if (!validGenders.includes(employeeData.gender.toLowerCase())) {
        showStatus("Gender must be 'Male' or 'Female'", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add employee");
        }

        const addedEmployee = await response.json();
        employeesData.push(addedEmployee);
        renderTable();
        renderGenderChart();
        modal.style.display = "none";
        showStatus("Employee added successfully", true);
    } catch (error) {
        console.error("Error adding employee:", error);
        showStatus(`Failed to add employee: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Employee";
    employeeForm.reset();
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => modal.style.display = "none");
cancelBtn.addEventListener("click", () => modal.style.display = "none");
logoutBtn.addEventListener("click", () => window.location.href = "index.html");

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

employeeForm.addEventListener("submit", handleFormSubmit);

// Initialize
document.addEventListener('DOMContentLoaded', fetchEmployees);
// Add these to your DOM elements section
const salaryChartCanvas = document.getElementById("salaryChart");
const toggleSalaryChartBtn = document.getElementById("toggleSalaryChartBtn");
let salaryChart = null;

// Add this function to create/update the salary chart
function renderSalaryChart() {
    // Destroy previous chart if it exists
    if (salaryChart) {
        salaryChart.destroy();
    }
    
    const ctx = salaryChartCanvas.getContext("2d");
    
    // Sort employees by salary (descending) and take top 10
    const sortedEmployees = [...employeesData]
        .sort((a, b) => b.salary - a.salary)
        .slice(0, 10);
    
    // Extract employee names and salaries
    const employeeNames = sortedEmployees.map(emp => `${emp.firstname} ${emp.lastname}`);
    const employeeSalaries = sortedEmployees.map(emp => emp.salary);
    
    // Create chart
    salaryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: employeeNames,
            datasets: [{
                label: "Salary ($)",
                data: employeeSalaries,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y', // Makes it horizontal
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.raw.toLocaleString();
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Top 10 Employees by Salary'
                }
            }
        }
    });
    
    // Show the chart
    salaryChartCanvas.style.display = "block";
}

// Add this function to toggle chart visibility
function toggleSalaryChart() {
    if (salaryChartCanvas.style.display === "none") {
        renderSalaryChart();
        toggleSalaryChartBtn.textContent = "Hide Salary Chart";
    } else {
        salaryChartCanvas.style.display = "none";
        toggleSalaryChartBtn.textContent = "Show Salary Chart";
    }
}

// Add this event listener
toggleSalaryChartBtn.addEventListener("click", toggleSalaryChart);

// Update the fetchEmployees function to include salary chart rendering if visible
async function fetchEmployees() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        employeesData = data;
        renderTable();
        renderGenderChart();
        if (salaryChartCanvas.style.display !== "none") {
            renderSalaryChart();
        }
        showStatus("Employees loaded successfully", true);
    } catch (error) {
        console.error("Error fetching employees:", error);
        showStatus("Failed to load employees", false);
    } finally {
        hideLoading();
    }
}