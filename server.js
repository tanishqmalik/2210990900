const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

// 👉 Replace THIS with your valid token (full string, no line breaks, no spaces)
const ACCESS_TOKEN = 'Bearer eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwjoxNZQZNTc0MzQ0LCJpYXQiOjE3NDM1NzQWNDQsImzcyI6IkFmZm9yZG11ZCIsImp0aSI6ImQ5Y2JiNjk5LTZhMjctNDRhNS04ZDU5LThiMWJ1ZmE4MTZkYSIsInN1YiI6InJhbWtyaXNobmFAYWJjLmVkdSJ9LCJbWFpbCI6InJhbWtyaXNobmFAYWJjLmVkdSIsIm5hbWUiOiJyYWOga3Jpc2huYSIsInJvbGx0byI6ImFhMWJiIiwiYWNjZXNzQ29kZSI6InhnQXNOQyIsImNsaWVudE1EIjoiZD1jYmI20TktNmEyNy00NGE1LThkNTktOGIxYmVmYTgxNmRhIiwiY2xpZW50U2VjcmV0IjoidFZKYWFhUkJTZVhjU1h1TSJ9.YApD98gq0IN_OWw7JMFmuUfK1m4hLTm7AIcLDcLAZVg';

const numberTypeMap = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand',
};

let numberWindow = [];

app.get('/numbers/:numberid', async (req, res) => {
  const type = req.params.numberid;

  if (!numberTypeMap[type]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const apiUrl = `http://20.244.56.144/evaluation-service/${numberTypeMap[type]}`;
  const windowPrevState = [...numberWindow];
  let numbers = [];

  try {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => source.cancel(), 1000);

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: ACCESS_TOKEN,
      },
      cancelToken: source.token,
    });

    clearTimeout(timeout);
    numbers = response.data.numbers || [];
  } catch (err) {
    console.error('Error fetching numbers:', err.message);
    return res.json({
      windowPrevState,
      windowCurrState: windowPrevState,
      numbers: [],
      avg: Number(calculateAverage(numberWindow).toFixed(2)),
    });
  }

  // Add only unique new numbers
  const uniqueNewNumbers = numbers.filter(num => !numberWindow.includes(num));
  numberWindow.push(...uniqueNewNumbers);

  // Keep only last WINDOW_SIZE numbers
  numberWindow = numberWindow.slice(-WINDOW_SIZE);

  const avg = calculateAverage(numberWindow);

  res.json({
    windowPrevState,
    windowCurrState: numberWindow,
    numbers,
    avg: Number(avg.toFixed(2)),
  });
});

function calculateAverage(nums) {
  if (!nums.length) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});