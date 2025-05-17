#!/usr/bin/env python
"""
This script runs afterprint("✅ Made husky.sh executable")

# Create .nvmrc file with the Node.js version
node_version = "22.11.0"  # Use the same version as in package.json
nvmrc_path = os.path.join(os.getcwd(), ".nvmrc")
with open(nvmrc_path, "w") as f:
    f.write(node_version)
print(f"✅ Created .nvmrc file with Node.js v{node_version}")

print("\n✅ Husky hooks are now executable.")
print("✨ Project successfully generated!")

# Initialize git repository if it doesn't already exist
git_dir = os.path.join(os.getcwd(), ".git")
if not os.path.exists(git_dir):
    os.system("git init")
    print("✅ Git repository initialized")
    
    # Properly initialize Husky
    print("Setting up Husky...")
    run_command("npm run prepare", cwd=os.getcwd())
    print("✅ Husky initialized")

    # Setup initial commit
    os.system('git add .')is generated.
It makes the Husky hooks executable and sets up the git hooks.
"""
import os
import stat
import sys
import subprocess
import platform

# Get the project slug from the cookiecutter variables
project_slug = "{{ cookiecutter.project_slug }}"

def run_command(command, cwd=None):
    """Run a shell command and return its output."""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True,
            capture_output=True,
            text=True,
            cwd=cwd
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {command}")
        print(f"Error: {e.stderr}")
        return None

# Make Husky hooks executable
husky_dir = os.path.join(os.getcwd(), ".husky")
if os.path.exists(husky_dir):
    print("Setting up Husky hooks...")
    for hook_file in ["pre-commit", "commit-msg"]:
        hook_path = os.path.join(husky_dir, hook_file)
        if os.path.exists(hook_path):
            # Add executable permission
            current_permissions = os.stat(hook_path).st_mode
            os.chmod(hook_path, current_permissions | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
            print(f"✅ Made {hook_file} hook executable")

    # Make husky.sh executable too
    husky_sh = os.path.join(husky_dir, "_", "husky.sh")
    if os.path.exists(husky_sh):
        current_permissions = os.stat(husky_sh).st_mode
        os.chmod(husky_sh, current_permissions | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        print("✅ Made husky.sh executable")

print("\n✅ Husky hooks are now executable.")
print("✨ Project successfully generated!")

# Initialize git repository if it doesn't already exist
git_dir = os.path.join(os.getcwd(), ".git")
if not os.path.exists(git_dir):
    os.system("git init")
    print("✅ Git repository initialized")

    # Setup initial commit
    os.system('git add .')
    os.system('git commit --no-verify -m "chore: initial commit"')
    print("✅ Initial commit created")

print("\n🚀 Next steps:")
print("  cd {{cookiecutter.project_slug}}")
print("  pnpm install")
print("  pnpm run start:dev")
