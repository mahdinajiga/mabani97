var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var DatabaseMS = require('./DBMS'); // adding database management system module

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

DatabaseMS.init('./Nodes'); // calling init() on DBMS

var OptionValues = ["کارشناسی", "کارشناسی ارشد", "دکترا", "فوق دکترا"]; // DegreeTypes





app.get('/font/Roya.eot', function (req, res) {
    res.sendFile(__dirname + "/font/Roya.eot");
});
app.get('/font/Roya.ttf', function (req, res) {
    res.sendFile(__dirname + "/font/Roya.ttf");
});
app.get('/font/Roya.woff', function (req, res) {
    res.sendFile(__dirname + "/font/Roya.woff");
});




/*
    GET /
    rendering index.htm for response

    صفحه اصلی سایت برای تمامی کاربران
*/
app.get('/', function (req, res) {
    if(req.query.reqid) //look if there is reqid, if there is no reqid, redirect user
    {
        res.render('index', { options : OptionValues });
    }
    else
    {
        res.redirect("/?reqid=564");
    }
});






/*
    GET /searchByName

    جستجوی دانشجو بر اساس شماره نام و نام خانوادگی در دیتابیس دانشگاه و نمایش شماره دانشجویی
*/
app.get('/searchByName', function (req, res) {
    if(req.query.reqid) //look if there is reqid, if there is no reqid, redirect user
    {
        res.render('SearchBI');
    }
    else
    {
        res.redirect("/searchByName?reqid=654");
    }
});







/*
    GET /uni
    same as index but for submitting database records

    صفحه ثبت اطلاعات قدیمی برای کارمندان دانشگاه
*/
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







/*
    POST /degree
    rendering degree.htm for every uniqe id


    ساخت فرم جدید برای مدارک ثبتی
    حاوی قسمت انتخاب نام مدرک و توضیحات و سال اخذ مدرک
    هر ورودی شامل نام ورودی و id
*/
app.post('/degree', function (req, res) {
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    res.render('degree', { id: IncomingData.id, options : OptionValues });
});







/*
    POST /submitUser

    ثبت اطلاعات دانشجو
    پس از مطمئن شدن از اینکه کاربر قبلا ثبت نشده، اطلاعات ورودی در دیتابیس دانشگاه جستجو میشود
    اگر دانشجو تایید شده باشد، اطلاعات ورودی در دیتا بیس کنونی دخیره میشود
*/
app.post('/submitUser', function (req, res) {
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    var DataComp = 1; // data complete flag
    var TBachId = IncomingData.BachId,
        TCodeMelli = IncomingData.CodeMelli,
        TBachName = IncomingData.BachName,
        TBachLname = IncomingData.BachLname,
        Temail = IncomingData.email,
        TTelNum = IncomingData.TelNum,
        TBio = IncomingData.Bio/*,
        TDegs = IncomingData.Degrees,
        TDegsCount = IncomingData.DegreesCount*/;
    if(TBachId == "") { DataComp = 0; }
    if(TCodeMelli == "") { DataComp = 0; }
    if(TBachName == "") { DataComp = 0; }
    if(TBachLname == "") { DataComp = 0; }
    if(Temail == "") { DataComp = 0; }
    if(TTelNum == "") { DataComp = 0; }
    //if(TDegsCount==0) { DataComp = 0; }
    if(DataComp==0)
    {
        res.send(""); // wrong inputs detected
    }
    else
    {
        if(DatabaseMS.submitedUserExists(TBachId) == 1)
        {
            res.send(JSON.stringify({ message: "اطلاعات شما قبلا ثبت شده !!!" }));
        }
        else
        {
            if(DatabaseMS.submitedUserConfirmed(TBachId, TCodeMelli) == 1) // confirmed on uni database
            {
                var UniBachData = DatabaseMS.GetconfirmedUserInfo(TBachId);
                var Bach = {
                    BachId: TBachId,
                    CodeMelli: TCodeMelli,
                    BachName: TBachName,
                    BachLname: TBachLname,
                    email: Temail,
                    TelNum: TTelNum,
                    Bio: TBio,
                    Degs: UniBachData.Degs,
                    DegsCount: UniBachData.DegsCount
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












/*
    POST /confirmUser

    ثبت اطلاعات دانشجو در دیتابیس دانشگاه
    اگر دانشجو تایید شده باشد، اطلاعات ورودی در دیتا بیس کنونی دخیره میشود
*/
app.post('/confirmUser', function (req, res) {
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
        res.send(""); // wrong inputs detected
    }
    else
    {
        if(DatabaseMS.confirmedUserExists(TBachId) == 1)
        {
            res.send(JSON.stringify({ message: "اطلاعات دانشچو قبلا ثبت شده !!!" }));
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
            res.send(JSON.stringify({ message: "اطلاعات دانشجو با موفقیت ثبت شد..." }));
        }
    }
});







/*
    POST /searchUserById

    جستجوی دانشجو بر اساس شماره دانشجویی در دیتابیس کنونی و نمایش نتیجه
*/
app.post('/searchUserById', function (req, res) {
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











/*
    POST /searchUserByName

    جستجوی دانشجو بر اساس شماره نام و نام خانوادگی در دیتابیس دانشگاه و نمایش شماره دانشجویی
*/
app.post('/searchUserByName', function (req, res) {
    try
    {
        var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
        var foundUsers = DatabaseMS.SearchUserByName({name : IncomingData.name, lname: IncomingData.lname});
        res.render('SearchBI-Res', {Users: foundUsers});
    }
    catch(ert)
    {
        console.log(ert);
    }
});









/*
    POST /searchUserByBio

    جستجوی دانشجو بر اساس قسمتی از بیو و مدارک در دیتابیس کنونی و نمایش نتیجه
*/
app.post('/searchUserByBio', function (req, res) {
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    res.render('foundUserByBio',{ Users: DatabaseMS.SearchUserByBioWord(IncomingData)});
});



// ruuning web service on port 8000
app.listen(8000,function () {
    console.log("web service started on port 8000...");
});