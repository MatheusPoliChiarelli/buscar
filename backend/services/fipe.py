import os
import requests
from pathlib import Path
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

FIPE_TOKEN = os.getenv("FIPE_TOKEN")
FIPE_BASE = "https://fipe.parallelum.com.br/api/v2/cars"

FUEL_CODES = {
    "flex": "-5",
    "gasolina": "-1",
    "diesel": "-3",
    "hibrido": "-6",
    "eletrico": "-4",
}

FUEL_PRIORITY = ["-5", "-1", "-3", "-6", "-4"]


def fipe_get(url: str):
    headers = {"X-Subscription-Token": FIPE_TOKEN} if FIPE_TOKEN else {}
    response = requests.get(url, headers=headers, timeout=15).json()
    if isinstance(response, dict) and "error" in response:
        raise ValueError(f"Erro da API FIPE: {response['error']}")
    return response


@lru_cache(maxsize=1)
def get_brands():
    return fipe_get(f"{FIPE_BASE}/brands")


@lru_cache(maxsize=128)
def get_brand_years(brand_id: str):
    return fipe_get(f"{FIPE_BASE}/brands/{brand_id}/years")


@lru_cache(maxsize=256)
def get_year_models(brand_id: str, year_id: str):
    return fipe_get(f"{FIPE_BASE}/brands/{brand_id}/years/{year_id}/models")


def is_automatic(model_name: str) -> bool:
    return "aut" in model_name.lower()


def parse_price(price_str: str) -> float:
    number = price_str.replace("R$", "").strip()
    number = number.replace(".", "").replace(",", ".")
    return float(number)


def find_brand(brand: str) -> dict | None:
    brands = get_brands()
    search = brand.lower().strip()

    exact = next((b for b in brands if b["name"].lower() == search), None)
    if exact:
        return exact

    return next((b for b in brands if search in b["name"].lower()), None)


def find_year_id(brand_id: str, year: int, fuel: str | None = None) -> str | None:
    years = get_brand_years(brand_id)
    candidates = [y for y in years if y["code"].startswith(f"{year}-")]
    if not candidates:
        return None

    if fuel and fuel.lower() in FUEL_CODES:
        suffix = FUEL_CODES[fuel.lower()]
        preferred = next((y for y in candidates if y["code"].endswith(suffix)), None)
        if preferred:
            return preferred["code"]

    for suffix in FUEL_PRIORITY:
        match = next((y for y in candidates if y["code"].endswith(suffix)), None)
        if match:
            return match["code"]

    return candidates[0]["code"]

@lru_cache(maxsize=128)
def get_brand_models(brand_id: str):
    return fipe_get(f"{FIPE_BASE}/brands/{brand_id}/models")