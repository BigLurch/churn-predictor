# Sample customer endpoint.

# Provides sample customer data that can be used for UI demos and testing.

from fastapi import APIRouter
import random

router = APIRouter()


@router.get("/sample-customers")
def get_sample_customers():
    contracts = ["Month-to-month", "One year", "Two year"]
    payment_methods = ["Electronic check", "Mailed check", "Bank transfer", "Credit card"]
    internet_services = ["DSL", "Fiber optic", "No"]
    online_security_values = ["Yes", "No"]

    customers = []

    for _ in range(5):
        tenure = random.randint(1, 72)
        monthly_charges = round(random.uniform(20, 120), 2)
        total_charges = round(tenure * monthly_charges, 2)

        customers.append(
            {
                "tenure": tenure,
                "MonthlyCharges": monthly_charges,
                "TotalCharges": total_charges,
                "Contract": random.choice(contracts),
                "PaymentMethod": random.choice(payment_methods),
                "InternetService": random.choice(internet_services),
                "OnlineSecurity": random.choice(online_security_values),
            }
        )

    return {"customers": customers}