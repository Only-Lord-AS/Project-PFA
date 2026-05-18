"""Run migration + populate products."""
import subprocess, sys, os

backend_dir = r"C:\laragon\Project-PFA-main\backend"
python = os.path.join(r"C:\laragon\Project-PFA\venv\Scripts", "python.exe")

print("=== Step 1: Making migration ===")
subprocess.run([python, "manage.py", "makemigrations", "catalogue", "--name", "photo_urlfield"], cwd=backend_dir, check=True)

print("\n=== Step 2: Applying migration ===")
subprocess.run([python, "manage.py", "migrate"], cwd=backend_dir, check=True)

print("\n=== Step 3: Populating products ===")
subprocess.run([python, "manage.py", "populate_products"], cwd=backend_dir, check=True)

print("\n=== ALL DONE ===")
