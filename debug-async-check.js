const express = require('express');
const app = express();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fakeSendEmail = async () => {
    console.log('Start sending email...');
    await sleep(5000); // Simulate 5s delay
    console.log('Email sent!');
};

app.get('/test-blocking', async (req, res) => {
    console.log('Request received');

    // Blocking way (old)
    // await fakeSendEmail();

    // Non-blocking way (new)
    fakeSendEmail().then(() => console.log('Background task done'));

    res.json({ msg: 'Success (immediate)' });
});

const server = app.listen(5001, () => {
    console.log('Test server running on port 5001');

    // Self-test
    const axios = require('axios');
    const start = Date.now();
    axios.get('http://localhost:5001/test-blocking')
        .then(res => {
            console.log('Response received in:', (Date.now() - start) + 'ms');
            server.close();
        })
        .catch(err => console.error(err));
});
