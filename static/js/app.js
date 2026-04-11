let currentCustomers = [];

const generateBtn = document.getElementById("generate-btn");
const predictBtn = document.getElementById("predict-btn");
const customerCountMode = document.getElementById("customer-count-mode");
const customerCountCustom = document.getElementById("customer-count-custom");
const customerTableWrapper = document.getElementById("customer-table-wrapper");
const predictionTableWrapper = document.getElementById("prediction-table-wrapper");
const predictionSummary = document.getElementById("prediction-summary");

generateBtn.addEventListener("click", generateSampleCustomers);
predictBtn.addEventListener("click", predictBatch);
customerCountMode.addEventListener("change", toggleCustomCountInput);

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

            if (!count || count < 1 || count > 100) {
                customerTableWrapper.innerHTML = `<p class="placeholder">Please enter a custom number between 1 and 100.</p>`;
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

        renderPredictionSummary(results);
        renderPredictions(results);
    } catch (error) {
        predictionTableWrapper.innerHTML = `<p class="placeholder">Prediction request failed.</p>`;
        console.error(error);
    } finally {
        predictBtn.disabled = false;
        predictBtn.textContent = "Predict Churn";
    }
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

    predictionSummary.innerHTML = `
        <div class="summary-badge">Total Customers: ${results.length}</div>
        <div class="summary-badge risk-high">High Risk: ${high}</div>
        <div class="summary-badge risk-medium">Medium Risk: ${medium}</div>
        <div class="summary-badge risk-low">Low Risk: ${low}</div>
    `;

    predictionSummary.classList.remove("hidden");
}

toggleCustomCountInput();