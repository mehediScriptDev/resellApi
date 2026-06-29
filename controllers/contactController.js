const Contact = require('../models/Contact');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contact = await Contact.create({ name, email, message });
    res.status(201).json({ success: true, data: contact, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
