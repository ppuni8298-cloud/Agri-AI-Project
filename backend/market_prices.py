import os
import requests
from typing import Optional


MANDI_API_URL = os.getenv(
    "MANDI_API_URL",
    "https://mandi-api.onrender.com"
).rstrip("/")


def get_crop_prices(
    commodity: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
):
    """
    Fetch current mandi prices from the Mandi Price API.

    If state is None:
        Search across India.

    If state is provided:
        Search only that state.

    district and market are optional filters.
    """

    params = {
        "commodity": commodity,
    }

    # Only restrict by state when the user mentioned a state.
    if state:
        params["state"] = state

    if district:
        params["district"] = district

    if market:
        params["market"] = market

    url = f"{MANDI_API_URL}/v1/prices"

    try:
        print("\n" + "=" * 60)
        print("MANDI PRICE API REQUEST")
        print("URL:", url)
        print("PARAMS:", params)
        print("=" * 60)

        response = requests.get(
            url,
            params=params,
            headers={
                "Accept": "application/json"
            },
            timeout=15,
        )

        response.raise_for_status()

        data = response.json()

        print("\nMANDI API RESPONSE SUCCESS")
        print("REQUEST URL:", response.url)

        return {
            "success": True,
            "data": data,
        }

    except requests.exceptions.Timeout:

        print("MANDI API TIMEOUT")

        return {
            "success": False,
            "error": "Mandi price service timed out.",
        }

    except requests.exceptions.RequestException as e:

        print("MANDI API REQUEST ERROR:", str(e))

        return {
            "success": False,
            "error": (
                "Mandi price service error: "
                f"{str(e)}"
            ),
        }

    except Exception as e:

        print("MANDI API UNKNOWN ERROR:", str(e))

        return {
            "success": False,
            "error": str(e),
        }