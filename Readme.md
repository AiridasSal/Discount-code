Discount Code Generator
This is a Node.js application that fetches contacts from Omnisend and generates a discount code for new subscribers. It then saves the new subscribers' email addresses and generated discount codes to a MongoDB database and sends a POST request for each newly added email using Axios to trigger a workflow on Microsoft Power Automate that sends an email to the new subscriber with the discount code.

Installation
Clone the repository.
Install the required dependencies using npm: npm install
Create a .env file in the root directory of the project and add the following variables:

MONGODB_URI=<your MongoDB URI>
PORT=<port number>
Replace the value of X-API-KEY in line 49 of index.js with your Omnisend API key.
Replace the value of url in line 57 of index.js with the URL of your Power Automate workflow.
Usage
Start the application using the following command:


npm start
This will start the server and fetch new contacts every minute from Omnisend. If there are new subscribers, their email addresses and generated discount codes will be saved to the database and a POST request will be sent for each newly added email to trigger a workflow on Power Automate that sends an email to the new subscriber with the discount code. The API endpoint /api/discount can be used to retrieve the list of subscribers and their discount codes.

Dependencies
This project uses the following dependencies:

dotenv
node-cron
express
mongoose
body-parser
axios
morgan
cors
License
This project is licensed under the MIT License. See the LICENSE file for details.