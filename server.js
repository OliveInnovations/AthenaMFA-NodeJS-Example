'use strict';
const port = process.env.PORT || 1337;
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtect = csrf({ cookie: true });
const athena = require('athenamfa-api-integration');

const athenaKey = ""; //This is your api key for you application, you can get this from https://portal.athenamfa.com if you have not registered you can create a free account
const athenaReferer = ""; //This is a domain added to your application in the athenamfa portal, it must include the protocol for example https://example.com

athena.init(athenaKey, athenaReferer); //initialise the module here


app.use('/static', express.static(path.join(__dirname + '/public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', csrfProtect, function (req, res) {
    res.send(`<!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta charset="utf-8" />
                <title>AthenaMFA NodeJS Demo</title>
                <link rel="stylesheet" 
                            href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"
                            integrity="sha256-7ZWbZUAi97rkirk4DcEp4GWDPkWpRMcNaEyXGsNXjLg=" 
                            crossorigin="anonymous" />

                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/athenamfa@1.0.2/athenamfa.css" 
                            integrity="sha256-dEduQJaNzblTw8yKaGDv7sNK6q8LaW91hEbUfwLS2W4=" 
                            crossorigin="anonymous" />
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center mt-3 mb-3">AthenaMFA NodeJS Demo</h1>
                    <div class="card">
                        <div class="card-header">Simple Login Form</div>
                        <div class="card-body">
                            <form method="POST" action="/login" id="demoform">
                                <input type="hidden" name="_csrf" id="_csrf" value="${req.csrfToken()}" />
                                <div class="mb-3">
                                    <label for="email">Email: </label>
                                    <input type="email" class="form-control" id="email" name="email" required />
                                </div>
                                <div class="mb-3">
                                    <label for="password">Password: </label>
                                    <input type="password" class="form-control" id="password" name="password" required />
                                </div>
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-dark">Send</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"
                        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
                        crossorigin="anonymous"></script>

                <script src="/static/js/demoform.js"></script>

                <script src="https://cdn.jsdelivr.net/npm/athenamfa@1.0.2/athenamfa.js"
                        integrity="sha256-pu/DPhTLNL7oo4OitoaPAl6qDPQfK5GvIslTxqTuIPM="
                        crossorigin="anonymous">
                </script>

                <script type="text/javascript">
                    $(function () {
                        AthenaMfa.Init({
                            checkCallbackUrl: '/mfa/checkmfa',
                            validateResponseCodeUrl: '/mfa/validateresponsecode',
                            successRedirectUrl: '/authenticated',
                            csrfToken: '${req.csrfToken()}',
                            timeout: 1000
                        });
                    });
                </script>
            </body>
            </html>`);
});

app.get(`/authenticated`, function (req, res) {
    res.send("Congratulations you have successfully passed the AthenaMFA check");
});

app.post('/login', csrfProtect, function (req, res) {
    /*
     * Do some user validation here, aka make sure they exist and the enter password is correct.
     * Also there username might be differenent from their email address, so you might lookup the email address which you will send to request approval
     */

    athena.requestApproval(req.body.email, null, false).then((data) => {
        res.send(data);
    });
});

app.post('/mfa/checkmfa', csrfProtect, function (req, res) {
    /*
     * This is a called periodically by the athenamfa.js of the page to check if the user has approved
     * So just send the body to the athena module for validation
     */
    
    athena.checkForApprovalResponse(req.body).then((data) => {
        /*
         * the response here might be approved, if it is you would normally log your user in here
         * the response is sent back to the client and a redirect is dont
         */

        res.send(data);
    });
});

app.post('/mfa/validateresponsecode', csrfProtect, function (req, res) {
    /*
     * This is called when a user has entered a response code in the prompt
     * So just send the body to the athena module for validation
     */

    athena.validateRespondCode(req.body).then((data) => {
        /*
         * the response here might be approved, if it is you would normally log your user in here
         * the response is sent back to the client and a redirect is dont
         */

        res.send(data);
    });
});

app.listen(port);