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
	const phone = req.query.phno;

	const replacedPhno = phone.replace(/_/g, " ").replace(/^(\d+)/, "+$1");

	// console.log(replacedPhno);

	try {
		let opt1 = updateFunction(
<<<<<<< HEAD
			"update users set telegram = 'ab' where phone = '"
        .concat(`${replacedPhno}`)
        .concat("'"),
			"select * from users where phone = '"
        .concat(`${replacedPhno}`)
        .concat("'")
=======
			"update users set telegram = 'ab' where phone = '+91 7579127430'",
			"select * from users where phone = '+91 7579127430'"
>>>>>>> 3ad972862fd5aa89199a7b4aa5750d52a1f6f04b
		);

		request(opt1, (error, response) => {
            if (error) throw new Error(error);
            else {
                let z = JSON.parse(response.body);

<<<<<<< HEAD
                // console.log(z);
=======
                console.log(z);
>>>>>>> 3ad972862fd5aa89199a7b4aa5750d52a1f6f04b

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
