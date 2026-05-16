import axios from 'axios';

async function test() {
  try {
    console.log("Attempting to fetch http://localhost:4000/...");
    const res = await axios.get('http://localhost:4000/', { timeout: 5000 });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

test();
