const express = require('express'),
    request = require('request'),
    {google} = require('googleapis'),
    key = require('./firebase_key.json'),
    app = express();

function getAccessToken() {
    return new Promise(function (resolve, reject) {
         var jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            "https://www.googleapis.com/auth/firebase.messaging",
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}


app.get('/', (req, res) => {
    getAccessToken().then(authToken => {
        let options = {
            "uri": `https://fcm.googleapis.com/v1/projects/${key.project_id}/messages:send`,
            "method": "POST",
            "headers": {
                "Authorization": `Bearer ${authToken}`
            },
            "json": true,
            "body": {
                "message": {
                    "topic": "notifications",
                    "notification": {
                        "title": "Open the door!",
                        "body": "Someone's home!"
                    },
                    "android": {
                        "notification": {
                            "sound": "sound.mp3"
                        }
                    }
                }
            }
        };
        request(options, (err, resp, body) => {
            res.status(200).json(body);
        });
    }).catch(err => console.error(err));
});

app.listen(5000, '0.0.0.0');