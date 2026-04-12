let currentCustomers = [];
let currentPredictionResults = [];
let currentFilteredPredictionResults = [];

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

generateBtn.addEventListener("click", generateSampleCustomers);
predictBtn.addEventListener("click", predictBatch);
customerCountMode.addEventListener("change", toggleCustomCountInput);
predictionSearch.addEventListener("input", applyPredictionFilters);
riskFilter.addEventListener("change", applyPredictionFilters);
downloadCsvBtn.addEventListener("click", downloadPredictionResultsAsCsv);

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
        predictionControls.classList.add("hidden");
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
    renderPredictions(filteredResults);
}

function renderCustomers(customers) {
    if (!customers.length) {
        customerTableWrapper.innerHTML = `<p class="placeholder">No customers available.</p>`;
        return;
    }

    const rows = customers.map(customer => `
        <tr>
            <td>${customer.tenure}</td>
            <td>${customer.MonthlyCharges}</td>
            <td>${customer.TotalCharges}</td>
            <td>${customer.Contract}</td>
            <td>${customer.PaymentMethod}</td>
            <td>${customer.InternetService}</td>
            <td>${customer.OnlineSecurity}</td>
        </tr>
    `).join("");

    customerTableWrapper.innerHTML = `
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

function renderPredictions(results) {
    if (!results.length) {
        predictionTableWrapper.innerHTML = `<p class="placeholder">No prediction results available.</p>`;
        return;
    }

    const rows = results.map(item => `
        <tr>
            <td>${item.tenure}</td>
            <td>${item.Contract}</td>
            <td>${item.MonthlyCharges}</td>
            <td>${item.prediction}</td>
            <td>${item.probability.toFixed(3)}</td>
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