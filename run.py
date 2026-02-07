import os
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent


def is_windows():
    return platform.system().lower() == "windows"


def command_exists(cmd):
    if is_windows():
        return shutil.which(cmd) is not None
    return shutil.which(cmd) is not None


def run_command(cmd, cwd=None):
    print(f"\n>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    return result.returncode == 0


def parse_node_version(output):
    match = re.search(r"v?(\d+)\.(\d+)\.(\d+)", output.strip())
    if not match:
        return None
    return tuple(int(part) for part in match.groups())


def get_node_version():
    try:
        output = subprocess.check_output("node -v", shell=True, text=True)
    except Exception:
        return None
    return parse_node_version(output)


def prompt_install(name):
    answer = input(f"{name} is missing. Install now? [Y/n]: ").strip().lower()
    return answer in ("", "y", "yes")


def get_available_installer():
    if is_windows():
        if command_exists("winget"):
            return "winget"
        if command_exists("choco"):
            return "choco"
        if command_exists("scoop"):
            return "scoop"
        return None

    if command_exists("brew"):
        return "brew"
    if command_exists("apt-get"):
        return "apt"
    if command_exists("dnf"):
        return "dnf"
    if command_exists("pacman"):
        return "pacman"
    return None


def install_node(installer):
    if installer == "winget":
        return run_command("winget install --id OpenJS.NodeJS.LTS -e --source winget")
    if installer == "choco":
        return run_command("choco install -y nodejs-lts")
    if installer == "scoop":
        return run_command("scoop install nodejs-lts")
    if installer == "brew":
        return run_command("brew install node@18")
    if installer == "apt":
        return run_command("sudo apt-get update && sudo apt-get install -y nodejs npm")
    if installer == "dnf":
        return run_command("sudo dnf install -y nodejs")
    if installer == "pacman":
        return run_command("sudo pacman -S --noconfirm nodejs npm")
    return False


def install_rust(installer):
    if installer == "winget":
        return run_command("winget install --id Rustlang.Rustup -e --source winget")
    if installer == "choco":
        return run_command("choco install -y rustup.install")
    if installer == "scoop":
        return run_command("scoop install rustup")
    if installer == "brew":
        return run_command("brew install rustup")
    if installer in ("apt", "dnf", "pacman"):
        return run_command("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y")
    return False


def install_git(installer):
    if installer == "winget":
        return run_command("winget install --id Git.Git -e --source winget")
    if installer == "choco":
        return run_command("choco install -y git")
    if installer == "scoop":
        return run_command("scoop install git")
    if installer == "brew":
        return run_command("brew install git")
    if installer == "apt":
        return run_command("sudo apt-get update && sudo apt-get install -y git")
    if installer == "dnf":
        return run_command("sudo dnf install -y git")
    if installer == "pacman":
        return run_command("sudo pacman -S --noconfirm git")
    return False


def ensure_prerequisites():
    installer = get_available_installer()
    if installer is None:
        print("No supported package manager found. Install prerequisites manually:")
        print("- Node.js v18+\n- Rust (rustup)\n- Git")
        return False

    ok = True

    node_version = get_node_version()
    if node_version is None or node_version < (18, 0, 0):
        print("Node.js v18+ is required.")
        if prompt_install("Node.js"):
            ok = install_node(installer)
    
    if not command_exists("rustup") and not command_exists("cargo"):
        print("Rust (rustup) is required.")
        if prompt_install("Rust (rustup)"):
            ok = install_rust(installer) and ok

    if not command_exists("git"):
        print("Git is required.")
        if prompt_install("Git"):
            ok = install_git(installer) and ok

    return ok


def ensure_node_modules():
    node_modules = ROOT_DIR / "node_modules"
    if node_modules.exists():
        return True
    print("Node dependencies not found. Installing...")
    return run_command("npm install", cwd=str(ROOT_DIR))


def run_app():
    return run_command("npm run tauri dev", cwd=str(ROOT_DIR))


def main():
    os.chdir(ROOT_DIR)
    print("Checking prerequisites...")
    if not ensure_prerequisites():
        print("Prerequisite check failed. Please resolve and re-run.")
        sys.exit(1)

    if not ensure_node_modules():
        print("Failed to install npm dependencies.")
        sys.exit(1)

    print("Launching app...")
    if not run_app():
        print("App failed to start.")
        sys.exit(1)


if __name__ == "__main__":
    main()
