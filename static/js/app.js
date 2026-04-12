let currentCustomers = [];
let currentPredictionResults = [];
let currentFilteredPredictionResults = [];

let predictionCurrentPage = 1;
const predictionRowsPerPage = 20;

const generateBtn = document.getElementById("generate-btn");
const predictBtn = document.getElementById("predict-btn");
const customerCountMode = document.getElementById("customer-count-mode");
const customerCountCustom = document.getElementById("customer-count-custom");
const customerTableWrapper = document.getElementById("customer-table-wrapper");
const predictionTableWrapper = document.getElementById("prediction-table-wrapper");
const predictionSummary = document.getElementById("prediction-summary");
const predictionControls = document.getElementById("prediction-controls");
const predictionSearch = document.getElementById("prediction-search");
const riskFilter = document.getElementById("risk-filter");
const downloadCsvBtn = document.getElementById("download-csv-btn");
const predictionPagination = document.getElementById("prediction-pagination");
const predictionPrevBtn = document.getElementById("prediction-prev-btn");
const predictionNextBtn = document.getElementById("prediction-next-btn");
const predictionPageInfo = document.getElementById("prediction-page-info");
const predictionPanel = document.getElementById("prediction-panel");

generateBtn.addEventListener("click", generateSampleCustomers);
predictBtn.addEventListener("click", predictBatch);
customerCountMode.addEventListener("change", toggleCustomCountInput);
predictionSearch.addEventListener("input", applyPredictionFilters);
riskFilter.addEventListener("change", applyPredictionFilters);
downloadCsvBtn.addEventListener("click", downloadPredictionResultsAsCsv);
predictionPrevBtn.addEventListener("click", goToPreviousPredictionPage);
predictionNextBtn.addEventListener("click", goToNextPredictionPage);

function toggleCustomCountInput() {
    if (customerCountMode.value === "custom") {
        customerCountCustom.classList.remove("hidden-input");
    } else {
        customerCountCustom.classList.add("hidden-input");
    }
}

async function generateSampleCustomers() {
    try {
        generateBtn.disabled = true;
        generateBtn.textContent = "Generating...";

        let count;

        if (customerCountMode.value === "custom") {
            count = parseInt(customerCountCustom.value, 10);

            if (!count || count < 1 || count > 1000) {
                customerTableWrapper.innerHTML =
                    `<p class="placeholder">Please enter a custom number between 1 and 1000.</p>`;
                return;
            }
        } else {
            count = customerCountMode.value;
        }

        const response = await fetch(`/sample-customers?count=${count}`);

        if (!response.ok) {
            throw new Error("Failed to fetch sample customers.");
        }

        const data = await response.json();

        currentCustomers = data.customers || [];
        renderCustomers(currentCustomers);

        predictBtn.disabled = currentCustomers.length === 0;
        predictionTableWrapper.innerHTML = `<p class="placeholder">Prediction results will appear here.</p>`;
        predictionSummary.classList.add("hidden");
        predictionSummary.innerHTML = "";

        currentPredictionResults = [];
        currentFilteredPredictionResults = [];
        predictionCurrentPage = 1;

        predictionPanel.classList.remove("active");
        predictionControls.classList.add("hidden");
        predictionPagination.classList.add("hidden");
        predictionSummary.classList.add("hidden");
        predictionSummary.innerHTML = "";
        predictionSearch.value = "";
        riskFilter.value = "all";
    } catch (error) {
        customerTableWrapper.innerHTML = `<p class="placeholder">Failed to load sample customers.</p>`;
        console.error(error);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Sample Customers";
    }
}

async function predictBatch() {
    try {
        predictBtn.disabled = true;
        predictBtn.textContent = "Predicting...";

        const response = await fetch("/predict-batch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ customers: currentCustomers }),
        });

        if (!response.ok) {
            throw new Error("Prediction request failed.");
        }

        const data = await response.json();
        const results = data.results || [];
        currentPredictionResults = results;

        predictionPanel.classList.add("active");
        predictionControls.classList.remove("hidden");
        renderPredictionSummary(results);
        applyPredictionFilters();
    } catch (error) {
        predictionTableWrapper.innerHTML = `<p class="placeholder">Prediction request failed.</p>`;
        console.error(error);
    } finally {
        predictBtn.disabled = false;
        predictBtn.textContent = "Predict Churn";
    }
}

function applyPredictionFilters() {
    let filteredResults = [...currentPredictionResults];

    const searchValue = predictionSearch.value.trim().toLowerCase();
    const selectedRisk = riskFilter.value;

    if (searchValue) {
        filteredResults = filteredResults.filter(item =>
            item.Contract.toLowerCase().includes(searchValue) ||
            item.PaymentMethod.toLowerCase().includes(searchValue) ||
            item.InternetService.toLowerCase().includes(searchValue) ||
            item.OnlineSecurity.toLowerCase().includes(searchValue) ||
            item.label.toLowerCase().includes(searchValue)
        );
    }

    if (selectedRisk !== "all") {
        filteredResults = filteredResults.filter(item => item.risk_level === selectedRisk);
    }

    currentFilteredPredictionResults = filteredResults;
    predictionCurrentPage = 1;
    renderPaginatedPredictions();
}

function renderCustomers(customers) {
    if (!customers.length) {
        customerTableWrapper.classList.add("active");
        customerTableWrapper.innerHTML = `<p class="placeholder">No customers available.</p>`;
        return;
    }

    customerTableWrapper.classList.add("active");

    const visibleCount = customers.length;

    const contractOptions = ["Month-to-month", "One year", "Two year"];
    const paymentOptions = ["Electronic check", "Mailed check", "Bank transfer", "Credit card"];
    const internetOptions = ["DSL", "Fiber optic", "No"];
    const securityOptions = ["Yes", "No"];

    const rows = customers.map((customer, index) => `
        <tr>
            <td>
                <input
                    type="number"
                    value="${customer.tenure}"
                    min="1"
                    max="72"
                    onchange="updateCustomerField(${index}, 'tenure', this.value)"
                />
            </td>
            <td>
                <input
                    type="number"
                    value="${customer.MonthlyCharges}"
                    min="0"
                    step="0.01"
                    onchange="updateCustomerField(${index}, 'MonthlyCharges', this.value)"
                />
            </td>
            <td>
                <input
                    type="number"
                    value="${customer.TotalCharges}"
                    min="0"
                    step="0.01"
                    onchange="updateCustomerField(${index}, 'TotalCharges', this.value)"
                />
            </td>
            <td>
                <select onchange="updateCustomerField(${index}, 'Contract', this.value)">
                    ${contractOptions.map(option => `
                        <option value="${option}" ${customer.Contract === option ? "selected" : ""}>
                            ${option}
                        </option>
                    `).join("")}
                </select>
            </td>
            <td>
                <select onchange="updateCustomerField(${index}, 'PaymentMethod', this.value)">
                    ${paymentOptions.map(option => `
                        <option value="${option}" ${customer.PaymentMethod === option ? "selected" : ""}>
                            ${option}
                        </option>
                    `).join("")}
                </select>
            </td>
            <td>
                <select onchange="updateCustomerField(${index}, 'InternetService', this.value)">
                    ${internetOptions.map(option => `
                        <option value="${option}" ${customer.InternetService === option ? "selected" : ""}>
                            ${option}
                        </option>
                    `).join("")}
                </select>
            </td>
            <td>
                <select onchange="updateCustomerField(${index}, 'OnlineSecurity', this.value)">
                    ${securityOptions.map(option => `
                        <option value="${option}" ${customer.OnlineSecurity === option ? "selected" : ""}>
                            ${option}
                        </option>
                    `).join("")}
                </select>
            </td>
        </tr>
    `).join("");

    customerTableWrapper.innerHTML = `
        <div class="table-meta">
            Showing ${visibleCount} customers
        </div>

        <table>
            <thead>
                <tr>
                    <th>Tenure</th>
                    <th>Monthly Charges</th>
                    <th>Total Charges</th>
                    <th>Contract</th>
                    <th>Payment Method</th>
                    <th>Internet Service</th>
                    <th>Online Security</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function updateCustomerField(index, field, value) {
    if (!currentCustomers[index]) {
        return;
    }

    if (field === "tenure") {
        currentCustomers[index][field] = parseInt(value, 10) || 0;
    } else if (field === "MonthlyCharges" || field === "TotalCharges") {
        currentCustomers[index][field] = parseFloat(value) || 0;
    } else {
        currentCustomers[index][field] = value;
    }
}

function renderPredictions(results) {
    if (!results.length) {
        predictionTableWrapper.innerHTML = `<p class="placeholder">No prediction results available.</p>`;
        predictionPagination.classList.add("hidden");
        return;
    }

    const rows = results.map(item => `
        <tr>
            <td>${item.tenure}</td>
            <td>${item.Contract}</td>
            <td>${item.MonthlyCharges}</td>
            <td>${item.prediction}</td>
            <td>${Number(item.probability).toFixed(3)}</td>
            <td><span class="label-pill">${item.label}</span></td>
            <td class="risk-${item.risk_level}">${item.risk_level}</td>
        </tr>
    `).join("");

    predictionTableWrapper.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tenure</th>
                    <th>Contract</th>
                    <th>Monthly Charges</th>
                    <th>Prediction</th>
                    <th>Probability</th>
                    <th>Label</th>
                    <th>Risk Level</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function renderPaginatedPredictions() {
    if (!currentFilteredPredictionResults.length) {
        renderPredictions([]);
        return;
    }

    const totalRows = currentFilteredPredictionResults.length;
    const totalPages = Math.ceil(totalRows / predictionRowsPerPage);

    const startIndex = (predictionCurrentPage - 1) * predictionRowsPerPage;
    const endIndex = startIndex + predictionRowsPerPage;

    const paginatedResults = currentFilteredPredictionResults.slice(startIndex, endIndex);

    renderPredictions(paginatedResults);
    renderPredictionPagination(totalPages);
}

function renderPredictionPagination(totalPages) {
    if (totalPages <= 1) {
        predictionPagination.classList.add("hidden");
        return;
    }

    predictionPagination.classList.remove("hidden");
    predictionPageInfo.textContent = `Page ${predictionCurrentPage} of ${totalPages}`;

    predictionPrevBtn.disabled = predictionCurrentPage === 1;
    predictionNextBtn.disabled = predictionCurrentPage === totalPages;
}

function goToPreviousPredictionPage() {
    if (predictionCurrentPage > 1) {
        predictionCurrentPage -= 1;
        renderPaginatedPredictions();
    }
}

function goToNextPredictionPage() {
    const totalPages = Math.ceil(currentFilteredPredictionResults.length / predictionRowsPerPage);

    if (predictionCurrentPage < totalPages) {
        predictionCurrentPage += 1;
        renderPaginatedPredictions();
    }
}

function renderPredictionSummary(results) {
    const high = results.filter(r => r.risk_level === "high").length;
    const medium = results.filter(r => r.risk_level === "medium").length;
    const low = results.filter(r => r.risk_level === "low").length;

    const total = results.length;

    const highWidth = (high / total) * 100;
    const mediumWidth = (medium / total) * 100;
    const lowWidth = (low / total) * 100;

    predictionSummary.innerHTML = `
        <div class="summary-card">
            <strong>Total Customers:</strong> ${total}
        </div>

        <div class="chart-row">
            <span>High Risk (${high})</span>
            <div class="bar">
                <div class="fill high-fill" style="width:${highWidth}%"></div>
            </div>
        </div>

        <div class="chart-row">
            <span>Medium Risk (${medium})</span>
            <div class="bar">
                <div class="fill medium-fill" style="width:${mediumWidth}%"></div>
            </div>
        </div>

        <div class="chart-row">
            <span>Low Risk (${low})</span>
            <div class="bar">
                <div class="fill low-fill" style="width:${lowWidth}%"></div>
            </div>
        </div>
    `;

    predictionSummary.classList.remove("hidden");
}

function downloadPredictionResultsAsCsv() {
    if (!currentFilteredPredictionResults.length) {
        return;
    }

    const headers = [
        "tenure",
        "MonthlyCharges",
        "TotalCharges",
        "Contract",
        "PaymentMethod",
        "InternetService",
        "OnlineSecurity",
        "prediction",
        "probability",
        "label",
        "risk_level"
    ];

    const csvRows = [
        headers.join(","),
        ...currentFilteredPredictionResults.map(row =>
            headers.map(header => {
                const value = row[header];
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(",")
        )
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `churn_predictions_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

toggleCustomCountInput();