import argparse
import base64
from sarvamai import SarvamAI


def text_to_speech(api_key, text, output_file, speaker):
    client = SarvamAI(api_subscription_key=api_key)

    print("Generating speech...")

    response = client.text_to_speech.convert(
        text=text,
        target_language_code="en-IN",
        speaker=speaker,
    )

    # Get audio data
    audio_base64 = response.audios[0]

    # Decode base64 audio
    audio_bytes = base64.b64decode(audio_base64)

    # Save audio file
    with open(output_file, "wb") as f:
        f.write(audio_bytes)

    print(f"✅ Audio saved as {output_file}")


def speech_to_text(api_key, audio_file):
    client = SarvamAI(api_subscription_key=api_key)

    print("Transcribing audio...")

    with open(audio_file, "rb") as f:
        response = client.speech_to_text.transcribe(file=f)

    print("\n===== TRANSCRIPT =====\n")

    try:
        print(response.transcript)
    except:
        print(response)


def main():

    parser = argparse.ArgumentParser(
        description="Sarvam AI Text-to-Speech and Speech-to-Text"
    )

    parser.add_argument(
        "--api_key",
        required=True,
        help="Sarvam AI API Key"
    )

    subparsers = parser.add_subparsers(dest="command")


    # Text To Speech
    tts = subparsers.add_parser("tts")

    tts.add_argument(
        "--text",
        required=True
    )

    tts.add_argument(
        "--output",
        default="output.wav"
    )

    tts.add_argument(
        "--speaker",
        default="anushka"
    )


    # Speech To Text
    stt = subparsers.add_parser("stt")

    stt.add_argument(
        "--audio",
        required=True
    )


    args = parser.parse_args()


    if args.command == "tts":

        text_to_speech(
            args.api_key,
            args.text,
            args.output,
            args.speaker
        )


    elif args.command == "stt":

        speech_to_text(
            args.api_key,
            args.audio
        )


    else:
        parser.print_help()



if __name__ == "__main__":
    main()