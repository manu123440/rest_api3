const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

const baseUrl = "http://bhaveshnetflix.live/";

let selectFunction = (item) => {
  let options = {
    method: "POST",
    url: baseUrl + "select.php",
    formData: {
      select_query: item,
    },
  };
  return options;
};

router.post('/payment',
	[
		body('phno').custom(value => {
		    // Regular expression to match international phone numbers

		    const phoneNumberRegex = /^\+\d+\s\d*$/;

		    if (!phoneNumberRegex.test(value)) {
		      throw new Error('Invalid phone number format');
		    }

		    // Return true to indicate the validation succeeded
		    return true;
		}),
		body('id')
			.trim()
			.notEmpty()
			.withMessage('Order ID required'),
		body('amount')
			.trim()
			.notEmpty()
			.withMessage('Amount required')
      .matches(/^[0-9]*\.?[0-9]*$/)
      .withMessage('Contains only numbers'),
		body('currency')
      .trim()
      .notEmpty()
      .withMessage('Currency required')
      .isIn(['btc', 'eth', 'usdt', 'ada', 'bnb', 
                'xrp', 'sol', 'dot', 'doge', 'ltc'])
      .withMessage('This is not a valid Currency'),
	],
 	async (req, res, next) => {
		const { phno, id, amount, currency } = req.body;

		// fetch data from database
		let opt1 = selectFunction(
			"select * from users where phone = '"
				.concat(`${phno}`)
				.concat("'")
		);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isSuccess: false,
					url: '',
			    errorMessage: error.array()[0].msg
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
					else {
						const modifiedNumber = phno.replace(/\+/g, '').replace(/\s/g, '_');
						console.log(modifiedNumber);

						const options = {
						  method: 'POST',
						  url: 'https://api-sandbox.coingate.com/api/v2/orders',
						  headers: {
						    accept: 'application/json',
						    Authorization: 'Token BWodS1EkFyiKSVnu8vCJZA2DGtYSJnuirzvZMyde',
						    'content-type': 'application/x-www-form-urlencoded'
						  },
						  form: {
						    callback_url: `https://rest-api3-2qwx.onrender.com/v1/notify/?phno=${modifiedNumber}`,
						    cancel_url: `https://rest-api3-2qwx.onrender.com/v1/cancel/?phno=${modifiedNumber}`,
						    success_url: `https://rest-api3-2qwx.onrender.com/v1/success/?phno=${modifiedNumber}`,
						    callback_url: 'https://rest-api3-2qwx.onrender.com/v1/notify',
						    cancel_url: 'https://rest-api3-2qwx.onrender.com/v1/cancel',
						    success_url: 'https://rest-api3-2qwx.onrender.com/v1/success',
						    receive_currency: currency,
						    price_currency: currency,
						    price_amount: amount,
						    order_id: id,
						    purchaser_email: 'hi@gmail.com'
						  }
						};

						request(options, function (error, response) {
						  if (error) throw new Error(error);
						  else {
						  	let x = JSON.parse(response.body);

						  	// console.log(x);
						  	if (x.payment_url) {
						  		return res.json({
						  			isSuccess: true,
						  			url: x.payment_url,
						  			errorMessage: ''
						  		})
						  	}
						  }
						});
					}
				})
			}
		}
		catch(error) {
			// console.log(error);
			return res.json({
				isSuccess: false,
				url: '',
			  errorMessage: "Invalid phone number, Try Again...."
			})
		}
	}
)

module.exports = router;
