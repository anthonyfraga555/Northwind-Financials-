"""Nightly job: pull settled transactions, aggregate, load to the warehouse."""
import os

import boto3
import pandas as pd
import requests
import yaml
from sqlalchemy import create_engine


def load_config(path="config.yaml"):
    with open(path) as f:
        return yaml.safe_load(f)


def extract(api_url, token):
    resp = requests.get(f"{api_url}/transactions/settled",
                        headers={"Authorization": f"Bearer {token}"}, timeout=30)
    resp.raise_for_status()
    return pd.DataFrame(resp.json())


def transform(df):
    df["date"] = pd.to_datetime(df["settled_at"]).dt.date
    return df.groupby(["merchant_id", "date"], as_index=False)["amount"].sum()


def load(df, db_url, bucket):
    df.to_sql("daily_settlements", create_engine(db_url), if_exists="append", index=False)
    boto3.client("s3").put_object(Bucket=bucket, Key="exports/daily.csv",
                                  Body=df.to_csv(index=False))


if __name__ == "__main__":
    cfg = load_config()
    data = extract(cfg["api_url"], os.environ["API_TOKEN"])
    load(transform(data), os.environ["WAREHOUSE_URL"], cfg["export_bucket"])
