import os
import cloudinary
import cloudinary.uploader
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_image(content: bytes, folder: str) -> str:
    result = cloudinary.uploader.upload(
        content,
        folder=f"buscar/{folder}",
        resource_type="image",
        transformation=[
            {"width": 1600, "height": 1200, "crop": "limit"},
            {"quality": "auto", "fetch_format": "auto"},
        ],
    )
    return result["secure_url"]


def delete_image(url: str) -> None:
    if not url or "cloudinary.com" not in url:
        return

    try:
        parts = url.split("/upload/")
        if len(parts) < 2:
            return
        path = parts[1].split("/", 1)[1]
        public_id = path.rsplit(".", 1)[0]
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        print(f"Erro ao remover imagem: {e}")