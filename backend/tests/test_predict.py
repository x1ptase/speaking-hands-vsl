
import json
import urllib.request
import urllib.error
from pathlib import Path

SAMPLE_PATH = Path(__file__).resolve().parent / "sample_sequence.json"
API_URL = "http://127.0.0.1:8000/api/recognition/predict"


def main():
    if not SAMPLE_PATH.exists():
        print(f"Sample file not found: {SAMPLE_PATH}")
        return

    with SAMPLE_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    # File sample có dạng {"sequence": [...]}
    if isinstance(data, dict):
        sequence = data.get("sequence")
    else:
        sequence = data

    if not isinstance(sequence, list) or not sequence:
        print("Invalid sequence: expected a non-empty list.")
        return

    print(f"Frames: {len(sequence)}")
    print("Sending request to FastAPI...")

    payload = json.dumps({"sequence": sequence}).encode("utf-8")

    request = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            print("HTTP Status:", response.status)
            print("Response:", response.read().decode("utf-8"))

    except urllib.error.HTTPError as error:
        print("HTTP Status:", error.code)
        print("Response:", error.read().decode("utf-8"))

    except urllib.error.URLError as error:
        print("Cannot connect to FastAPI:", error.reason)


if __name__ == "__main__":
    main()
