if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");

const loginRoute = require('./routes/login');
const sendOtpRoute = require('./routes/sendOtp');
const verifyOtpRoute = require('./routes/verifyOtp');
const validateUserRoute = require('./routes/validateUser');
const checkSubRoute = require('./routes/checkSub');
const paymentRoute = require('./routes/payment');
const getVideoRoute = require('./routes/getVideo');
const getPlansRoute = require('./routes/plans');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));

app.use('/v1', loginRoute);
app.use('/v1', sendOtpRoute);
app.use('/v1', verifyOtpRoute);
app.use('/v1', validateUserRoute);
app.use('/v1', checkSubRoute);
app.use('/v1', paymentRoute);
app.use('/v1', getVideoRoute);
app.use('/v1', getPlansRoute);

app.get("/v1/success", (req, res, next) => {
	return res.send("Success");
})

app.listen(PORT, () => {
	console.log("Listening to localhost PORT 3000...");
})