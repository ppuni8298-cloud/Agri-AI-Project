import os
import base64
import tempfile
import requests

from dotenv import load_dotenv
from sarvamai import SarvamAI


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

if not SARVAM_API_KEY:
    raise RuntimeError(
        "SARVAM_API_KEY is missing from backend/.env"
    )


# =========================================================
# SARVAM CLIENT
# =========================================================

sarvam = SarvamAI(
    api_subscription_key=SARVAM_API_KEY
)


# =========================================================
# CONSTANTS
# =========================================================

STT_MODEL = "saaras:v3"
TTS_MODEL = "bulbul:v3"

# Keeping this lower reduces TTS generation time.
MAX_TTS_CHARS = 1800

SUPPORTED_TTS_LANGUAGES = {
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

TTS_URL = "https://api.sarvam.ai/text-to-speech"


# =========================================================
# SPEECH TO TEXT
# =========================================================

def speech_to_text(
    audio_bytes: bytes,
    filename: str = "audio.webm",
):
    """
    Convert recorded audio to text using Sarvam AI.

    Sarvam model:
        saaras:v3

    Language:
        unknown

    Returns:
        {
            "text": "...",
            "language": "...",
            "language_probability": ...
        }
    """

    if not audio_bytes:
        raise ValueError("Audio data is empty.")

    suffix = os.path.splitext(filename)[1]

    if not suffix:
        suffix = ".webm"

    temp_path = None

    try:

        # -------------------------------------------------
        # Save temporary audio
        # -------------------------------------------------

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp:

            temp.write(audio_bytes)
            temp.flush()

            temp_path = temp.name

        # -------------------------------------------------
        # SARVAM STT
        # -------------------------------------------------

        print(
            f"Sarvam STT: {STT_MODEL} | "
            f"{len(audio_bytes) / 1024:.1f} KB"
        )

        with open(
            temp_path,
            "rb",
        ) as audio_file:

            response = (
                sarvam
                .speech_to_text
                .transcribe(
                    file=audio_file,
                    model=STT_MODEL,
                    mode="transcribe",
                    language_code="unknown",
                )
            )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        transcript = getattr(
            response,
            "transcript",
            "",
        )

        detected_language = getattr(
            response,
            "language_code",
            None,
        )

        if not detected_language:
            detected_language = getattr(
                response,
                "language",
                None,
            )

        language_probability = getattr(
            response,
            "language_probability",
            None,
        )

        transcript = (
            transcript or ""
        ).strip()

        print(
            "Sarvam STT transcript:",
            transcript,
        )

        print(
            "Sarvam STT language:",
            detected_language,
        )

        return {
            "text": transcript,
            "language": detected_language,
            "language_probability": language_probability,
        }

    except Exception as exc:

        print(
            "Sarvam STT error:",
            repr(exc),
        )

        raise RuntimeError(
            f"Sarvam STT failed: {exc}"
        ) from exc

    finally:

        # -------------------------------------------------
        # Remove temporary file
        # -------------------------------------------------

        if (
            temp_path
            and os.path.exists(temp_path)
        ):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# =========================================================
# TEXT TO SPEECH
# =========================================================

def text_to_speech(
    text: str,
    language_code: str,
    speaker: str = "shubh",
):
    """
    Convert text to WAV audio using Sarvam AI.

    Sarvam model:
        bulbul:v3

    Returns:
        raw WAV bytes
    """

    if not text or not text.strip():
        raise ValueError(
            "Text is required."
        )

    # -----------------------------------------------------
    # CLEAN TEXT
    # -----------------------------------------------------

    text = text.strip()

    # Smaller text means faster TTS generation.
    if len(text) > MAX_TTS_CHARS:
        text = text[:MAX_TTS_CHARS]

        # Avoid cutting in the middle of a word.
        last_space = text.rfind(" ")

        if last_space > 500:
            text = text[:last_space]

    # -----------------------------------------------------
    # LANGUAGE VALIDATION
    # -----------------------------------------------------

    language_code = (
        language_code or ""
    ).strip()

    if language_code not in SUPPORTED_TTS_LANGUAGES:

        raise ValueError(
            f"Unsupported TTS language: "
            f"{language_code}"
        )

    # -----------------------------------------------------
    # LOG
    # -----------------------------------------------------

    print(
        f"Sarvam TTS: {TTS_MODEL} | "
        f"{language_code} | "
        f"{len(text)} chars"
    )

    # -----------------------------------------------------
    # HEADERS
    # -----------------------------------------------------

    headers = {
        "api-subscription-key":
            SARVAM_API_KEY,

        "Content-Type":
            "application/json",
    }

    # -----------------------------------------------------
    # PAYLOAD
    # -----------------------------------------------------

    payload = {
        "text": text,

        "target_language_code":
            language_code,

        "speaker":
            speaker,

        "model":
            TTS_MODEL,

        "output_audio_codec":
            "wav",
    }

    # -----------------------------------------------------
    # REQUEST
    # -----------------------------------------------------

    try:

        response = requests.post(
            TTS_URL,
            headers=headers,
            json=payload,
            timeout=45,
        )

    except requests.Timeout as exc:

        raise RuntimeError(
            "Sarvam TTS request timed out."
        ) from exc

    except requests.RequestException as exc:

        raise RuntimeError(
            f"Sarvam TTS network error: {exc}"
        ) from exc

    # -----------------------------------------------------
    # HTTP STATUS
    # -----------------------------------------------------

    if not response.ok:

        try:
            error_data = response.json()
        except Exception:
            error_data = response.text

        print(
            "Sarvam TTS error:",
            error_data,
        )

        raise RuntimeError(
            f"Sarvam TTS API error "
            f"{response.status_code}: "
            f"{error_data}"
        )

    # -----------------------------------------------------
    # JSON
    # -----------------------------------------------------

    try:

        data = response.json()

    except Exception as exc:

        raise RuntimeError(
            "Sarvam TTS returned invalid JSON."
        ) from exc

    # -----------------------------------------------------
    # AUDIO
    # -----------------------------------------------------

    audios = data.get(
        "audios",
        [],
    )

    if not audios:
        raise RuntimeError(
            "Sarvam TTS returned no audio."
        )

    audio_base64 = "".join(
        audios
    )

    if not audio_base64:
        raise RuntimeError(
            "Sarvam TTS returned empty audio."
        )

    # -----------------------------------------------------
    # DECODE
    # -----------------------------------------------------

    try:

        audio_bytes = base64.b64decode(
            audio_base64
        )

    except Exception as exc:

        raise RuntimeError(
            "Could not decode Sarvam TTS audio."
        ) from exc

    if not audio_bytes:
        raise RuntimeError(
            "Decoded Sarvam audio is empty."
        )

    print(
        f"Sarvam TTS audio: "
        f"{len(audio_bytes) / 1024:.1f} KB"
    )

    return audio_bytes