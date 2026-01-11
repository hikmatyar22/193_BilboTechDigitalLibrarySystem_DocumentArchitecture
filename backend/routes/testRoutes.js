const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middlewares/apiKeyAuth');

router.get('/apikey', apiKeyAuth, (req, res) => {
  res.json({
    message: 'API Key valid',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
