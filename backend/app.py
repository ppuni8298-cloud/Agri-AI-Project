from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional

import sqlite3
import os
import json
import base64

from rag import get_rag_answer
from voice import speech_to_text, text_to_speech

# =========================================================
# CROP / MANDI PRICE API
# =========================================================

from market_prices import get_crop_prices

# =========================================================
# WEATHER API
# =========================================================

from weather import get_weather, format_weather_response


# =========================================================
# DATABASE
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "agri_chat.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            confidence REAL,
            sources TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(session_id) REFERENCES sessions(id)
        )
        """
    )

    conn.commit()
    conn.close()


init_db()


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Agri AI Backend",
    description=(
        "AI-Based Agricultural Advisory System "
        "with RAG, Market Prices and Weather"
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class SessionCreate(BaseModel):
    user_id: str
    title: Optional[str] = "New Chat"


class ChatRequest(BaseModel):
    query: str

    history: Optional[
        list[dict[str, Any]]
    ] = None

    language: Optional[str] = "en"

    session_id: Optional[int] = None

    user_email: Optional[str] = None

    # =====================================================
    # WEATHER LOCATION
    # =====================================================

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    location: Optional[str] = None


class TTSRequest(BaseModel):
    text: str

    language_code: Optional[str] = "en-IN"

    speaker: Optional[str] = "shubh"


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Agri AI Backend is running",
        "voice": "Sarvam AI",
        "market_prices": "enabled",
        "weather": "enabled",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "market_prices": "enabled",
        "weather": "enabled",
    }


# =========================================================
# CREATE SESSION
# =========================================================

@app.post("/sessions")
def create_session(request: SessionCreate):

    if not request.user_id:
        raise HTTPException(
            status_code=400,
            detail="user_id is required",
        )

    title = (
        request.title.strip()
        if request.title
        else "New Chat"
    )

    if not title:
        title = "New Chat"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO sessions (user_id, title)
        VALUES (?, ?)
        """,
        (
            request.user_id,
            title[:100],
        ),
    )

    session_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "id": session_id,
        "session_id": session_id,
        "user_id": request.user_id,
        "title": title[:100],
    }


# =========================================================
# GET USER SESSIONS
# =========================================================

@app.get("/sessions/{user_id}")
def get_sessions(user_id: str):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            user_id,
            title,
            created_at,
            updated_at
        FROM sessions
        WHERE user_id = ?
        ORDER BY updated_at DESC, id DESC
        """,
        (user_id,),
    )

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row["id"],
            "user_id": row["user_id"],
            "title": row["title"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
        for row in rows
    ]


# =========================================================
# GET SESSION MESSAGES
# =========================================================

@app.get("/sessions/{session_id}/messages/{user_id}")
def get_session_messages(
    session_id: int,
    user_id: str,
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            session_id,
            user_id,
            role,
            content,
            confidence,
            sources,
            created_at
        FROM messages
        WHERE session_id = ?
        AND user_id = ?
        ORDER BY id ASC
        """,
        (
            session_id,
            user_id,
        ),
    )

    rows = cursor.fetchall()

    conn.close()

    result = []

    for row in rows:

        sources = []

        if row["sources"]:
            try:
                sources = json.loads(
                    row["sources"]
                )
            except Exception:
                sources = []

        result.append(
            {
                "id": row["id"],
                "session_id": row["session_id"],
                "user_id": row["user_id"],
                "role": row["role"],
                "content": row["content"],
                "confidence": row["confidence"],
                "sources": sources,
                "created_at": row["created_at"],
            }
        )

    return result


# =========================================================
# SAVE MESSAGE
# =========================================================

def save_message(
    session_id: int,
    user_id: str,
    role: str,
    content: str,
    confidence: Optional[float] = None,
    sources: Optional[list] = None,
):

    conn = get_db()
    cursor = conn.cursor()

    sources_json = json.dumps(
        sources or [],
        ensure_ascii=False,
    )

    cursor.execute(
        """
        INSERT INTO messages (
            session_id,
            user_id,
            role,
            content,
            confidence,
            sources
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            user_id,
            role,
            content,
            confidence,
            sources_json,
        ),
    )

    cursor.execute(
        """
        UPDATE sessions
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (session_id,),
    )

    conn.commit()
    conn.close()


# =========================================================
# CROP PRICE QUESTION DETECTION
# =========================================================

def is_crop_price_question(query: str) -> bool:

    q = query.lower().strip()

    price_keywords = [
        "price",
        "prices",
        "cost",
        "rate",
        "rates",
        "mandi",
        "market price",
        "market prices",
        "market rate",
        "market rates",
        "selling price",
        "current price",
        "current prices",
        "today price",
        "today's price",
        "today prices",
        "today's prices",
        "bhav",

        # Hindi
        "भाव",
        "कीमत",

        # Kannada
        "ಬೆಲೆ",
        "ದರ",

        # Tamil
        "விலை",

        # Telugu
        "ధర",
    ]

    crop_keywords = [
        # English
        "maize",
        "corn",
        "rice",
        "paddy",
        "wheat",
        "ragi",
        "millet",
        "jowar",
        "sorghum",
        "bajra",
        "groundnut",
        "peanut",
        "cotton",
        "sugarcane",
        "tur",
        "toor",
        "tur dal",
        "pigeon pea",
        "urad",
        "moong",
        "green gram",
        "black gram",
        "soybean",
        "soyabean",
        "tomato",
        "onion",
        "potato",
        "chilli",
        "chili",

        # Kannada
        "ಮೆಕ್ಕೆಜೋಳ",
        "ಅಕ್ಕಿ",
        "ಭತ್ತ",
        "ರಾಗಿ",
        "ಗೋಧಿ",
        "ಈರುಳ್ಳಿ",
        "ಟೊಮೇಟೊ",

        # Tamil
        "மக்காச்சோளம்",
        "நெல்",
        "கோதுமை",
        "மிளகாய்",

        # Telugu
        "మొక్కజొన్న",
        "గోధుమ",
        "ధాన్యం",

        # Hindi
        "गेहूं",
        "टमाटर",
        "प्याज",
    ]

    has_price_keyword = any(
        keyword in q
        for keyword in price_keywords
    )

    has_crop_keyword = any(
        keyword in q
        for keyword in crop_keywords
    )

    return (
        has_price_keyword
        and has_crop_keyword
    )


# =========================================================
# DETECT CROP
# =========================================================

def detect_crop(query: str) -> Optional[str]:

    q = query.lower()

    crop_map = {
        # English
        "maize": "Maize",
        "corn": "Maize",

        "rice": "Rice",
        "paddy": "Paddy",

        "wheat": "Wheat",

        "ragi": "Ragi",

        "millet": "Millet",

        "jowar": "Jowar",
        "sorghum": "Jowar",

        "bajra": "Bajra",

        "groundnut": "Groundnut",
        "peanut": "Groundnut",

        "cotton": "Cotton",

        "sugarcane": "Sugarcane",

        "tur": "Tur",
        "toor": "Tur",
        "pigeon pea": "Tur",

        "urad": "Urad",

        "moong": "Moong",
        "green gram": "Moong",

        "black gram": "Urad",

        "soybean": "Soybean",
        "soyabean": "Soybean",

        "tomato": "Tomato",

        "onion": "Onion",

        "potato": "Potato",

        "chilli": "Chilli",
        "chili": "Chilli",

        # Kannada
        "ಮೆಕ್ಕೆಜೋಳ": "Maize",
        "ಅಕ್ಕಿ": "Rice",
        "ಭತ್ತ": "Paddy",
        "ರಾಗಿ": "Ragi",
        "ಗೋಧಿ": "Wheat",
        "ಈರುಳ್ಳಿ": "Onion",
        "ಟೊಮೇಟೊ": "Tomato",

        # Tamil
        "மக்காச்சோளம்": "Maize",
        "நெல்": "Paddy",
        "கோதுமை": "Wheat",
        "மிளகாய்": "Chilli",

        # Telugu
        "మొక్కజొన్న": "Maize",
        "గోధుమ": "Wheat",
        "ధాన్యం": "Paddy",

        # Hindi
        "गेहूं": "Wheat",
        "टमाटर": "Tomato",
        "प्याज": "Onion",
    }

    for keyword in sorted(
        crop_map.keys(),
        key=len,
        reverse=True,
    ):

        if keyword in q:
            return crop_map[keyword]

    return None


# =========================================================
# DETECT STATE
# =========================================================

def detect_state(query: str) -> Optional[str]:

    q = query.lower().strip()

    states = {
        "andhra pradesh": "Andhra Pradesh",
        "arunachal pradesh": "Arunachal Pradesh",
        "assam": "Assam",
        "bihar": "Bihar",
        "chhattisgarh": "Chhattisgarh",
        "goa": "Goa",
        "gujarat": "Gujarat",
        "haryana": "Haryana",
        "himachal pradesh": "Himachal Pradesh",
        "jharkhand": "Jharkhand",
        "karnataka": "Karnataka",
        "kerala": "Kerala",
        "madhya pradesh": "Madhya Pradesh",
        "maharashtra": "Maharashtra",
        "manipur": "Manipur",
        "meghalaya": "Meghalaya",
        "mizoram": "Mizoram",
        "nagaland": "Nagaland",
        "odisha": "Odisha",
        "punjab": "Punjab",
        "rajasthan": "Rajasthan",
        "sikkim": "Sikkim",

        # Tamil Nadu - all common spellings
        "tamil nadu": "Tamil Nadu",
        "tamilnadu": "Tamil Nadu",
        "tamil-nadu": "Tamil Nadu",

        "telangana": "Telangana",
        "tripura": "Tripura",
        "uttar pradesh": "Uttar Pradesh",
        "uttarakhand": "Uttarakhand",
        "west bengal": "West Bengal",
        "delhi": "Delhi",
        "jammu and kashmir": "Jammu and Kashmir",
        "ladakh": "Ladakh",
    }

    for state_name in sorted(
        states.keys(),
        key=len,
        reverse=True,
    ):

        if state_name in q:
            return states[state_name]

    return None


# =========================================================
# WEATHER QUESTION DETECTION
# =========================================================

def is_weather_question(query: str) -> bool:

    q = query.lower().strip()

    weather_keywords = [
        "weather",
        "forecast",
        "temperature",
        "rain",
        "raining",
        "rainfall",
        "will it rain",
        "is it raining",
        "humidity",
        "wind",
        "windy",
        "cloud",
        "cloudy",
        "storm",
        "thunderstorm",
        "sunny",
        "hot",
        "cold",
        "climate",
        "today weather",
        "tomorrow weather",
        "weather today",
        "weather tomorrow",
        "weather now",
        "current weather",
        "current temperature",
        "today temperature",
        "tomorrow temperature",
        "today rain",
        "tomorrow rain",

        # Kannada
        "ಹವಾಮಾನ",
        "ಮಳೆ",
        "ತಾಪಮಾನ",
        "ಇಂದು ಹವಾಮಾನ",
        "ನಾಳೆ ಹವಾಮಾನ",
        "ಇಂದು ಮಳೆ",
        "ನಾಳೆ ಮಳೆ",

        # Hindi
        "मौसम",
        "बारिश",
        "तापमान",
        "आज का मौसम",
        "कल का मौसम",

        # Tamil
        "வானிலை",
        "மழை",
        "வெப்பநிலை",

        # Telugu
        "వాతావరణం",
        "వర్షం",
        "ఉష్ణోగ్రత",
    ]

    return any(
        keyword in q
        for keyword in weather_keywords
    )


# =========================================================
# FORMAT CROP PRICE RESPONSE
# =========================================================

def format_crop_price_response(
    crop: str,
    data: Any,
    state: Optional[str],
) -> tuple[str, list]:

    records = []

    if isinstance(data, list):

        records = data

    elif isinstance(data, dict):

        if isinstance(
            data.get("data"),
            list,
        ):

            records = data["data"]

        elif isinstance(
            data.get("records"),
            list,
        ):

            records = data["records"]

        elif isinstance(
            data.get("results"),
            list,
        ):

            records = data["results"]

        elif isinstance(
            data.get("data"),
            dict,
        ):

            nested = data["data"]

            if isinstance(
                nested.get("records"),
                list,
            ):

                records = nested["records"]

    if not records:

        if state:

            answer = (
                f"I couldn't find current mandi price "
                f"data for {crop} in {state}."
            )

        else:

            answer = (
                f"I couldn't find current mandi price "
                f"data for {crop} in India."
            )

        return answer, []

    if state:

        heading = (
            f"🌾 Current {crop} mandi prices "
            f"in {state}:"
        )

    else:

        heading = (
            f"🌾 Current {crop} mandi prices "
            f"in India:"
        )

    lines = [heading]

    sources = []

    for record in records[:10]:

        if not isinstance(record, dict):
            continue

        market = (
            record.get("market")
            or record.get("Market")
            or record.get("market_name")
            or "Unknown market"
        )

        district = (
            record.get("district")
            or record.get("District")
            or record.get("district_name")
            or ""
        )

        record_state = (
            record.get("state")
            or record.get("State")
            or state
            or ""
        )

        modal_price = (
            record.get("modal_price")
            or record.get("modal")
            or record.get("Modal Price")
            or record.get("modalPrice")
        )

        min_price = (
            record.get("min_price")
            or record.get("min")
            or record.get("Min Price")
            or record.get("minPrice")
        )

        max_price = (
            record.get("max_price")
            or record.get("max")
            or record.get("Max Price")
            or record.get("maxPrice")
        )

        date = (
            record.get("date")
            or record.get("arrival_date")
            or record.get("Arrival Date")
            or record.get("reported_date")
        )

        location = market

        if district:
            location += f", {district}"

        if not state and record_state:
            location += f", {record_state}"

        price_text = ""

        if modal_price is not None:
            price_text += (
                f"Modal: ₹{modal_price}/quintal"
            )

        if min_price is not None:
            price_text += (
                f" | Min: ₹{min_price}"
            )

        if max_price is not None:
            price_text += (
                f" | Max: ₹{max_price}"
            )

        if not price_text:
            price_text = "Price information unavailable"

        line = (
            f"• {location}: {price_text}"
        )

        if date:
            line += f" ({date})"

        lines.append(line)

        sources.append(
            {
                "source": "Mandi Price API",
                "state": record_state,
                "crop": crop,
                "market": market,
                "district": district,
                "date": date,
            }
        )

    lines.append(
        "\nPrices can vary by mandi, variety, "
        "quality and date."
    )

    lines.append(
        "These are mandi/wholesale market prices, "
        "not guaranteed farm-gate prices."
    )

    return "\n".join(lines), sources


# =========================================================
# CROP PRICE API ENDPOINT
# =========================================================

@app.get("/crop-prices")
def crop_prices(
    commodity: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
):

    commodity = commodity.strip()

    if not commodity:
        raise HTTPException(
            status_code=400,
            detail="commodity is required",
        )

    if state:
        state = state.strip()

        if not state:
            state = None

    try:

        if not state:

            result = get_crop_prices(
                commodity=commodity,
            )

        else:

            result = get_crop_prices(
                commodity=commodity,
                state=state,
                district=district,
                market=market,
            )

    except TypeError:

        if not state:

            result = get_crop_prices(
                commodity=commodity,
                state=None,
                district=district,
                market=market,
            )

        else:
            raise

    except Exception as error:

        print("\n" + "=" * 60)
        print("MARKET PRICE API ERROR")
        print(error)
        print("=" * 60)

        raise HTTPException(
            status_code=502,
            detail=(
                "Mandi price service failed: "
                f"{str(error)}"
            ),
        )

    if not result.get("success"):

        raise HTTPException(
            status_code=502,
            detail=result.get(
                "error",
                "Mandi price service failed.",
            ),
        )

    return result


# =========================================================
# WEATHER API ENDPOINT
# =========================================================

@app.get("/weather")
def weather_endpoint(
    latitude: float,
    longitude: float,
):

    try:

        result = get_weather(
            latitude=latitude,
            longitude=longitude,
        )

        if not result.get("success"):

            raise HTTPException(
                status_code=502,
                detail=(
                    result.get(
                        "error",
                        "Weather service failed.",
                    )
                ),
            )

        return result

    except HTTPException:
        raise

    except Exception as error:

        print("\n" + "=" * 60)
        print("WEATHER ENDPOINT ERROR")
        print(error)
        print("=" * 60)

        raise HTTPException(
            status_code=502,
            detail=(
                "Weather service failed: "
                f"{str(error)}"
            ),
        )


# =========================================================
# CHAT
# =========================================================

@app.post("/chat")
def chat(request: ChatRequest):

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    user_email = request.user_email

    if not user_email:
        raise HTTPException(
            status_code=400,
            detail="user_email is required",
        )

    session_id = request.session_id

    # =====================================================
    # CREATE SESSION IF NEEDED
    # =====================================================

    if not session_id:

        title = query[:60]

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO sessions
            (user_id, title)
            VALUES (?, ?)
            """,
            (
                user_email,
                title,
            ),
        )

        session_id = cursor.lastrowid

        conn.commit()
        conn.close()

    # =====================================================
    # SAVE USER MESSAGE
    # =====================================================

    save_message(
        session_id=session_id,
        user_id=user_email,
        role="user",
        content=query,
    )

    # =====================================================
    # WEATHER QUESTION
    # =====================================================

    if is_weather_question(query):

        print("\n" + "=" * 60)
        print("WEATHER QUESTION")
        print("Query:", query)
        print("Latitude:", request.latitude)
        print("Longitude:", request.longitude)
        print("Location:", request.location)
        print("=" * 60)

        # -------------------------------------------------
        # LOCATION REQUIRED
        # -------------------------------------------------

        if (
            request.latitude is None
            or request.longitude is None
        ):

            answer = (
                "📍 Please allow location access so I "
                "can provide the current weather for "
                "your area."
            )

            save_message(
                session_id=session_id,
                user_id=user_email,
                role="assistant",
                content=answer,
                confidence=None,
                sources=[],
            )

            return {
                "answer": answer,
                "confidence": None,
                "sources": [],
                "session_id": session_id,
                "language": request.language,
                "type": "weather",
            }

        try:

            weather_result = get_weather(
                latitude=request.latitude,
                longitude=request.longitude,
            )

            if weather_result.get("success"):

                answer, weather_sources = (
                    format_weather_response(
                        weather_data=weather_result,
                        language=request.language or "en",
                    )
                )

                save_message(
                    session_id=session_id,
                    user_id=user_email,
                    role="assistant",
                    content=answer,
                    confidence=None,
                    sources=weather_sources,
                )

                return {
                    "answer": answer,
                    "confidence": None,
                    "sources": weather_sources,
                    "session_id": session_id,
                    "language": request.language,
                    "type": "weather",
                    "location": request.location,
                    "latitude": request.latitude,
                    "longitude": request.longitude,
                }

            else:

                print(
                    "WEATHER API ERROR:",
                    weather_result.get("error"),
                )

                answer = (
                    "⚠️ I couldn't retrieve the current "
                    "weather right now. Please try again."
                )

                save_message(
                    session_id=session_id,
                    user_id=user_email,
                    role="assistant",
                    content=answer,
                    confidence=None,
                    sources=[],
                )

                return {
                    "answer": answer,
                    "confidence": None,
                    "sources": [],
                    "session_id": session_id,
                    "language": request.language,
                    "type": "weather",
                }

        except Exception as error:

            print("\n" + "=" * 60)
            print("WEATHER ERROR")
            print(error)
            print("=" * 60)

            answer = (
                "⚠️ I couldn't retrieve the current "
                "weather right now. Please try again."
            )

            save_message(
                session_id=session_id,
                user_id=user_email,
                role="assistant",
                content=answer,
                confidence=None,
                sources=[],
            )

            return {
                "answer": answer,
                "confidence": None,
                "sources": [],
                "session_id": session_id,
                "language": request.language,
                "type": "weather",
            }

    # =====================================================
    # CROP PRICE QUESTION
    # =====================================================

    if is_crop_price_question(query):

        crop = detect_crop(query)
        state = detect_state(query)

        print("\n" + "=" * 60)
        print("CROP PRICE QUESTION")
        print("Query:", query)
        print("Detected crop:", crop)

        if state:
            print("Detected state:", state)
        else:
            print("Detected state: INDIA")

        print("=" * 60)

        if crop:

            try:

                # -----------------------------------------
                # INDIA-WIDE
                # -----------------------------------------

                if state is None:

                    print(
                        "Searching mandi prices "
                        "across India..."
                    )

                    market_result = get_crop_prices(
                        commodity=crop,
                    )

                # -----------------------------------------
                # STATE-SPECIFIC
                # -----------------------------------------

                else:

                    print(
                        f"Searching {state} "
                        "mandi prices..."
                    )

                    market_result = get_crop_prices(
                        commodity=crop,
                        state=state,
                    )

                # -----------------------------------------
                # SUCCESS
                # -----------------------------------------

                if market_result.get("success"):

                    answer, price_sources = (
                        format_crop_price_response(
                            crop=crop,
                            data=market_result.get(
                                "data"
                            ),
                            state=state,
                        )
                    )

                    save_message(
                        session_id=session_id,
                        user_id=user_email,
                        role="assistant",
                        content=answer,
                        confidence=None,
                        sources=price_sources,
                    )

                    return {
                        "answer": answer,
                        "confidence": None,
                        "sources": price_sources,
                        "session_id": session_id,
                        "language": request.language,
                        "type": "market_price",
                        "crop": crop,
                        "state": state or "India",
                    }

                # -----------------------------------------
                # API FAILED
                # -----------------------------------------

                else:

                    print(
                        "MARKET PRICE ERROR:",
                        market_result.get(
                            "error"
                        ),
                    )

                    if state:

                        answer = (
                            f"⚠️ I couldn't retrieve "
                            f"the current {crop} mandi "
                            f"prices for {state} right now."
                        )

                    else:

                        answer = (
                            f"⚠️ I couldn't retrieve "
                            f"the current {crop} mandi "
                            f"prices in India right now."
                        )

                    save_message(
                        session_id=session_id,
                        user_id=user_email,
                        role="assistant",
                        content=answer,
                        confidence=None,
                        sources=[],
                    )

                    return {
                        "answer": answer,
                        "confidence": None,
                        "sources": [],
                        "session_id": session_id,
                        "language": request.language,
                        "type": "market_price",
                        "crop": crop,
                        "state": state or "India",
                    }

            except Exception as error:

                print("\n" + "=" * 60)
                print("MARKET PRICE ERROR")
                print(error)
                print("=" * 60)

                answer = (
                    f"⚠️ I couldn't retrieve "
                    f"the current {crop} market "
                    f"price right now."
                )

                save_message(
                    session_id=session_id,
                    user_id=user_email,
                    role="assistant",
                    content=answer,
                    confidence=None,
                    sources=[],
                )

                return {
                    "answer": answer,
                    "confidence": None,
                    "sources": [],
                    "session_id": session_id,
                    "language": request.language,
                    "type": "market_price",
                    "crop": crop,
                    "state": state or "India",
                }

        else:

            print(
                "Price question detected, "
                "but crop could not be identified."
            )

    # =====================================================
    # RAG / OPENAI
    # =====================================================

    try:

        result = get_rag_answer(
            query=query,
            language=request.language,
            history=request.history or [],
        )

    except TypeError:

        try:

            result = get_rag_answer(
                query,
                request.language,
                request.history or [],
            )

        except TypeError:

            result = get_rag_answer(query)

    except Exception as error:

        error_text = str(error)

        print("\n" + "=" * 60)
        print("RAG ERROR")
        print(error_text)
        print("=" * 60)

        # =================================================
        # OPENAI QUOTA / CREDIT ERROR
        # =================================================

        if (
            "insufficient_quota"
            in error_text.lower()
            or "credit_balance_exhausted"
            in error_text.lower()
            or "no credits remaining"
            in error_text.lower()
            or "429"
            in error_text
        ):

            answer = (
                "⚠️ The AI service is temporarily "
                "unavailable because the OpenAI API "
                "credits have been exhausted.\n\n"
                "Please add API credits to continue "
                "using AI agricultural advisory questions.\n\n"
                "Crop market-price and weather queries "
                "can still be used separately."
            )

            save_message(
                session_id=session_id,
                user_id=user_email,
                role="assistant",
                content=answer,
                confidence=None,
                sources=[],
            )

            return {
                "answer": answer,
                "confidence": None,
                "sources": [],
                "session_id": session_id,
                "language": request.language,
                "type": "quota_error",
            }

        # =================================================
        # OTHER RAG ERROR
        # =================================================

        raise HTTPException(
            status_code=500,
            detail=(
                "AI answer generation failed: "
                f"{error_text}"
            ),
        )

    # =====================================================
    # NORMALIZE RAG RESULT
    # =====================================================

    answer = ""
    confidence = None
    sources = []

    if isinstance(result, str):

        answer = result

    elif isinstance(result, dict):

        answer = (
            result.get("answer")
            or result.get("response")
            or result.get("message")
            or ""
        )

        confidence = result.get(
            "confidence"
        )

        sources = (
            result.get("sources")
            or result.get("source")
            or []
        )

    else:

        answer = str(result)

    if not answer:

        answer = (
            "I could not generate an answer."
        )

    # =====================================================
    # NORMALIZE CONFIDENCE
    # =====================================================

    if confidence is not None:

        try:

            confidence = float(
                confidence
            )

            if 0 <= confidence <= 1:
                confidence *= 100

        except Exception:

            confidence = None

    # =====================================================
    # NORMALIZE SOURCES
    # =====================================================

    if not isinstance(
        sources,
        list,
    ):

        sources = []

    normalized_sources = []

    for source in sources:

        if isinstance(
            source,
            dict,
        ):

            normalized_sources.append(
                {
                    "source": (
                        source.get("source")
                        or source.get("file")
                        or source.get("filename")
                    ),
                    "page": source.get(
                        "page"
                    ),
                    "chunk": source.get(
                        "chunk"
                    ),
                    "score": source.get(
                        "score"
                    ),
                }
            )

        else:

            normalized_sources.append(
                {
                    "source": str(source),
                    "page": None,
                    "chunk": None,
                    "score": None,
                }
            )

    # =====================================================
    # SAVE ASSISTANT MESSAGE
    # =====================================================

    save_message(
        session_id=session_id,
        user_id=user_email,
        role="assistant",
        content=answer,
        confidence=confidence,
        sources=normalized_sources,
    )

    return {
        "answer": answer,
        "confidence": confidence,
        "sources": normalized_sources,
        "session_id": session_id,
        "language": request.language,
        "type": "rag",
    }


# =========================================================
# SPEECH TO TEXT - SARVAM AI
# =========================================================

@app.post("/speech-to-text")
async def speech_to_text_endpoint(
    audio: UploadFile = File(...),
):

    if not audio:
        raise HTTPException(
            status_code=400,
            detail="Audio file is required",
        )

    try:

        audio_bytes = await audio.read()

        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file",
            )

        print("\n" + "=" * 60)
        print("SARVAM SPEECH TO TEXT")
        print("Filename:", audio.filename)
        print("Content type:", audio.content_type)
        print(
            "Audio size:",
            len(audio_bytes),
            "bytes",
        )
        print("=" * 60)

        result = speech_to_text(
            audio_bytes=audio_bytes,
            filename=(
                audio.filename
                or "audio.webm"
            ),
        )

        if isinstance(
            result,
            str,
        ):

            return {
                "text": result,
                "transcript": result,
                "language": None,
                "language_probability": None,
            }

        if isinstance(
            result,
            dict,
        ):

            transcript = (
                result.get("text")
                or result.get("transcript")
                or ""
            )

            return {
                "text": transcript,
                "transcript": transcript,
                "language": result.get(
                    "language"
                ),
                "language_probability": (
                    result.get(
                        "language_probability"
                    )
                ),
            }

        transcript = str(result)

        return {
            "text": transcript,
            "transcript": transcript,
            "language": None,
            "language_probability": None,
        }

    except HTTPException:
        raise

    except Exception as error:

        print("\n" + "=" * 60)
        print("SARVAM STT ERROR")
        print(error)
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=(
                "Speech recognition failed: "
                f"{str(error)}"
            ),
        )


# =========================================================
# TEXT TO SPEECH - SARVAM AI
# =========================================================

@app.post("/text-to-speech")
def text_to_speech_endpoint(
    request: TTSRequest,
):

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text is required",
        )

    text = text[:2500]

    supported_languages = {
        "en-IN",
        "kn-IN",
        "hi-IN",
        "bn-IN",
        "ta-IN",
        "te-IN",
        "ml-IN",
        "mr-IN",
        "gu-IN",
        "pa-IN",
        "od-IN",
    }

    if (
        request.language_code
        not in supported_languages
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported TTS language: "
                f"{request.language_code}"
            ),
        )

    try:

        print("\n" + "=" * 60)
        print("SARVAM TEXT TO SPEECH")
        print(
            "Language:",
            request.language_code,
        )
        print(
            "Speaker:",
            request.speaker,
        )
        print(
            "Text length:",
            len(text),
        )
        print("=" * 60)

        result = text_to_speech(
            text=text,
            language_code=(
                request.language_code
            ),
            speaker=(
                request.speaker
                or "shubh"
            ),
        )

        if isinstance(
            result,
            str,
        ):

            return {
                "audio": result,
                "audio_base64": result,
                "content_type": "audio/wav",
            }

        if isinstance(
            result,
            dict,
        ):

            audio = (
                result.get("audio")
                or result.get("audio_base64")
                or result.get("data")
            )

            if isinstance(
                audio,
                bytes,
            ):

                audio = (
                    base64.b64encode(
                        audio
                    ).decode("utf-8")
                )

            if not audio:

                raise RuntimeError(
                    "Sarvam returned no audio."
                )

            return {
                "audio": audio,
                "audio_base64": audio,
                "content_type": (
                    result.get(
                        "content_type"
                    )
                    or "audio/wav"
                ),
            }

        if isinstance(
            result,
            bytes,
        ):

            audio_base64 = (
                base64.b64encode(
                    result
                ).decode("utf-8")
            )

            return {
                "audio": audio_base64,
                "audio_base64": audio_base64,
                "content_type": "audio/wav",
            }

        raise RuntimeError(
            "Unsupported TTS response format."
        )

    except HTTPException:
        raise

    except Exception as error:

        print("\n" + "=" * 60)
        print("SARVAM TTS ERROR")
        print(error)
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=(
                "Text to speech failed: "
                f"{str(error)}"
            ),
        )


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )