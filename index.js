var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var DatabaseMS = require('./DBMS'); // adding database management system module

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

DatabaseMS.init('./Nodes'); // calling init() on DBMS

var FirstDegreeDate = 1320, LastDegreeDate = 1398;



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
        res.render('index', { FirstDegreeDate : FirstDegreeDate , LastDegreeDate : LastDegreeDate , Branches : DatabaseMS.GetBranches() , BranchStr : JSON.stringify(DatabaseMS.GetBranches()) });
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
        res.render('uni', { Branches : DatabaseMS.GetBranches() , BranchStr : JSON.stringify(DatabaseMS.GetBranches()) });
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
    res.render('degree', { id: IncomingData.id , Branches : DatabaseMS.GetBranches() , BranchStr : JSON.stringify(DatabaseMS.GetBranches()) });
});







/*
    POST /submitUser

    ثبت اطلاعات دانشجو
    پس از مطمئن شدن از اینکه کاربر قبلا ثبت نشده، اطلاعات ورودی در دیتابیس دانشگاه جستجو میشود
    اگر دانشجو تایید شده باشد، اطلاعات ورودی در دیتا بیس کنونی دخیره میشود
*/
app.post('/submitUser', function (req, res) {
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    var overide = IncomingData.Override;
    IncomingData = IncomingData.Bach;
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
            if(overide==1)
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
                res.send(JSON.stringify({ code:200 , message: "اطلاعات شما با موفقیت ثبت شد..." }));
            }
            else
            {
                res.send(JSON.stringify({ code:401 , message: "اطلاعات شما قبلا ثبت شده !!!" }));
            }
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
                res.send(JSON.stringify({ code:200 , message: "اطلاعات شما با موفقیت ثبت شد..." }));
            }
            else
            {
                res.send(JSON.stringify({ code:200 , message: "اطلاعات وارد شده صحیح نیست!!!" }));
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
    IncomingData.Branch = Number(IncomingData.Branch);
    IncomingData.Rank = Number(IncomingData.Rank);
    IncomingData.Ori = Number(IncomingData.Ori);
    IncomingData.SalEtmamFirst = Number(IncomingData.SalEtmamFirst);
    if(IncomingData.SalEtmamFirst==0)
        IncomingData.SalEtmamFirst=FirstDegreeDate;
    IncomingData.SalEtmamLast = Number(IncomingData.SalEtmamLast);
    if(IncomingData.SalEtmamLast==0)
        IncomingData.SalEtmamLast=LastDegreeDate;
    res.render('foundUserByBio',{ Users: DatabaseMS.SearchUserByBioWord(IncomingData)});
});









/*
    POST /SetNewBranch

    ایجاد مدرک جدید
*/
app.post('/SetNewBranch', function (req, res) {
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON

    var DataIncorrect = 0;
    if(IncomingData.BranchName == null
        || Number(IncomingData.RanksCount) == 0
        || IncomingData.OriCount.length != Number(IncomingData.RanksCount)+1
        || IncomingData.Ranks.length != Number(IncomingData.RanksCount))
    {
        DataIncorrect = 1;
    }
    for(var i=0; i<Number(IncomingData.RanksCount) && DataIncorrect==0; i++)
    {
        if(IncomingData.Ranks[i].index != i
            || IncomingData.Ranks[i].RankName==null
            || IncomingData.Ranks[i].Orientations==null)
        {
            DataIncorrect=1;
        }
        else
        {
            if(IncomingData.Ranks[i].Orientations.length != IncomingData.OriCount[i])
            {
                DataIncorrect=1;
            }
            else
            {
                for(var j=0; j<IncomingData.OriCount[i] && DataIncorrect==0; j++)
                {
                    if(IncomingData.Ranks[i].Orientations[j].index != j
                        || IncomingData.Ranks[i].Orientations[j].OriName==null)
                    {
                        DataIncorrect=1;
                    }
                }
            }
        }
    }
    if(DataIncorrect==0)
    {
        DatabaseMS.SaveNewBranch(IncomingData);

        res.send("مدرک با موفقیت ثبت شد");
    }
    else
    {
        res.send("لطفا اطلاعات را با دقت پر کنید");
    }
});







/*
    POST /removeBranch

    حذف مدرک
*/
app.post('/removeBranch', function (req, res) {
    var IncomingData = JSON.parse(req.body.Data); // parsing incoming data in JSON
    DatabaseMS.DeleteBranch(IncomingData.id);
    res.send("مدرک با موفقیت حذف شد")
});









// ruuning web service on port 8000
app.listen(8000,function () {
    console.log("web service started on port 8000...");
});