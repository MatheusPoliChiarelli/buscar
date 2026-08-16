from sqlalchemy.orm import Session
from models_db import FipePrice, FipeImport
from services.fipe import (
    FIPE_BASE,
    fipe_get,
    find_brand,
    find_year_id,
    get_year_models,
    is_automatic,
    parse_price,
)


def already_imported(db: Session, brand: str, model: str, year: int) -> bool:
    return db.query(FipeImport).filter(
        FipeImport.brand == brand,
        FipeImport.model == model,
        FipeImport.year == year
    ).first() is not None


def import_from_fipe(db: Session, brand_name: str, brand_id: str, model_search: str, year: int, fuel: str | None) -> int:
    year_id = find_year_id(brand_id, year, fuel)
    print("DEBUG year_id:", year_id)
    if not year_id:
        return 0

    models = get_year_models(brand_id, year_id)
    matches = [m for m in models if model_search.lower() in m["name"].lower()]
    print("DEBUG total de modelos:", len(models), "| matches:", len(matches))
    if not matches:
        return 0
    matches = matches[:8]
    total = 0

    for model in matches:
        try:
            data = fipe_get(f"{FIPE_BASE}/brands/{brand_id}/models/{model['code']}/years/{year_id}")
        except ValueError:
            break

        db.add(FipePrice(
            brand=brand_name,
            model=model["name"],
            year=year,
            fuel=data.get("fuel"),
            fipe_code=data.get("codeFipe"),
            price=parse_price(data["price"]),
            reference_month=data.get("referenceMonth"),
        ))
        total += 1

    if total > 0:
        db.add(FipeImport(brand=brand_name, model=model_search, year=year))
        db.commit()
    else:
        db.rollback()

    return total



def lookup_fipe_price(
    db: Session,
    brand: str,
    model: str,
    year: int,
    version: str | None = None,
    transmission: str | None = None,
    fuel: str | None = None,
) -> dict | None:
    try:
        found_brand = find_brand(brand)
        if not found_brand:
            return None

        brand_name = found_brand["name"]
        brand_id = found_brand["code"]

        result = _search(db, brand_name, brand_id, version, year, transmission, fuel) if version else None

        if result:
            result["fallback"] = False
            return result

        result = _search(db, brand_name, brand_id, model, year, transmission, fuel)
        if not result:
            return None

        result["fallback"] = bool(version)
        return result
    except ValueError:
        return None


def _search(
    db: Session,
    brand_name: str,
    brand_id: str,
    term: str,
    year: int,
    transmission: str | None,
    fuel: str | None,
) -> dict | None:
    if not already_imported(db, brand_name, term, year):
        imported = import_from_fipe(db, brand_name, brand_id, term, year, fuel)
        if imported == 0:
            return None

    candidates = db.query(FipePrice).filter(
        FipePrice.brand == brand_name,
        FipePrice.year == year,
        FipePrice.model.ilike(f"%{term}%")
    ).all()

    if not candidates:
        return None

    if transmission == "automatico":
        candidates = [c for c in candidates if is_automatic(c.model)] or candidates
    elif transmission == "manual":
        candidates = [c for c in candidates if not is_automatic(c.model)] or candidates

    prices = [c.price for c in candidates]

    return {
        "price": round(sum(prices) / len(prices), 2),
        "exact": len(candidates) == 1,
        "matched_model": candidates[0].model,
        "reference_month": candidates[0].reference_month,
    }