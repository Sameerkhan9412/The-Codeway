const axios = require('axios');

/**
 * Judge0 Status IDs:
 * 1 - In Queue
 * 2 - Processing
 * 3 - Accepted ✓
 * 4 - Wrong Answer
 * 5 - Time Limit Exceeded
 * 6 - Compilation Error
 * 7 - Runtime Error (SIGSEGV)
 * 8 - Runtime Error (SIGXFSZ)
 * 9 - Runtime Error (SIGFPE)
 * 10 - Runtime Error (SIGABRT)
 * 11 - Runtime Error (NZEC)
 * 12 - Runtime Error (Other)
 * 13 - Internal Error
 * 14 - Exec Format Error
 */

const getLanguageById = (lang) => {
  const normalizedLang = lang.toLowerCase();
  const language = {
    "c++": 54,
    "cpp": 54,
    "java": 91,
    "javascript": 93
  };

  return language[normalizedLang];
};


const SubmitBatch = async (submissions) => {
  // axios using
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE_0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE_0_HOST_API,
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  return await fetchData();
}

const waiting = (timer) => {
  return new Promise(resolve => setTimeout(resolve, timer));
}

const submitToken = async (resultToken) => {


  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE_0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE_0_HOST_API
    }
  };

  async function fetchData() {
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000; // 1 second

    while (true) {
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          // Too Many Requests - implement exponential backoff
          if (retryCount >= maxRetries) {
            throw new Error('Exceeded maximum retries due to rate limiting');
          }
          const delay = baseDelay * Math.pow(2, retryCount);
          console.warn(`Rate limited by Judge0 API. Retrying after ${delay} ms...`);
          await waiting(delay);
          retryCount++;
        } else {
          console.error(error);
          throw error;
        }
      }
    }
  }


  while (true) {

    const result = await fetchData();


    // here the result status id should be greater than 2 or else call again 
    const isResultObtained = await result.submissions.every((r) => r.status.id > 2);

    if (isResultObtained) {
      return result.submissions;
    }

    // here calling the function again after 1second  

    await waiting(1000);
  }
}
module.exports = { getLanguageById, SubmitBatch, submitToken }
