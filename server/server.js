const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

let imagesPath = path.join(__dirname, 'images.json');

app.use(express.json({limit: '50mb'}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    next();
});


app.delete('/deleteAll', function (req, res) {

    fs.readFile(imagesPath, (err, data) => {
        if (err){
            console.log(err);
        } else {
            let obj = JSON.parse(data);
            obj = [];
            let json = JSON.stringify(obj); // convert it back to json
            fs.writeFile(imagesPath, json, () => console.log('all pictures deleted'));
        }
        res.json({msg: 'all pictures deleted'})
    });
});


app.post('/saveimg', function (req, res) {

    fs.readFile(imagesPath, (err, data) => {
        if (err){
            console.log(err);
        } else {
            let obj = JSON.parse(data);
            obj.push(req.body); // add new new pic
            let json = JSON.stringify(obj); // convert it back to json
            fs.writeFile(imagesPath, json, () => console.log('new picture added'));
        }
        res.sendfile(imagesPath);
    });
});

app.get('/', function (req, res) {
    res.sendfile(imagesPath);
});

app.listen(4400, () => console.log('port on 4400'))