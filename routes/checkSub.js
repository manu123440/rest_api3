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

router.post('/checkSub',
  [
    body('phno').custom(value => {
      const phoneNumberRegex = /^\+\d+\s\d*$/;

      if (!phoneNumberRegex.test(value)) {
        throw new Error('Invalid phone number format');
      }

      // Return true to indicate the validation succeeded
      return true;
    }),
  ],
  async (req, res, next) => {
    const { phno } = req.body;

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
          errorMessage: error.array()[0].msg,
          days_remaining: ''
        })
      }

      else {
        request(opt1, (error, response) => {
          if (error) throw new Error(error);
          else {
            let x = JSON.parse(response.body);

            // console.log(x);

            if (x.length !== 0 && x[0].sub_date === 'null') {
              // redirect to payment page
              return res.json({
                isActive: false,
                errorMessage: 'Please Buy Subscription...',
                days_remaining: ''
              })
            }

            else if (x.length !== 0 && x[0].sub_date !== 'null') {
              // return number of days
              const subDate = new Date(x[0].sub_date).getTime();

              const plan_id = Number(x[0].plan_id);

              const now = new Date().getTime();

              const next = now - subDate;

              const days = Math.floor(next / (24*60*60*1000));

              // console.log(next, typeof next, days, typeof days);

              if (plan_id !== 'null') {
                let opt2 = selectFunction(
                  "select no_of_days from plan where id = '"
                    .concat(`${plan_id}`)
                    .concat("'")
                );

                request(opt2, (error, response) => {
                  if (error) throw new Error(error);
                  else {
                    let y = JSON.parse(response.body);

                    // console.log(y);

                    if (y.length >= 1) {
                      const no_of_days = Number(y[0].no_of_days);

                      // console.log(no_of_days);

                      const days_remaining = no_of_days - days;

                      let opt3 = updateFunction(
                        "update users set no_of_days = '"
                          .concat(`${days_remaining}`)
                          .concat("' where phone = '")
                          .concat(`${phno}`)
                          .concat("'"),
                        "select * from users where phone = '"
                          .concat(`${phno}`)
                          .concat("'")
                      );

                      // console.log(opt3);

                      request(opt3, (error, response) => {
                        if (error) throw new Error(error);
                        else {
                          let z = JSON.parse(response.body);

                          // console.log(z);

                          if (z.length >= 1) {
                            return res.json({
                              isActive: true,
                              errorMessage: '',
                              days_remaining: days_remaining,
                            })
                          }

                          else {
                            return res.json({
                              isActive: true,
                              errorMessage: 'Try again...',
                              days_remaining: days_remaining,
                            })
                          }
                        }
                      })
                    }

                    else {
                      return;
                    }
                  }
                })
              }

              else {
                return;
              }
            }

            else {
              // invalid phone number
              return res.json({
                isActive: false,
                errorMessage: 'Phone Number not registered...',
                days_remaining: ''
              })
            }
          }
        })
      }
    }

    catch(error) {
      return res.json({
        isActive: false,
        errorMessage: 'Failed...',
        days_remaining: '',
      })
    }
})

module.exports = router;