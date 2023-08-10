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

router.post('/validate',
	[
	  	body('phno').custom(value => {
			// Regular expression to match international phone numbers
			// const phoneNumberRegex = /^[+]\d{1,3}[.\s-]?\d{3,}([.\s-]?\d{2,}){2,}$/;
			// const phoneNumberRegex = /^\+\d\s+$/;
			const phoneNumberRegex = /^\+\d+\s\d*$/;

			if (!phoneNumberRegex.test(value)) {
			  throw new Error('Invalid phone number format');
			}

			// Return true to indicate the validation succeeded
			return true;
		}),
		body('imei')
			.trim()
			.notEmpty()
			.withMessage('imei required')
			.isNumeric()
			.withMessage('must be a 16 digit number'),
	], 
	async (req, res, next) => {
		const { phno, imei } = req.body;

		let opt1 = selectFunction(
			"select imei from users where phone = '"
				.concat(`${phno}`)
				.concat("'")
		);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isSuccess: false,
					errorMessage: error.array()[0].msg,
					oldInput: {
						phno: phno
					}
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
					else {
						let x = JSON.parse(response.body);

						// console.log(x);

						if (x.length >= 1) {
							// console.log(x[0].imei, imei, x[0].imei == imei);

							if (Number(x[0].imei) === Number(imei)) {
								return res.json({
									isSuccess: true,
									errorMessage: '',
									oldInput: {
										phno: ''
									}
								}) 
							}

							else {
								return res.json({
									isSuccess: false,
									errorMessage: 'Invalid IMEI...',
									oldInput: {
										phno: phno
									}
								})
							}
						}

						else {
							return res.json({
								isSuccess: false,
								errorMessage: 'Invalid IMEI...',
								oldInput: {
									phno: phno
								}
							})
						}
					}
				})
			}
		}

		catch(error) {
			return res.json({
				isSuccess: false,
				errorMessage: 'Failed',
				oldInput: {
					phno: phno
				}
			})
		}
})

module.exports = router;