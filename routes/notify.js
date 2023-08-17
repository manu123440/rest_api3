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

let updateFunction = (item, item2) => {
  let options = {
      method: "POST",
      url: baseUrl + "update.php",
      formData: {
        update_query: item,
        select_query: item2,
      },
    };
    return options;
}

router.post('/notify', async (req, res, next) => {
	// const phone = req.query.order_id;

	// const replacedPhno = phone.replace(/_/g, " ").replace(/^(\d+)/, "+$1");

	// console.log(replacedPhno);

	try {
		let opt1 = updateFunction(
			"update users set telegram = 'ab' where phone = '+91 7579127430'",
			"select * from users where phone = '+91 7579127430'"
		);

		request(opt1, (error, response) => {
            if (error) throw new Error(error);
            else {
                let z = JSON.parse(response.body);

                console.log(z);

                if (z.length >= 1) {
                	return res.json({
                		success: true
                	})
                }

                else {
                	return res.json({
                		success: false
                	})
                }
            }
        })
	}
	catch(error) {
		return res.json({
            success: false
        })
	}
})

module.exports = router;
