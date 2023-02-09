/*Developers Details:
* David Daida - 313374373
* Carmel Bar - 207895103
*/
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Importing the database connection
require('./models/database');

// Importing the router modules
const indexRouter = require('./routes/index');
const aboutRouter = require('./routes/about');

// Importing the required models and functions from the database module
const { createNewCost, createNewReport, Cost, Report } = require("./models/database");
const { model } = require("mongoose");
const { log } = require("debug");

// Initializing the express app
const app = express();

// Importing the developers details from the aboutRouter
const { developersDetails } = aboutRouter;

// Setting up the view engine and the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Initializing the arrays to store cost data for different categories
const food = [];
const transportation = [];
const health = [];
const housing = [];
const sport = [];
const education = [];
const other = [];
const resultArray = { "food": food, "transportation": transportation, "health": health, "housing": housing, "sport": sport, "education": education, "other": other };

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Router setup
app.use('/', indexRouter);

// Route for adding new costs
app.use('/addcost/', function (req, res) {
    // Wrapping the add cost logic in a Promise
    new Promise(async (resolve, reject) => {
        try {
            // Calling the createNewCost function to add a new cost
            await createNewCost(req.body.user_id, req.body.day, req.body.month, req.body.year, req.body.description, req.body.category, req.body.sum);
            // Resolving the promise with a success message
            resolve({ message: 'Cost added Successfully', status: 201 });
        } catch (e) {
            // Rejecting the promise with an error message
            reject({ error: `${e} Invalid request`, status: 500 });
        }
    })
        .then(result => res.status(result.status).json(result.message))
        .catch(error => res.status(error.status).json(error.error));
});

// Route for getting the developers details
app.use('/about/', function (req, res) {
    // Sending the developers details
    res.send(developersDetails());
});

app.use('/report/', function(req, res) {
    new Promise(async (resolve, reject) => {
        let q = req.url.split('?'), result = {};
        splitUrl(q,result);
        let resultComputed = await Report.find({user_id: result.user_id, month: result.month, year: result.year});
        // Check if a report with the given parameters exists
        if (resultComputed[0] != undefined) {
            console.log("Computed result");
            resultComputed.map(doc => resultArray[doc.category].push({"day":doc.day,"description":doc.description,"sum":doc.sum}));
            resolve({resultArray, status: 200});
        } else {
            let resultMatch = await Cost.find({user_id: result.user_id, month: result.month, year: result.year});
            // If no report exists, match with costs
            resultMatch.map(doc =>resultArray[doc.category].push({"day":doc.day,"description":doc.description,"sum":doc.sum}));
            try {
                // Validate the month and year
                monthValidate(result.month);
                yearValidate(result.year);
                // Create a new report
                resultMatch.map(doc => {
                    createNewReport(doc.user_id,doc.day,doc.month,doc.year,doc.description,doc.category,doc.sum);
                });
                resolve({resultArray,status: 200});
            } catch (err) {
                // Return error if invalid
                reject({error: `${err} Invalid request`, status: 500});
            }
        }
    })
        .then(result => res.status(result.status).json(resultArray))
        .catch(error => res.status(error.status).json(error.error));
    clearArrays();
});

// Function to split the URL
function splitUrl(url,result) {
    if (url.length >= 2) {
        // Split the URL by '&' and add each parameter to the result object
        url[1].split('&').forEach(item => {
            try {
                result[item.split('=')[0]] = item.split('=')[1];
            } catch (e) {
                result[item.split('=')[0]] = '';
            }
        });
    }
}

// Function to validate the month
function monthValidate(currentMonth)
{
    if(!(currentMonth>=1&&currentMonth<=12))
    {
        throw new Error("Month not valid")
    }
}

// Function to validate the year
function yearValidate(currentYear)
{
    if(!(currentYear>=1900&&currentYear<=2100))
    {
        throw new Error("Year not valid")
    }
}

// Function to clear the result arrays
function clearArrays() {
    for(const array in resultArray)
    {
        resultArray[array].length=0;
    }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;