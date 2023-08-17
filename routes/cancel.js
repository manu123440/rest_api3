const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

router.get('/cancel', async (req, res, next) => {
	const phone = req.query.phno;

	const replacedPhno = phone.replace(/_/g, " ").replace(/^(\d+)/, "+$1");

	console.log(replacedPhno);

	return res.send("cancel");

	// try {}
	// catch(error) {}
})

module.exports = router;