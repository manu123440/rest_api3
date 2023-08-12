const express = require('express');

const BlockBee = require('@blockbee/api');

const request = require('request');

const router = express.Router();

router.post('/payment', (req, res, next) => {
	const path = 'https://rest-api3-2qwx.onrender.com/v1/success';

	const options = {
	  'method': 'GET',
	  'url': `https://api.blockbee.io/checkout/request/?apikey=${process.env.API_KEY}&redirect_url=${path}&value=10&item_description=string&post=0`,
	  'headers': {
	  }
	};

	request(options, function (error, response) {
	  if (error) throw new Error(error);
	  else {
	  	// console.log(response.body);
	  	let x = JSON.parse(response.body);
	  	if (x.status === 'success') {
	  		// console.log(x);
	  		return res.json({
	  			'isSuccess': true,
	  			"payment_url": x.payment_url,
	  			"error": false
	  		})
	  	}
	  	else {
	  		return res.json({
	  			'isSuccess': false,
	  			"payment_url": '',
	  			'error': true
	  		})
	  	}
	  }
	}); 
})

module.exports = router;
