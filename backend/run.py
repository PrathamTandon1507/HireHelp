import sys
import os
import subprocess
import time

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
sys.path.insert(0, backend_dir)
sys.path.insert(0, project_root)

def kill_port(port=8000):
    """Kill any process using the given port."""
    try:
        result = subprocess.run(
            f'netstat -ano | findstr :{port}',
            shell=True, capture_output=True, text=True
        )
        pids = set()
        for line in result.stdout.splitlines():
            parts = line.strip().split()
            if parts:
                pid = parts[-1]
                if pid.isdigit() and int(pid) > 0:
                    pids.add(pid)
        for pid in pids:
            subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
            print(f"  Killed PID {pid} (was holding port {port})")
        if pids:
            time.sleep(1)
    except Exception as e:
        print(f"Warning during port cleanup: {e}")

if __name__ == "__main__":
    print(f"=== HireHelp Backend Startup ===")
    print("Clearing port 8000...")
    kill_port(8000)
    print("Port 8000 is free. Starting uvicorn...")
    
    # Set PYTHONPATH for the environment to ensure uvicorn finds all modules
    os.environ["PYTHONPATH"] = f"{project_root};{backend_dir};" + os.environ.get("PYTHONPATH", "")
    
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)