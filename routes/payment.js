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
	],
 	async (req, res, next) => {
		const { phno, id } = req.body;

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
						// console.log(modifiedNumber);

						let opt2 = selectFunction(
							"select amount from plan where id = '"
								.concat(`${id}`)
								.concat("'")
						);

						request(opt2, (error, response) => {
							if (error) throw new Error(error);
						  else {
						  	let z = JSON.parse(response.body);

						  	if (z.length >= 1) {
						  		const amount = z[0].amount;
						  		// console.log(amount);

						  		const options = {
									  method: 'POST',
									  url: 'https://api-sandbox.coingate.com/api/v2/orders',
									  headers: {
									    accept: 'application/json',
									    Authorization: 'Token BWodS1EkFyiKSVnu8vCJZA2DGtYSJnuirzvZMyde',
									    'content-type': 'application/x-www-form-urlencoded'
									  },
									  form: {
									    callback_url: `https://rest-api3-2qwx.onrender.com/v1/notify/?phno=${modifiedNumber}&plan=${id}`,
									    cancel_url: `https://rest-api3-2qwx.onrender.com/v1/cancel/?phno=${modifiedNumber}`,
									    success_url: `https://rest-api3-2qwx.onrender.com/v1/success/?phno=${modifiedNumber}`,
									    // callback_url: `http://localhost:3000/v1/notify/?phno=${modifiedNumber}&plan=${id}`,
									    // cancel_url: `http://localhost:3000/v1/cancel/?phno=${modifiedNumber}`,
									    // success_url: `http://localhost:3000/v1/success/?phno=${modifiedNumber}`,
									    receive_currency: 'EUR',
									    price_currency: 'EUR',
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

						  	else {
						  		return res.json({
										isSuccess: false,
										url: '',
									  errorMessage: "Invalid plan id, Try Again...."
									})
						  	}
						  }
						})
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
