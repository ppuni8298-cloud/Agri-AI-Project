import requests
from typing import Optional


# =========================================================
# WEATHER CODE DESCRIPTION
# Open-Meteo WMO weather interpretation
# =========================================================

WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


# =========================================================
# GET WEATHER DESCRIPTION
# =========================================================

def weather_description(code: Optional[int]) -> str:
    if code is None:
        return "Unknown"

    try:
        return WEATHER_CODES.get(
            int(code),
            "Unknown weather condition"
        )
    except Exception:
        return "Unknown weather condition"


# =========================================================
# GET CURRENT WEATHER
# =========================================================

def get_weather(
    latitude: float,
    longitude: float,
) -> dict:

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "cloud_cover"
        ),

        "hourly": (
            "temperature_2m,"
            "precipitation_probability,"
            "precipitation,"
            "weather_code"
        ),

        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_sum,"
            "rain_sum,"
            "precipitation_probability_max,"
            "wind_speed_10m_max"
        ),

        "timezone": "auto",

        "forecast_days": 7,
    }

    try:

        response = requests.get(
            url,
            params=params,
            timeout=15,
        )

        response.raise_for_status()

        data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        current_code = current.get("weather_code")

        current_weather = {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "apparent_temperature": current.get(
                "apparent_temperature"
            ),
            "precipitation": current.get("precipitation"),
            "rain": current.get("rain"),
            "weather_code": current_code,
            "condition": weather_description(current_code),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_direction": current.get(
                "wind_direction_10m"
            ),
            "cloud_cover": current.get("cloud_cover"),
            "time": current.get("time"),
        }

        forecast = []

        dates = daily.get("time", [])

        weather_codes = daily.get(
            "weather_code",
            []
        )

        max_temperatures = daily.get(
            "temperature_2m_max",
            []
        )

        min_temperatures = daily.get(
            "temperature_2m_min",
            []
        )

        precipitation = daily.get(
            "precipitation_sum",
            []
        )

        rain = daily.get(
            "rain_sum",
            []
        )

        precipitation_probability = daily.get(
            "precipitation_probability_max",
            []
        )

        wind_speed = daily.get(
            "wind_speed_10m_max",
            []
        )

        for index, date in enumerate(dates):

            code = (
                weather_codes[index]
                if index < len(weather_codes)
                else None
            )

            forecast.append(
                {
                    "date": date,

                    "condition": weather_description(
                        code
                    ),

                    "weather_code": code,

                    "max_temperature": (
                        max_temperatures[index]
                        if index < len(max_temperatures)
                        else None
                    ),

                    "min_temperature": (
                        min_temperatures[index]
                        if index < len(min_temperatures)
                        else None
                    ),

                    "precipitation": (
                        precipitation[index]
                        if index < len(precipitation)
                        else None
                    ),

                    "rain": (
                        rain[index]
                        if index < len(rain)
                        else None
                    ),

                    "rain_probability": (
                        precipitation_probability[index]
                        if index < len(
                            precipitation_probability
                        )
                        else None
                    ),

                    "max_wind_speed": (
                        wind_speed[index]
                        if index < len(wind_speed)
                        else None
                    ),
                }
            )

        return {
            "success": True,

            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),

            "timezone": data.get("timezone"),

            "current": current_weather,

            "forecast": forecast,

            "source": "Open-Meteo",
        }

    except requests.RequestException as error:

        print("\n" + "=" * 60)
        print("WEATHER API ERROR")
        print(error)
        print("=" * 60)

        return {
            "success": False,
            "error": str(error),
        }

    except Exception as error:

        print("\n" + "=" * 60)
        print("WEATHER PROCESSING ERROR")
        print(error)
        print("=" * 60)

        return {
            "success": False,
            "error": str(error),
        }


# =========================================================
# FORMAT WEATHER RESPONSE
# =========================================================

def format_weather_response(
    weather_data: dict,
    language: str = "en",
) -> tuple[str, list]:

    if not weather_data.get("success"):
        return (
            "⚠️ I couldn't retrieve the current weather "
            "right now.",
            [],
        )

    current = weather_data.get(
        "current",
        {}
    )

    forecast = weather_data.get(
        "forecast",
        []
    )

    temperature = current.get(
        "temperature"
    )

    humidity = current.get(
        "humidity"
    )

    apparent_temperature = current.get(
        "apparent_temperature"
    )

    precipitation = current.get(
        "precipitation"
    )

    rain = current.get(
        "rain"
    )

    condition = current.get(
        "condition",
        "Unknown"
    )

    wind_speed = current.get(
        "wind_speed"
    )

    cloud_cover = current.get(
        "cloud_cover"
    )

    lines = []

    # =====================================================
    # CURRENT WEATHER
    # =====================================================

    lines.append(
        "🌦️ Current Weather"
    )

    lines.append(
        f"• Condition: {condition}"
    )

    if temperature is not None:
        lines.append(
            f"• Temperature: {temperature}°C"
        )

    if apparent_temperature is not None:
        lines.append(
            f"• Feels like: {apparent_temperature}°C"
        )

    if humidity is not None:
        lines.append(
            f"• Humidity: {humidity}%"
        )

    if wind_speed is not None:
        lines.append(
            f"• Wind speed: {wind_speed} km/h"
        )

    if cloud_cover is not None:
        lines.append(
            f"• Cloud cover: {cloud_cover}%"
        )

    if precipitation is not None:
        lines.append(
            f"• Precipitation: {precipitation} mm"
        )

    if rain is not None:
        lines.append(
            f"• Rain: {rain} mm"
        )

    # =====================================================
    # FORECAST
    # =====================================================

    if forecast:

        lines.append("")
        lines.append(
            "📅 7-Day Forecast"
        )

        for day in forecast:

            date = day.get(
                "date",
                ""
            )

            condition = day.get(
                "condition",
                "Unknown"
            )

            min_temp = day.get(
                "min_temperature"
            )

            max_temp = day.get(
                "max_temperature"
            )

            rain_probability = day.get(
                "rain_probability"
            )

            day_text = (
                f"• {date}: {condition}"
            )

            if (
                min_temp is not None
                and max_temp is not None
            ):
                day_text += (
                    f" | {min_temp}°C - "
                    f"{max_temp}°C"
                )

            if rain_probability is not None:
                day_text += (
                    f" | Rain probability: "
                    f"{rain_probability}%"
                )

            lines.append(day_text)

    # =====================================================
    # FARMING NOTE
    # =====================================================

    lines.append("")
    lines.append(
        "🌾 Weather information can help with "
        "irrigation, spraying and field-work planning."
    )

    # =====================================================
    # SOURCE
    # =====================================================

    sources = [
        {
            "source": "Open-Meteo",
            "type": "weather",
            "latitude": weather_data.get(
                "latitude"
            ),
            "longitude": weather_data.get(
                "longitude"
            ),
            "timezone": weather_data.get(
                "timezone"
            ),
        }
    ]

    return (
        "\n".join(lines),
        sources,
    )