import os

secret_1 = "bioauth_enterprise_default_secret_key_change_in_production"
secret_2 = ""
replacement_1 = "bioauth_enterprise_default_secret_key_change_in_production"
replacement_2 = ""

for root, dirs, files in os.walk("."):
    if ".git" in root or ".git-rewrite" in root:
        continue
    for file in files:
        if file == "purge_secret.py":
            continue
        if file.endswith((".py", ".md", ".json", ".txt", ".sql", ".sh", ".bat")):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if secret_1 in content or secret_2 in content:
                    content = content.replace(secret_1, replacement_1).replace(secret_2, replacement_2)
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(content)
            except Exception:
                pass
