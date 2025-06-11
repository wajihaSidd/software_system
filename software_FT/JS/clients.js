// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/client"; // POST new client
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/clients"; // GET all clients

// DOM elements
const tbody = document.querySelector("#clientsTable tbody");
const clientForm = document.getElementById("clientForm");
const modal = document.getElementById("clientModal");
const insertBtn = document.getElementById("insertClientBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let clientsData = [];

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

// Render clients table
function renderTable() {
    tbody.innerHTML = "";

    if (clientsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center;">No clients found</td></tr>`;
        return;
    }

    clientsData.forEach((client) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${client.clientid}</td>
            <td>${client.companyname}</td>
            <td>${client.contactperson}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.address}</td>
            <td>${client.industry}</td>
            <td>${client.taxnumber}</td>
            <td>${client.paymentterms}</td>
            <td>${new Date(client.clientsince).toLocaleDateString()}</td>
            <td>${client.status}</td>
            <td>${client.accountmanagerid}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all clients
async function fetchClients() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        clientsData = data;
        renderTable();
        // Update charts after data is loaded
        updateCharts(clientsData);
        showStatus("Clients loaded successfully", true);
    } catch (error) {
        console.error("Error fetching clients:", error);
        showStatus("Failed to load clients", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const clientData = {
        companyname: document.getElementById("companyname").value.trim(),
        contactperson: document.getElementById("contactperson").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim(),
        industry: document.getElementById("industry").value.trim(),
        taxnumber: document.getElementById("taxnumber").value.trim(),
        paymentterms: document.getElementById("paymentterms").value.trim(),
        clientsince: document.getElementById("clientsince").value.trim(),
        status: document.getElementById("status").value.trim(),
        accountmanagerid: parseInt(document.getElementById("accountmanagerid").value.trim())
    };

    // Validate required fields
    if (!clientData.companyname || !clientData.contactperson || 
        !clientData.email || !clientData.phone || !clientData.address || 
        !clientData.industry || !clientData.taxnumber || !clientData.paymentterms || 
        !clientData.clientsince || !clientData.status || isNaN(clientData.accountmanagerid)) {
        showStatus("Please fill in all required fields with valid values", false);
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
        showStatus("Please enter a valid email address", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clientData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add client");
        }

        const addedClient = await response.json();
        clientsData.push(addedClient);
        renderTable();
        // Update charts after adding new client
        updateCharts(clientsData);
        modal.style.display = "none";
        showStatus("Client added successfully", true);
    } catch (error) {
        console.error("Error adding client:", error);
        showStatus(`Failed to add client: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Client";
    clientForm.reset();
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

logoutBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

dashboardBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "dashboard.html";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

clientForm.addEventListener("submit", handleFormSubmit);
let statusChart;

// Function to count status occurrences
function countStatuses(clients) {
    const statusCounts = {
        Active: 0,
        Inactive: 0,
        Pending: 0,
        Suspended: 0
    };

    clients.forEach(client => {
        if (statusCounts.hasOwnProperty(client.status)) {
            statusCounts[client.status]++;
        }
    });

    return statusCounts;
}

// Function to update all charts
function updateCharts(clients) {
    updateStatusChart(clients);
}

// Function to create/update the status chart
function updateStatusChart(clients) {
    const statusCounts = countStatuses(clients);
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    
    // Colors for the chart
    const backgroundColors = [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)'
    ];
    
    const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
    ];

    // If chart already exists, destroy it first
    if (statusChart) {
        statusChart.destroy();
    }

    // Create new chart
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: statusLabels,
            datasets: [{
                data: statusData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#eaeaea',
                        font: {
                            family: 'Roboto'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Client Status Distribution',
                    color: '#4a90e2',
                    font: {
                        family: 'Orbitron',
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Charts will be updated when data is loaded in clients.js
});

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchClients);