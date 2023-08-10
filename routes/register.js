const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

// const baseUrl = "https://app.h4kig.com/";

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

let insertFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: baseUrl + "insert.php",
    formData: {
      insert_query: item,
      select_query: item2,
    },
  };
  return options;
};

router.post("/register", 
	[
		body('name')
      .trim()
      .notEmpty()
      .withMessage('Title Required')
      .matches(/^[a-zA-Z0-9\s]+$/)
      .withMessage('Only Characters with white space and numbers are allowed'),
		body('email')
			.trim()
			.notEmpty()
			.withMessage('Email Address required')
			.normalizeEmail()
			.isEmail()
			.withMessage('Invalid email or password'),
		body('password')
			.trim()
			.notEmpty()
			.withMessage('Password required')
			.isLength({min: 8})
			.withMessage('Password must be 8 characters long')
			.matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
	  	.matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
	  	.matches(/(?=.*?[0-9])/).withMessage('At least one Number')
	  	.matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
	  	.not().matches(/^$|\s+/).withMessage('White space not allowed'),
	  body('cpassword')
	  	  .notEmpty()
		    .withMessage('Confirm password is required')
		    .custom((value, { req }) => {
		        if (value !== req.body.password) {
		          throw new Error('Passwords do not match');
		        }
		        return true;
		    }),
	  body('phno')
	  	.custom(value => {
		    // Regular expression to match international phone numbers
		    // const phoneNumberRegex = /^[+]\d{1,3}[.\s-]?\d{3,}([.\s-]?\d{2,}){2,}$/;
		    // const phoneNumberRegex = /^[0-9-.+]+$/;
		    // const phoneNumberRegex = /^\+\d+$/;
		    const phoneNumberRegex = /^\+\d+\s\d*$/;

		    if (!phoneNumberRegex.test(value)) {
		      throw new Error('Invalid phone number format');
		    }

		    // Return true to indicate the validation succeeded
		    return true;
		  }),
	],
	async (req, res, next) => {
		const { name, email, password, cpassword, phno } = req.body;

		let isValid = false;
		let isLoggedInActive = false;

		let opt1 = selectFunction(
		  "select * from ec_customers where email = '"
		    .concat(`${email}`)
		    .concat("'")
		);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isValid,
					isLoggedInActive,
					errorMessage: error.array()[0].msg,
					oldInput: {
						name: name,
						phno: phno,
						email: email,
						password: password,
						cpassword: cpassword
					}
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
      		else {
        		let x = JSON.parse(response.body);
        		// console.log(x);

        		// console.log(response.body, x[0].phone, phno, x[0].phone === phno);

        		const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

        		// console.log(created_at);

        		// return res.json({'success': '1'});

        		if (x.length === 0) {
        			let opt2 = selectFunction(
							  "select * from ec_customers where phone = '"
							    .concat(`${phno}`)
							    .concat("'")
							);

							request(opt2, (error, response) => {
								if (error) throw new Error(error);
								else {
									let y = JSON.parse(response.body);

									// console.log(y);

									if (y.length === 0) {
			          		let values1 = `\'${name}\', '${email}\', '${password}\', '${phno}\', '${created_at}\', '${isLoggedInActive}\' , 'activated\'`;

					        	let opt3 = insertFunction(
					        		"insert into ec_customers (name, email, password, phone, created_at, isLoggedInActive, status) values(" 
					        			.concat(`${values1}`)
					        			.concat(")"),
										  "select * from ec_customers where email = '"
										    .concat(`${email}`)
										    .concat("'")
					        	);

						        request(opt3, (error, response) => {
				        			if (error) throw new Error(error);
				      				else {
				      					let z = JSON.parse(response.body);

				      					// console.log(z);

				      					if (z.length >= 1) {
				      						return res.json({
				      							isValid: true,
														isLoggedInActive: true,
														errorMessage: null,
														oldInput: {
															phno: '',
															email: '',
															password: '',
															cpassword: ''
														}
				      						})
				      					}

				      					else {
				      						return res.json({
				      							isValid: false,
				      							isLoggedInActive: false,
				      							errorMessage: 'Failed to add user... Try Again...',
				      							oldInput: {
															phno: '',
															email: '',
															password: '',
															cpassword: ''
														}
				      						})
				      					}
				      				}
				        		})
									}

									else {
										return res.json({
											isValid: false,
											isLoggedInActive: false,
											errorMessage: 'This Phone Number is already in use...',
											oldInput: {
												phno: phno,
												email: email,
												password: '',
												cpassword: ''
											}
										})
									}
								}
							})
        		}
        		else {
        			return res.json({
								isValid: false,
								isLoggedInActive: false,
								errorMessage: 'You are already registered... Please login...',
								oldInput: {
									phno: '',
									email: '',
									password: '',
									cpassword: ''
								}
							})
        		}
        	}
				})
			}
		}
		catch (error) {
			console.log(error);
			return res.json({
				isValid: false,
				isLoggedInActive: false,
				errorMessage: 'Failed',
				oldInput: {
					phno: '',
					email: '',
					password: '',
					cpassword: ''
				}
			})
		}
	}
)

module.exports = router;