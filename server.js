require('dotenv').config()
const cron = require('node-cron');
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const axios = require('axios');
const Subscriber = require('./subscriber')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const discountRoute = require('./routes/discount');
const path = require('path');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => console.log('Connected to MongoDB'))


function generateDiscountCode() {
  return Math.random().toString(36).substr(2, 10).toUpperCase();
}

async function saveEmailsToDatabase(emails) {
  const newEmails = [];
  const promises = emails.map(async (email) => {
    const existingSubscriber = await Subscriber.findOne({ email: email });

    if (!existingSubscriber) {
      const discountCode = generateDiscountCode();
      const newSubscriber = new Subscriber({ email: email, addedAt: new Date(), discountCode: discountCode });
      await newSubscriber.save();
      newEmails.push({ email: email, discountCode: discountCode });
    }
  });

  try {
    await Promise.all(promises);
    console.log('Emails saved to the database');
    if (newEmails.length > 0) {
      console.log('Newly added emails:', newEmails);

      // Send POST request for each newly added email
      const postPromises = newEmails.map(async (emailObj) => {
        try {
          await axios.post(process.env.POWER_AUTOMATE, {
            email: emailObj.email,
            discountCode: emailObj.discountCode,
            discountLink: emailObj.discountLink
          });
          console.log(`POST request sent for email: ${emailObj.email}`);
        } catch (error) {
          console.error(`Error sending POST request for email: ${emailObj.email}`, error);
        }
      });
      

      await Promise.all(postPromises);
    } else {
      console.log('No new emails added');
    }
  } catch (error) {
    console.error('Error saving emails to the database:', error);
  }
}


cron.schedule('* * * * *', () => {
  console.log('Task running every minute:', new Date());
  const options = {
    method: 'GET',
    url: 'https://api.omnisend.com/v3/contacts?limit=250',
    headers: {
      accept: 'application/json',
      'X-API-KEY': process.env.OMNISEND_API_KEY
    }
  };

  function fetchContacts(url, allContacts = []) {
    axios
      .get(url, options)
      .then(async (response) => {
        const newContacts = response.data.contacts;
        const nextUrl = response.data.paging.next;
        const updatedContacts = allContacts.concat(newContacts);

        if (nextUrl) {
          // If the next URL is provided, fetch the next page of contacts
          fetchContacts(nextUrl, updatedContacts);
        } else {
          // If there's no next URL, save the emails to the database
          const emails = updatedContacts.map((contact) => contact.email);
          await saveEmailsToDatabase(emails);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Start fetching contacts
  fetchContacts(options.url);
});
app.use('/api', discountRoute);

function logRoutes(app) {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path} (direct)`);
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`${handler.route.stack[0].method.toUpperCase()} ${handler.route.path} (in '${middleware.regexp}' middleware)`);
        }
      });
    }
  });
}
logRoutes(app);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port', process.env.PORT || 3000)
})