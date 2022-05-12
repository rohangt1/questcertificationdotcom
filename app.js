const admin = require('firebase-admin');
const express = require('express');
const app = express();
const cors=require('cors');
app.use(cors());
const saltedMd5 = require('salted-md5');
const path=require('path');
app.set('views', path.join(__dirname, 'static', 'views'));
app.use('/public', express.static(path.join(__dirname, 'static', 'public')));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const multer = require('multer');
const upload = multer();
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const REFRESH_TOKEN = "1//04yzwNi5Oat9ACgYIARAAGAQSNwF-L9IrDiA7xPrH81AzJBpZMunFj8EzHj5BvLq2nn-be65T7c5l8CRWSXlVEKX5EAGvwv1KREE";
const CLIENT_SECRET = "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";
const CLIENT_ID = "399895146559-tl1o2l6e41h1rsvts0mjqo6cn5qlsd9e.apps.googleusercontent.com";
app.listen(process.env.PORT || 5000,()=>
{
    console.log(`APP IS RUNNING AT 5000`)
})
app.get('/testurl', (req, res) => {
    //res.send('Heroku working V6');
    //console.log(req.url);
    res.send("Heroku version 11");
});
app.post('/authenticatemoreinfo', (req, res) => {
    var serviceAccount = require('./admin.json');
    var client;
    if (!admin.apps.length) {
        client = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
            authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
        });
    }else {
        client = admin.app(); // if already initialized, use that one
        // client.delete();
        // client = admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccount),
        //     databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
        //     authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
        // });
    }
    var db=admin.database();
    var userRef=db.ref("auth_users");
    //res.send(userremoved === "0" ? "Selected user not found": "Selected user removed successfully");
    verifyUser({
        username: req.body.username, 
        password: req.body.password, 
    })
    function verifyUser(obj) {
        //console.log(req.body.username);
        //console.log(req.body.password);
        userRef.on('value', (snapshot) => {
            var stringrecord = JSON.stringify(snapshot);
            //console.log(stringrecord);
            recordsets = stringrecord.substring(1, stringrecord.length - 2).split("},");
            for (var intIdx = recordsets.length - 1; intIdx >= 0; intIdx--)
            {
                //var uid = recordsets[intIdx].split('":{')[0].substring(1);
                var username = recordsets[intIdx].split('":"')[2];
                username = username.substring(0, username.length - 1)
                var password = recordsets[intIdx].split('":"')[1].split('","')[0];
                if (username === req.body.username && password === req.body.password) {
                    client.delete();
                    res.send(req.body.username + "-->" + req.body.password);
                    return;
                }
            }
            client.delete();
            res.send('Incorrect username or password');
        }, (errorObject) => {

        }); 
    }
});
app.post('/authenticatemanageusers', (req, res) => {
    //res.send('Heroku working V6');
    if (req.body.username === 'admin' && req.body.password === 'quest')
    {
        res.send(req.body.username + "-->" + req.body.password);
    }
    else res.send("Incorrect username or password");
});
app.post('/addauthuser', (req, res) => {
    //console.log("addauthuser executing");
    if (req.body.adminusername === 'admin' && req.body.adminpassword === 'quest')
    {
        var serviceAccount = require('./admin.json');
        var client;
        if (!admin.apps.length) {
            client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
                authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
            });
        }else {
            client = admin.app(); // if already initialized, use that one
            client.delete();
            client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
                authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
            });
        }
        var db=admin.database();
        var userRef=db.ref("auth_users");
        addUser({
            username: req.body.username, 
            password: req.body.password, 
        })
        function addUser(obj) {
            var oneUser=userRef.child(Date.now());
            oneUser.update(obj,(err)=>{
                if(err){
                    res.send('Something went wrong. Please submit again.');
                }
                else res.send('User Added Successfully');
                client.delete();
                //process.exit(1);
            })
        }
    }
    else res.send("Restricted access");
});
app.post('/removeauthusers', (req, res) => {
    if (req.body.adminusername === 'admin' && req.body.adminpassword === 'quest')
    {
        var serviceAccount = require('./admin.json');
        var client;
        if (!admin.apps.length) {
            client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
                authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
            });
        }else {
            admin.app(); // if already initialized, use that one
        }
        var db=admin.database();
        var userRef=db.ref("auth_users");
        //res.send(userremoved === "0" ? "Selected user not found": "Selected user removed successfully");
        removeUser({
            username: req.body.username, 
            password: req.body.password, 
        })
        function removeUser(obj) {
            //var oneUser=userRef.child(Date.now());
            userRef.on('value', (snapshot) => {
                //console.log(snapshot.val());
                //res.send(JSON.stringify(snapshot.numChildren()));
                var stringrecord = JSON.stringify(snapshot);
                recordsets = stringrecord.substring(1, stringrecord.length - 2).split("},");
                for (var intIdx = recordsets.length - 1; intIdx >= 0; intIdx--)
                {
                    //console.log("here 1");
                    //console.log(recordsets[intIdx].split('":{')[0].substring(1)); //password done
                    var uid = recordsets[intIdx].split('":{')[0].substring(1);
                    var username = recordsets[intIdx].split('":"')[2];
                    username = username.substring(0, username.length - 1)
                    var password = recordsets[intIdx].split('":"')[1].split('","')[0];
                    if (username === req.body.username && password === req.body.password) {
                        var userRef=db.ref("auth_users/" + uid);
                        userRef.remove();
                        
                        //userremoved = "1";
                        //res.send("Selected User Removed successfully");
                        break;
                    }
                }
            }, (errorObject) => {

            }); 
        }
        res.send('Operation Completed Successfully');
    }
    else res.send("Restricted access");
});
app.post('/updateauthusers', (req, res) => {
    if (req.body.adminusername === 'admin' && req.body.adminpassword === 'quest')
    {
        var serviceAccount = require('./admin.json');
        var client;
        if (!admin.apps.length) {
            client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
                authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
            });
        }else {
            admin.app(); // if already initialized, use that one
        }
        var db=admin.database();
        var userRef=db.ref("auth_users");
        //res.send(userremoved === "0" ? "Selected user not found": "Selected user removed successfully");
        updateUser({
            username: req.body.username, 
            password: req.body.password, 
        })
        function updateUser(obj) {
            //var oneUser=userRef.child(Date.now());
            userRef.on('value', (snapshot) => {
                //console.log(snapshot.val());
                //res.send(JSON.stringify(snapshot.numChildren()));
                var stringrecord = JSON.stringify(snapshot);
                recordsets = stringrecord.substring(1, stringrecord.length - 2).split("},");
                for (var intIdx = recordsets.length - 1; intIdx >= 0; intIdx--)
                {
                    //console.log("here 1");
                    //console.log(recordsets[intIdx].split('":{')[0].substring(1)); //password done
                    var uid = recordsets[intIdx].split('":{')[0].substring(1);
                    var username = recordsets[intIdx].split('":"')[2];
                    username = username.substring(0, username.length - 1)
                    var password = recordsets[intIdx].split('":"')[1].split('","')[0];
                    if (username === req.body.username && password === req.body.password) {
                        var userRefUsername=db.ref("auth_users/" + uid + "/username");
                        var userRefPassword=db.ref("auth_users/" + uid + "/password");
                        userRefUsername.set(req.body.newusername);
                        userRefPassword.set(req.body.newpassword);
                        //userRef.remove();
                        
                        //userremoved = "1";
                        //res.send("Selected User Removed successfully");
                        break;
                    }
                }
            }, (errorObject) => {

            }); 
        }
        res.send('Operation Completed Successfully');
    }
    else res.send("Restricted access");
});
app.post('/fetchauthusers', (req, res) => {
    if (req.body.adminusername === 'admin' && req.body.adminpassword === 'quest')
    {
        var serviceAccount = require('./admin.json');
        var client;
        if (!admin.apps.length) {
            client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
                authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
            });
        }else {
            client = admin.app(); // if already initialized, use that one
            client.delete();
            client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
                authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
            });
        }
        var db=admin.database();
        var userRef=db.ref("auth_users");
        userRef.on('value', (snapshot) => {
            //console.log(snapshot.val());
            //res.send(JSON.stringify(snapshot.numChildren()));
            res.send(JSON.stringify(snapshot));
            client.delete();
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });
    }
    else res.send("Restricted access");
});
app.post('/storequestcontactdata', (req, res) => {
    // var serviceAccount = require('./admin.json');
    // if (!admin.apps.length) {
    //     admin.initializeApp({
    //         credential: admin.credential.cert(serviceAccount),
    //         databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
    //         authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
    //     });
    //  }else {
    //     admin.app(); // if already initialized, use that one
    //  }
    // var db=admin.database();
    // var userRef=db.ref("contact_details");
    addUser({
        name: req.body.name, 
        email: req.body.email, 
        phone: req.body.phone,
        subject: req.body.subject,
        message: req.body.message
    })
    function addUser(obj) {
        // var oneUser=userRef.child(Date.now());
        // oneUser.update(obj,(err)=>{
        // if(err){
        //     res.send('Something went wrong. Please submit again.');
        // }
        // else{
            const createTransporter = async () => {
                try {
                const oauth2Client = new OAuth2(
                    CLIENT_ID,
                    CLIENT_SECRET,
                    "https://developers.google.com/oauthplayground"
                );
                oauth2Client.setCredentials({
                    refresh_token: REFRESH_TOKEN
                });
                const accessToken = await new Promise((resolve, reject) => {
                    oauth2Client.getAccessToken((err, token) => {
                      if (err) {
                        //reject("Failed to create access token :(");
                        //res.send("Something went wrong. Please try again later");
                        res.send(err);
                      }
                      resolve(token);
                    });
                });
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                    type: "OAuth2",
                    user: "rohangt925@gmail.com",
                    accessToken,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN
                    }
                });
                    return transporter;
                }
                catch (err) {
                    console.log(err);
                }
            };
            const sendEmail = async (emailOptions) => {
                let emailTransporter = await createTransporter();
                await emailTransporter.sendMail(emailOptions, function(error, info) {               
                    if(error) {
                        res.send('Something went wrong. Please submit again.')
                    } else {
                        res.send('Thank you for your submission. We will contact you soon.');
                    }
                });
            };
            sendEmail({
                subject: "Somebody Contacted You from Quest Website",
                text: "Name: " + req.body.name + "\n\n"
                    + "Email: " + req.body.email + "\n\n"
                    + "Phone: " + req.body.phone + "\n\n"
                    + "Subject: " + req.body.subject + "\n\n"
                    + "Message -:\n" + req.body.message + "\n",
                to: "questwebcheck@gmail.com",
                //from: process.env.EMAIL
                from: "rohangt925@gmail.com"
            });
            // sendEmail({
            //     subject: "Somebody Contacted You from Quest Website",
            //     text: "Name: " + req.body.name + "\n\n"
            //         + "Email: " + req.body.email + "\n\n"
            //         + "Phone: " + req.body.phone + "\n\n"
            //         + "Subject: " + req.body.subject + "\n\n"
            //         + "Message -:\n" + req.body.message + "\n",
            //     to: "cwactechnologies@gmail.com",
            //     from: "rohangt925@gmail.com"
            // });
            // sendEmail({
            //     subject: "Somebody Contacted You from Quest Website",
            //     text: "Name: " + req.body.name + "\n\n"
            //         + "Email: " + req.body.email + "\n\n"
            //         + "Phone: " + req.body.phone + "\n\n"
            //         + "Subject: " + req.body.subject + "\n\n"
            //         + "Message -:\n" + req.body.message + "\n",
            //     to: "aman.sharma.amrahs@gmail.com",
            //     from: "rohangt925@gmail.com"
            // });
            sendEmail({
                subject: "Somebody Contacted You from Quest Website",
                text: "Name: " + req.body.name + "\n\n"
                    + "Email: " + req.body.email + "\n\n"
                    + "Phone: " + req.body.phone + "\n\n"
                    + "Subject: " + req.body.subject + "\n\n"
                    + "Message -:\n" + req.body.message + "\n",
                to: "questwebclientdata@gmail.com",
                from: "rohangt925@gmail.com"
            });
        }
    //}) }
});
app.post('/storequestcertstatusdata', (req, res) => {
    // var serviceAccount = require('./admin.json');
    // if (!admin.apps.length) {
    //     admin.initializeApp({
    //         credential: admin.credential.cert(serviceAccount),
    //         databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
    //         authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
    //     });
    //  }else {
    //     admin.app(); // if already initialized, use that one
    //  }
    // var db=admin.database();
    // var userRef=db.ref("cert_status");
    addUser({
        'Certification Number': req.body['Certification Number'], 
        Name: req.body.Name, 
        Phone: req.body.Phone,
        Email: req.body.Email,
        Remarks: req.body.Remarks
    })
    function addUser(obj) {
        // var oneUser=userRef.child(Date.now());
        // oneUser.update(obj,(err)=>{
        // if(err){
        //     res.send('Something went wrong. Please submit again.');
        // }
        // else{
            const createTransporter = async () => {
                const oauth2Client = new OAuth2(
                    CLIENT_ID,
                    CLIENT_SECRET,
                    "https://developers.google.com/oauthplayground"
                );
                oauth2Client.setCredentials({
                    refresh_token: REFRESH_TOKEN
                });
                const accessToken = await new Promise((resolve, reject) => {
                    oauth2Client.getAccessToken((err, token) => {
                      if (err) {
                        //reject("Failed to create access token :(");
                        //res.send("Something went wrong. Please try again later");
                        res.send(err);
                      }
                      resolve(token);
                    });
                });
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                    type: "OAuth2",
                    user: "rohangt925@gmail.com",
                    accessToken,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN
                    }
                });
                return transporter;
            };
            const sendEmail = async (emailOptions) => {
                let emailTransporter = await createTransporter();
                await emailTransporter.sendMail(emailOptions, function(error, info) {               
                    if(error) {
                        res.send('Something went wrong. Please submit again.')
                    } else {
                        res.send('Thank you for your submission. We will contact you soon.');
                    }
                });
            };
            sendEmail({
                subject: "Somebody sent Certification Status from Quest Website",
                text: "Certification Number: " + req.body['Certification Number'] + "\n\n"
                    + "Name: " + req.body.Name + "\n\n"
                    + "Phone: " + req.body.Phone + "\n\n"
                    + "Email: " + req.body.Email + "\n\n"
                    + "Remarks -:\n" + req.body.Remarks + "\n",
                to: "questwebcheck@gmail.com",
                from: process.env.EMAIL
            });
            sendEmail({
                subject: "Somebody sent Certification Status from Quest Website",
                text: "Certification Number: " + req.body['Certification Number'] + "\n\n"
                    + "Name: " + req.body.Name + "\n\n"
                    + "Phone: " + req.body.Phone + "\n\n"
                    + "Email: " + req.body.Email + "\n\n"
                    + "Remarks -:\n" + req.body.Remarks + "\n",
                to: "questwebclientdata@gmail.com",
                from: process.env.EMAIL
            });
            // sendEmail({
            //     subject: "Somebody sent Certification Status from Quest Website",
            //     text: "Certification Number: " + req.body['Certification Number'] + "\n\n"
            //         + "Name: " + req.body.Name + "\n\n"
            //         + "Phone: " + req.body.Phone + "\n\n"
            //         + "Email: " + req.body.Email + "\n\n"
            //         + "Remarks -:\n" + req.body.Remarks + "\n",
            //     //to: "aman.sharma.amrahs@gmail.com",
            //     to: "services@cwac.in",
            //     from: process.env.EMAIL
            // });
        }
    //}) }
});
app.get('/storebackend', (req, res) => {
    //res.send('From Backend');
    var serviceAccount = require('./admin.json');
    //admin.app();
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
            authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
        });
     }else {
        admin.app(); // if already initialized, use that one
     }
    var db=admin.database();
    var userRef=db.ref("users");
    addUser({name: 'Rohan', email: 'rohangt', roll: '125'})
    function addUser(obj) {
        var oneUser=userRef.child(obj.roll);
        oneUser.update(obj,(err)=>{
        if(err){
            res.send('something went wrong');
        }
        else{
            res.send('everything right');
        }
    }) }
});
app.get('/fetchbackend', (req, res) => {
    //res.send('From Backend');
    var serviceAccount = require('./admin.json');
    //admin.app();
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
            authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
        });
     }else {
        admin.app(); // if already initialized, use that one
     }
    var db=admin.database();
    var userRef=db.ref("users");
    userRef.on('value', (snapshot) => {
        //console.log(snapshot.val());
        res.send(JSON.stringify(snapshot.numChildren()));
      }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
      }); 
});
app.get('/updatebackend', (req, res) => {
    //res.send('From Backend');
    var serviceAccount = require('./admin.json');
    //admin.app();
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
            authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
        });
     }else {
        admin.app(); // if already initialized, use that one
     }
    var db=admin.database();
    var userRef=db.ref("users/123/name");
    userRef.set('aman'); 
    res.send('done');
});
app.get('/removebackend', (req, res) => {
    //res.send('From Backend');
    var serviceAccount = require('./admin.json');
    //admin.app();
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
            authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
        });
     }else {
        admin.app(); // if already initialized, use that one
     }
    var db=admin.database();
    var userRef=db.ref("users/123");
    userRef.remove();
    res.send('done');
});
app.post('/uploadfile', upload.single('file'), (req, res) => {
    //console.log(req.file);
    //res.send('JSON.parse(req.body)');
    //res.send('JSON.stringify(req.body)');
    var serviceAccount = require('./admin.json');
    //admin.app();
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
            storageBucket: "gs://amanfirebase-8acf3.appspot.com",
        });
    }else {
        admin.app(); // if already initialized, use that one
    }
    app.locals.bucket = admin.storage().bucket();
    const name = saltedMd5(req.file.originalname, 'SUPER-S@LT!');
    const fileName = name + path.extname(req.file.originalname);
    app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer);
    res.send('done');
});


// const admin = require('firebase-admin');
// const express = require('express');
// const app = express();
// const cors=require('cors');
// app.use(cors());
// const saltedMd5 = require('salted-md5');
// const path=require('path');
// app.set('views', path.join(__dirname, 'static', 'views'));
// app.use('/public', express.static(path.join(__dirname, 'static', 'public')));
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// const multer = require('multer');
// const upload = multer();
// var nodemailer = require("nodemailer");
// app.listen(process.env.PORT || 5000,()=>
// {
//     console.log(`APP IS RUNNING AT 5000`)
// })
// app.get('/testurl', (req, res) => {
//     res.send('Heroku working V1');
// });
// app.post('/storequestcontactdata', (req, res) => {
//     // console.log("aa");
//     // console.log(Date.now());
//     //res.send("done");
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
//         });
//      }else {
//         admin.app(); // if already initialized, use that one
//      }
//     var db=admin.database();
//     var userRef=db.ref("contact_details");
//     addUser({
//         name: req.body.name, 
//         email: req.body.email, 
//         phone: req.body.phone,
//         subject: req.body.subject,
//         message: req.body.message
//     })
//     function addUser(obj) {
//         var oneUser=userRef.child(Date.now());
//         oneUser.update(obj,(err)=>{
//         if(err){
//             res.send('something went wrong');
//         }
//         else{
//             //res.send('everything right');
//             var mailOptions = {
//                 from: 'Quest Certification Private Limited',     
//                 to: ["cwactechnologies@gmail.com"],
//                 subject: 'Somebody Contacted You from Quest', 
//                 text: "Name: " + req.body.name + "\n\n"
//                 + "Email: " + req.body.email + "\n\n"
//                 + "Phone: " + req.body.phone + "\n\n"
//                 + "Subject: " + req.body.subject + "\n\n"
//                 + "Message -:\n" + req.body.message + "\n"
//             };
//             var transporter = nodemailer.createTransport({
//                 service: "Gmail",
//                 auth: {
//                     user: "rohangt925@gmail.com",
//                     pass: "$Rv8421651207557570"
//                 }
//             });
//             transporter.sendMail(mailOptions, function(error, info) {               
//                 if(error) {
//                     //console.log(error)
//                     res.send(error);
//                     //failure_email.push(Email);
//                 } else {
//                     //self.status = true;
//                     res.send('everything right');
//                     //console.log('everything right');
//                     //success_email.push(Email);
//                 }
//                 //callback(null,self.status,Email);
//             });
//         }
//     }) }
//     // var mailOptions = {
//     //     from: 'Quest Certification Private Limited',     
//     //     to: ["cwactechnologies@gmail.com"],
//     //     subject: 'Somebody Contacted You from Quest', 
//     //     text: "Name: " + req.body.name + "\n\n"
//     //     + "Email: " + req.body.email + "\n\n"
//     //     + "Phone: " + req.body.phone + "\n\n"
//     //     + "Subject: " + req.body.subject + "\n\n"
//     //     + "Message -:\n" + req.body.message + "\n"
//     // };
//     // var transporter = nodemailer.createTransport({
//     //     service: "Gmail",
//     //     auth: {
//     //         user: "rohangt925@gmail.com",
//     //         pass: "$Rv8421651207557570"
//     //     }
//     // });
//     // transporter.sendMail(mailOptions, function(error, info) {               
//     //     if(error) {
//     //         console.log(error)
//     //         //failure_email.push(Email);
//     //     } else {
//     //         //self.status = true;
//     //         console.log('everything right');
//     //         //success_email.push(Email);
//     //     }
//     //     //callback(null,self.status,Email);
//     // });
// });
// app.post('/storequestcertstatusdata', (req, res) => {
//     // console.log("aa");
//     // console.log(Date.now());
//     //res.send("done");
//     //console.log(req.body['Certification Number']);
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
//         });
//      }else {
//         admin.app(); // if already initialized, use that one
//      }
//     var db=admin.database();
//     var userRef=db.ref("cert_status");
//     addUser({
//         'Certification Number': req.body['Certification Number'], 
//         Name: req.body.Email, 
//         Phone: req.body.Phone,
//         Email: req.body.Email,
//         Remarks: req.body.Remarks
//     })
//     function addUser(obj) {
//         var oneUser=userRef.child(Date.now());
//         oneUser.update(obj,(err)=>{
//         if(err){
//             res.send('something went wrong');
//         }
//         else{
//             res.send('everything right');
//         }
//     }) }

// });
// app.get('/storebackend', (req, res) => {
//     //res.send('From Backend');
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
//         });
//      }else {
//         admin.app(); // if already initialized, use that one
//      }
//     var db=admin.database();
//     var userRef=db.ref("users");
//     addUser({name: 'Rohan', email: 'rohangt', roll: '125'})
//     function addUser(obj) {
//         var oneUser=userRef.child(obj.roll);
//         oneUser.update(obj,(err)=>{
//         if(err){
//             res.send('something went wrong');
//         }
//         else{
//             res.send('everything right');
//         }
//     }) }
// });
// app.get('/fetchbackend', (req, res) => {
//     //res.send('From Backend');
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
//         });
//      }else {
//         admin.app(); // if already initialized, use that one
//      }
//     var db=admin.database();
//     var userRef=db.ref("users");
//     userRef.on('value', (snapshot) => {
//         //console.log(snapshot.val());
//         res.send(JSON.stringify(snapshot.numChildren()));
//       }, (errorObject) => {
//         console.log('The read failed: ' + errorObject.name);
//       }); 
// });
// app.get('/updatebackend', (req, res) => {
//     //res.send('From Backend');
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
//         });
//      }else {
//         admin.app(); // if already initialized, use that one
//      }
//     var db=admin.database();
//     var userRef=db.ref("users/123/name");
//     userRef.set('aman'); 
//     res.send('done');
// });
// app.get('/removebackend', (req, res) => {
//     //res.send('From Backend');
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             authDomain: "amanfirebase-8acf3-default-rtdb.firebaseapp.com",
//         });
//      }else {
//         admin.app(); // if already initialized, use that one
//      }
//     var db=admin.database();
//     var userRef=db.ref("users/123");
//     userRef.remove();
//     res.send('done');
// });
// app.post('/uploadfile', upload.single('file'), (req, res) => {
//     //console.log(req.file);
//     //res.send('JSON.parse(req.body)');
//     //res.send('JSON.stringify(req.body)');
//     var serviceAccount = require('./admin.json');
//     //admin.app();
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "https://amanfirebase-8acf3-default-rtdb.firebaseio.com/",
//             storageBucket: "gs://amanfirebase-8acf3.appspot.com",
//         });
//     }else {
//         admin.app(); // if already initialized, use that one
//     }
//     app.locals.bucket = admin.storage().bucket();
//     const name = saltedMd5(req.file.originalname, 'SUPER-S@LT!');
//     const fileName = name + path.extname(req.file.originalname);
//     app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer);
//     res.send('done');
// });