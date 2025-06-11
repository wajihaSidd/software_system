// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/invoice"; // POST new invoice
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/invoices"; // GET all invoices

// DOM elements
const tbody = document.querySelector("#invoicesTable tbody");
const invoiceForm = document.getElementById("invoiceForm");
const modal = document.getElementById("invoiceModal");
const insertBtn = document.getElementById("insertInvoiceBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let invoicesData = [];

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

// Render invoices table
function renderTable() {
    tbody.innerHTML = "";

    if (invoicesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="15" style="text-align: center;">No invoices found</td></tr>`;
        return;
    }

    invoicesData.forEach((invoice) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${invoice.invoiceid}</td>
            <td>${invoice.invoicenumber}</td>
            <td>${invoice.projectid}</td>
            <td>${invoice.clientid}</td>
            <td>${new Date(invoice.issuedate).toLocaleDateString()}</td>
            <td>${new Date(invoice.duedate).toLocaleDateString()}</td>
            <td>$${parseFloat(invoice.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>$${parseFloat(invoice.taxamount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>${parseFloat(invoice.discount).toFixed(2)}%</td>
            <td>$${parseFloat(invoice.totalamount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>${invoice.status}</td>
            <td>${invoice.paymentmethod}</td>
            <td>${invoice.paymentdate ? new Date(invoice.paymentdate).toLocaleDateString() : 'N/A'}</td>
            <td>${invoice.notes || 'N/A'}</td>
            <td>${invoice.createdby}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all invoices
async function fetchInvoices() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        invoicesData = data;
        renderTable();
        showStatus("Invoices loaded successfully", true);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        showStatus("Failed to load invoices", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const invoiceData = {
        invoicenumber: document.getElementById("invoicenumber").value.trim(),
        projectid: parseInt(document.getElementById("projectid").value.trim()),
        clientid: parseInt(document.getElementById("clientid").value.trim()),
        issuedate: document.getElementById("issuedate").value.trim(),
        duedate: document.getElementById("duedate").value.trim(),
        amount: parseFloat(document.getElementById("amount").value.trim()),
        taxamount: parseFloat(document.getElementById("taxamount").value.trim()),
        discount: parseFloat(document.getElementById("discount").value.trim()),
        totalamount: parseFloat(document.getElementById("totalamount").value.trim()),
        status: document.getElementById("status").value.trim(),
        paymentmethod: document.getElementById("paymentmethod").value.trim(),
        paymentdate: document.getElementById("paymentdate").value.trim(),
        notes: document.getElementById("notes").value.trim(),
        createdby: parseInt(document.getElementById("createdby").value.trim())
    };

    // Validate required fields
    if (!invoiceData.invoicenumber || isNaN(invoiceData.projectid) || 
        isNaN(invoiceData.clientid) || !invoiceData.issuedate || 
        !invoiceData.duedate || isNaN(invoiceData.amount) || 
        isNaN(invoiceData.taxamount) || isNaN(invoiceData.discount) || 
        isNaN(invoiceData.totalamount) || !invoiceData.status || 
        !invoiceData.paymentmethod || isNaN(invoiceData.createdby)) {
        showStatus("Please fill in all required fields", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add invoice");
        }

        const addedInvoice = await response.json();
        invoicesData.push(addedInvoice);
        renderTable();
        modal.style.display = "none";
        showStatus("Invoice added successfully", true);
    } catch (error) {
        console.error("Error adding invoice:", error);
        showStatus(`Failed to add invoice: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Invoice";
    invoiceForm.reset();
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

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

invoiceForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchInvoices);