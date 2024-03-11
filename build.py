import json
import subprocess

new_version = input("Enter new version tag: ")
path_to_package_json = "package.json"

# update package.json
with open(path_to_package_json, "r") as file:
  data = json.load(file)

data["version"] = new_version

with open(path_to_package_json, "w") as file:
  json.dump(data, file, indent = 2)

# build
subprocess.run("cross-env MODE=production npm run build && electron-builder build --config .electron-builder.config.js --config.asar=false", shell = True)
