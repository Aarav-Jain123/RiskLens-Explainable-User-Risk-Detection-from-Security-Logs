import csv
import random
from datetime import datetime, timedelta

users = [f"user_{i:02d}" for i in range(1, 61)]
devices = [f"dev_{i:02d}" for i in range(1, 61)]
locations = [
    "India", "United States", "Germany", "United Kingdom",
    "Singapore", "Australia", "Canada", "Japan"
]
event_types = ["login", "failed_login", "password_reset", "phishing_click", "file_access"]

start_date = datetime(2025, 1, 1)

rows = []

for _ in range(1000):
        user_idx = random.randint(0, 59)
        user = users[user_idx]
        device = devices[user_idx]

        event = random.choices(
            event_types,
            weights=[50, 15, 5, 3, 27],
            k=1
        )[0]

        value = 1 if event != "file_access" else random.randint(5, 250)

        row = [
            (start_date + timedelta(days=random.randint(0, 29),
                                    hours=random.randint(0, 23),
                                    minutes=random.randint(0, 59))).strftime("%Y-%m-%d %H:%M:%S"),
            user,
            event,
            value,
            device,
            f"10.0.{random.randint(0,5)}.{random.randint(1,254)}",
            random.choice(locations),
            "failure" if event == "failed_login" else "success",
            "file" if event == "file_access" else "system",
            "confidential_report" if event == "file_access" else "auth_service"
        ]

        rows.append(row)

        with open(f"dataset.csv", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp","user_id","event_type","event_value",
                "device_id","ip_address","location","auth_result",
                "resource_type","resource_name"
            ])
            writer.writerows(rows)
