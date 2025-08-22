import sys
try:
    import pkg_resources
except ImportError:
    print("Error: pkg_resources not found. Please run 'pip install setuptools'.")
    sys.exit(1)

print("--- Python Environment Diagnosis ---")
print(f"Python Executable Path: {sys.executable}")
print(f"Python Version: {sys.version}")
print("\n--- Installed AI Libraries ---")

libraries = ["torch", "transformers", "datasets", "peft", "trl", "accelerate", "bitsandbytes"]
for lib in libraries:
    try:
        version = pkg_resources.get_distribution(lib).version
        print(f"- {lib}: {version}")
    except pkg_resources.DistributionNotFound:
        print(f"- {lib}: NOT FOUND")
print("---------------------------------")