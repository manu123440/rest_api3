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
          days_remaining: '',
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

            if (x.length !== 0 && x[0].sub_date === 'null') {
              // redirect to payment page
              return res.json({
                isActive: false,
                errorMessage: 'Please Buy Subscription...',
                days_remaining: '',
                oldInput: {
                  phno: ''
                }
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

                      return res.json({
                        isActive: true,
                        errorMessage: '',
                        days_remaining: days_remaining,
                        oldInput: {
                          phno: ''
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
                days_remaining: '',
                oldInput: {
                  phno: ''
                }
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
        oldInput: {
          phno: ''
        }
      })
    }
})

module.exports = router;