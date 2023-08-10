const express = require('express');

const { param, validationResult } = require('express-validator');

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

router.get('/video/:id',
	[
		param('id')
      		.trim()
      		.notEmpty()
      		.withMessage('ID Required')
      		.matches(/^[0-9]*$/)
      		.withMessage('Only Characters with numbers are allowed')
	],
	async (req, res, next) => {
		const { id } = req.params;

		// console.log(id);

		let opt1 = selectFunction(
			"select * from videos where video_id = '"
				.concat(`${id}`)
				.concat("'")
		);

		// console.log(opt1);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isSuccess: false,
					videoUrl: "",
					errorMessage: error.array()[0].msg
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
		      		else {
		        		let x = JSON.parse(response.body);

		        		// console.log(x);

		        		if (x.length >= 1) {
		        			const video_url = x[0].video_url;
		        			return res.json({
								isSuccess: true,
								videoUrl: video_url,
								errorMessage: ""
							})
		        		}

		        		else {
		        			return res.json({
								isSuccess: false,
								videoUrl: "",
								errorMessage: "No data found..."
							})
		        		}
		        	}
				})
			}

		}

		catch(error) {
			return res.json({
				isSuccess: false,
				videoUrl: "",
				errorMessage: "No data found..."
			})
		}
})

module.exports = router;