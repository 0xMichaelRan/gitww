from pathlib import Path

# Create a data directory in your project root
DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True) 