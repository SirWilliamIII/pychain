import os
import json

# Data directory - configurable via environment variable
DATA_DIR = os.environ.get("DATA_DIR", "./data")

# In-memory fallback storage for Heroku
MEMORY_STORAGE = {
    'blockchain': None,
    'node': None
}

def _ensure_data_dir():
    """Ensure data directory exists."""
    if not os.environ.get("DATABASE_URL"):  # Not on Heroku
        os.makedirs(DATA_DIR, exist_ok=True)

def get_db_path(filename):
    """Get the appropriate database path based on environment."""
    if os.environ.get("DATABASE_URL"):  # We're on Heroku
        return os.path.join("/tmp", filename)
    _ensure_data_dir()
    return os.path.join(DATA_DIR, filename)

def save_data(filename, data):
    """Save data to file or memory depending on environment."""
    if os.environ.get("DATABASE_URL"):  # We're on Heroku
        key = filename.replace('.txt', '')
        MEMORY_STORAGE[key] = data
    else:
        with open(get_db_path(filename), 'w') as f:
            if isinstance(data, (dict, list)):
                json.dump(data, f)
            else:
                f.write(str(data))

def load_data(filename):
    """Load data from file or memory depending on environment."""
    if os.environ.get("DATABASE_URL"):  # We're on Heroku
        key = filename.replace('.txt', '')
        return MEMORY_STORAGE.get(key)
    try:
        with open(get_db_path(filename), 'r') as f:
            if filename.endswith('.txt'):
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return f.read().strip()
    except (IOError, IndexError, FileNotFoundError):
        return None
