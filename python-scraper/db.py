from dotenv import load_dotenv
import os
import sys
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    sys.exit("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment or .env")

supabase = create_client(url, key)
