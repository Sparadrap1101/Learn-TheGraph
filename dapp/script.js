const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

const API_URL = process.env["API_URL"];
if (!API_URL) {
    throw new Error('API_URL is empty ? check .env file !');
}

const main = async () => {
    try {
        let test = 1;
        const result = await axios.post(API_URL, {
            query: `{
              owners {
                id
                tokens {
                  id
                }
              }
            }`,
        });

        console.log("Results are:", result.data.data.owners);
    } catch (error) {
        console.error(error);
    }
};

main();
