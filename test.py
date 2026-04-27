import requests

url = "http://localhost:11434/api/generate"

data = {
    "model": "gemma4:e4b",
    "prompt": "Explain quantum superposition in simple terms",
    "stream": False
}

response = requests.post(url, json=data)
print(response.json()["response"])