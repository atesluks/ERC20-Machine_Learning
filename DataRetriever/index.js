// Improting required libraries for working with the filesystem and HTTP requests
const fs = require('fs');
const axios = require('axios');

// List of ERC20 tokens for which the data should be collected
const TOKENS = ['UNI', 'LINK', 'AAVE', 'MKR', 'FTT', 'AMP', 'LEO', 'COMP', 'GRT', 'HT', 'CEL', 'CHZ', 'TEL', 'YFI', 'HOT', 'ENJ', 'SUSHI', 'MANA', 'QNT', 'BAT', 'SNX', 'NEXO', 'BNT', 'CRV', 'CHSB', 'KCS', 'ZRX', 'UMA', 'ANKR', 'VGX', '1INCH'];

// API Key settings
const API_KEYS = ['4250F621-E075-46FC-8DA9-646D89B3489C', '92877E56-7AE5-44E9-9861-9D0388301E11'];
// Index that tracks which API key is used
let currAPIKeyIndex = 0;
// An http options object
const httpOptions = {
    method: 'GET',
    hostname: 'rest.coinapi.io',
    headers: { 'X-CoinAPI-Key': API_KEYS[0] },
};

// A method that sends an HTTP request to the CoinAPI
const retriveData = (token, startDate) => {
    const url = `http://rest.coinapi.io/v1/ohlcv/${token}/ETH/history?period_id=1HRS&time_start=${startDate}&time_end=2021-07-01T00:00:00`;
    return axios.get(url, httpOptions).catch(error => {
        console.error('ERROR when sending a request');
        return;
    });
};

// A method that parses response data in the required format and saves it as a text file
const parseAndSaveData = (file, rawData) => {
    const data = rawData.data;
    let timePeriodEnd;

    for (let i = 0; i < data.length; i++) {
        const currData = data[i];
        let row = `${currData.time_period_end}\t${currData.price_open}\t${currData.price_high}\t${currData.price_low}\t${currData.price_close}\t${currData.volume_traded}\t${currData.trades_count}\n`;

        fs.appendFileSync(file, row, error => {
            if (error) {
                console.error('ERROR when writing a file');
                return;
            }
        });

        timePeriodEnd = currData.time_period_end;
    }

    return timePeriodEnd;
};

// A method that launches the proecss of retrieving the data of the tokens and writing it to a file
const startRetrievingData = async () => {
    const START_DATE = '2017-01-01T00:00:00.0000000Z';
    const i = 30;

    //start loop
    const token = TOKENS[i];

    let currentStartDate = START_DATE;

    // Sending requests until all data till 1st of July 2021 is retrievid
    while (currentStartDate !== START_DATE) {
        // console.log(`Retrieving for this date ${currentStartDate}`);
        const result = await retriveData(token, currentStartDate);
        if (result) {
            currentStartDate = await parseAndSaveData(`DataFiles2/${token}.txt`, result);
            // console.log(`--- lastEndDate = ${currentStartDate}`);
            if (!currentStartDate) {
                // console.log('Error when appending data');
                // console.log(`Finished at ${token} with currentStartDate=${currentStartDate}`);
                return;
            }
        } else {
            // Selecting new API key
            currAPIKeyIndex++;
            httpOptions.headers = { 'X-CoinAPI-Key': API_KEYS[currAPIKeyIndex] };
        }
    }
};

// Script launsher
startRetrievingData();
