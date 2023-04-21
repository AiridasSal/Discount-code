const express = require('express');
const router = express.Router();
const Subscriber = require('../subscriber');

router.get('/', (req, res) => {
  res.render('use-discount-code', { message: '' });
});

router.post('/use-discount-code', async (req, res) => {
  const { email, discountCode, orderNumber } = req.body;
  let message = '';

  try {
    const subscriber = await Subscriber.findOne({ email: email });

    if (!subscriber) {
      message = 'Email not found';
      res.status(404).json({ message });
    } else if (subscriber.discountCode !== discountCode) {
      message = 'Invalid discount code';
      res.status(400).json({ message });
    } else if (subscriber.discountUsed) {
      message = 'Discount code already used';
      res.status(400).json({ message });
    } else {
      subscriber.discountUsed = true;
      subscriber.discountedOrder = orderNumber;
      await subscriber.save();
      message = 'Discount code successfully used';
      res.status(200).json({ message });
    }
  } catch (error) {
    console.error(error);
    message = 'Server error';
    res.status(500).json({ message });
  }
});

module.exports = router;
