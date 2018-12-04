var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
const fs = require('fs');
var dateTime = require('node-datetime');

var DatabaseMS = require('./DBMS');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

DatabaseMS.init('./Nodes');

var OptionValues = ["کارشناسی", "کارشناسی ارشد", "دکترا", "فوق دکترا"];

app.get('/', function (req, res) {
    if(req.query.reqid)
    {
        res.render('index', { options : OptionValues });
    }
    else
    {
        res.redirect("/?reqid=564");
    }
});

app.get('/uni', function (req, res) {
    if(req.query.reqid)
    {
        res.render('uni', { options : OptionValues });
    }
    else
    {
        res.redirect("/uni?reqid=564");
    }
});

app.post('/degree', function (req, res) {
    console.log("degree");
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    res.render('degree', { id: IncomingData.id, options : OptionValues });
});

app.post('/submitUser', function (req, res) {
    console.log("submitUser");
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    var DataComp = 1;
    var TBachId = IncomingData.BachId,
        TCodeMelli = IncomingData.CodeMelli,
        TBachName = IncomingData.BachName,
        TBachLname = IncomingData.BachLname,
        Temail = IncomingData.email,
        TTelNum = IncomingData.TelNum,
        TBio = IncomingData.Bio,
        TDegs = IncomingData.Degrees,
        TDegsCount = IncomingData.DegreesCount;
    if(TBachId == "") { DataComp = 0; }
    if(TCodeMelli == "") { DataComp = 0; }
    if(TBachName == "") { DataComp = 0; }
    if(TBachLname == "") { DataComp = 0; }
    if(Temail == "") { DataComp = 0; }
    if(TTelNum == "") { DataComp = 0; }
    if(TDegsCount==0) { DataComp = 0; }
    if(DataComp==0)
    {
        res.send("");
    }
    else
    {
        if(DatabaseMS.submitedUserExists(TBachId) == 1)
        {
            res.send(JSON.stringify({ message: "اطلاعات شما قبلا ثبت شده !!!" }));
        }
        else
        {
            if(DatabaseMS.submitedUserConfirmed(TBachId, TCodeMelli, TDegs, TDegsCount) == 1) // confirmed on uni database
            {
                var Bach = {
                    BachId: TBachId,
                    CodeMelli: TCodeMelli,
                    BachName: TBachName,
                    BachLname: TBachLname,
                    email: Temail,
                    TelNum: TTelNum,
                    Bio: TBio,
                    Degs: TDegs,
                    DegsCount: TDegsCount
                };
                DatabaseMS.submitUser(TBachId, Bach);
                res.send(JSON.stringify({ message: "اطلاعات شما با موفقیت ثبت شد..." }));
            }
            else
            {
                res.send(JSON.stringify({ message: "اطلاعات وارد شده صحیح نیست!!!" }));
            }
        }
    }
});

app.post('/confirmUser', function (req, res) {
    console.log("confirmUser");
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    var DataComp = 1;
    var TBachId = IncomingData.BachId,
        TCodeMelli = IncomingData.CodeMelli,
        TBachName = IncomingData.BachName,
        TBachLname = IncomingData.BachLname,
        TDegs = IncomingData.Degrees,
        TDegsCount = IncomingData.DegreesCount;
    if(TBachId == "") { DataComp = 0; }
    if(TCodeMelli == "") { DataComp = 0; }
    if(TBachName == "") { TBachName = "نام وارد نشده";}
    if(TBachLname == "") { TBachLname = "نام خانوادگی وارد نشده"; }
    if(TDegsCount==0) { DataComp = 0; }
    if(DataComp==0)
    {
        res.send("");
    }
    else
    {
        if(DatabaseMS.confirmedUserExists(TBachId) == 1)
        {
            res.send(JSON.stringify({ message: "اطلاعات شما قبلا ثبت شده !!!" }));
        }
        else
        {
            var Bach = {
                BachId: TBachId,
                CodeMelli: TCodeMelli,
                BachName: TBachName,
                BachLname: TBachLname,
                Degs: TDegs,
                DegsCount: TDegsCount
            };
            DatabaseMS.confirmUser(TBachId, Bach);
            res.send(JSON.stringify({ message: "اطلاعات شما با موفقیت ثبت شد..." }));
        }
    }
});

app.post('/searchUserById', function (req, res) {
    console.log("searchUserById");
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    if(DatabaseMS.submitedUserExists(IncomingData.id)==1)
    {
        var foundUser = DatabaseMS.GetUserInfo(IncomingData.id);
        res.render('foundUserById', foundUser);
    }
    else
    {
        res.send("هیچ دانشجویی با این شماره ثبت نشده است!!!");
    }
});

app.post('/searchUserByBio', function (req, res) {
    console.log("searchUserByBio");
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    res.render('foundUserByBio',{ Users: DatabaseMS.SearchUserByBioWord(IncomingData)});
});

app.listen(8000,function () {
    console.log("service started on port 8000...");
});