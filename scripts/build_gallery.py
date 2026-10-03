from pathlib import Path
import json, re

root = Path(__file__).resolve().parents[1]
works = root / "galerie" / "oeuvres"
out = root / "galerie" / "oeuvres.json"
items = []
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def webpath(path: Path) -> str:
    return path.relative_to(root / "galerie").as_posix()

def detail_key(path: Path):
    m = re.search(r"detail[-_ ]?(\d+)", path.stem, re.I)
    return (int(m.group(1)) if m else 999999, path.name.lower())

for fiche in sorted(works.glob("*/fiche.json")):
    folder = fiche.parent
    slug = folder.name
    data = json.loads(fiche.read_text(encoding="utf-8"))
    data["slug"] = slug

    images = [p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS]
    principales = sorted([p for p in images if p.stem.lower() == "principale"])
    # Une seule convention : "principale" désigne la photo principale.
    # Toutes les autres images du dossier deviennent automatiquement des détails.
    details = sorted([p for p in images if p.stem.lower() != "principale"], key=lambda p: p.name.lower())

    # Nouveau système : les noms de fichiers suffisent.
    if principales:
        data["photo_principale"] = webpath(principales[0])
    else:
        # Compatibilité avec Lunaison tant que ses anciennes photos n'ont pas été déplacées.
        old = data.get("photo_principale", "")
        if old and not old.startswith(("http://", "https://", "/")):
            old = (Path("oeuvres") / slug / old).as_posix()
        data["photo_principale"] = old

    if details:
        data["photos_details"] = [webpath(p) for p in details]
    else:
        old_details = []
        for value in data.get("photos_details", []):
            if value and not value.startswith(("http://", "https://", "/")):
                value = (Path("oeuvres") / slug / value).as_posix()
            old_details.append(value)
        data["photos_details"] = old_details

    items.append(data)

out.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(items)} œuvre(s) -> {out}")
