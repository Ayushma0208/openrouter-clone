async function run() {
    const res = await fetch("http://45.20.65.0:20000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma4:e4b",
        stream: false,
        messages: [{ role: "user", content: "Hello from my system" }]
      })
    });
  
    const text = await res.text();
  
    try {
      const data = JSON.parse(text);
  
      if (data.message?.content) {
        console.log("SUCCESS:\n", data.message.content);
      } else {
        console.log("JSON Response:", data);
      }
    } catch {
      console.log("Non-JSON response:", text);
    }
  }
  
  run().catch((err) => {
    console.error("Request failed:", err.message);
  });