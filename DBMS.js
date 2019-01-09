const fs = require('fs');
var stringSimilarity = require('string-similarity');
var NodesDir; // database root address
var Branches = [];


var init = function () {
    NodesDir = arguments[0];
    if (!fs.existsSync(NodesDir)){
        fs.mkdirSync(NodesDir);
        fs.mkdirSync(NodesDir+"/submiteds");
        fs.mkdirSync(NodesDir+"/uniDatabase");
        fs.writeFileSync(NodesDir + "/NameBachSims.json", JSON.stringify({BachCount : 0, BacheInfo:[]}));
        
        Branches.push({
            index:0,
            BranchName: "نام مدرک پیش فرض",
            Ranks: [{
                index : 0,
                RankName : "مقطع مدرک پیش فرض",
                Orientations : [{
                    index : 0,
                    OriName : "گرایش مدرک پیش فرض"
                }]
            }]
        });
        SyncBranches();
    }
    else
    {
        Branches = JSON.parse(fs.readFileSync(NodesDir + "/Branches.json")).BranchArr;
    }
    console.log("Database management service initialized...")
}


function SyncBranches() 
{
    fs.writeFileSync(NodesDir + "/Branches.json", JSON.stringify({ BranchesCount: Branches.length, BranchArr: Branches}));
}







/*
    بررسی دیتابیس کنونی


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی

    outputs:
        0   :   not found
        1   :   found
*/
var submitedUserExists = function () {
    if (fs.existsSync(NodesDir+"/submiteds/"+arguments[0])){
        return 1;
    }
    else
    {
        return 0;
    }
}







/*
    بررسی مورد تائید بودن اطلاعات ورودی دانشجو
    توضیحات روش تائید صلاحیت در متن کد

    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی
        CodeMelli   :   arguments[1]    :   کد ملی
        Degrees     :   arguments[2]    :   مدرک تحصیلی
        DegsCount   :   arguments[3]    :   تعداد مدارک تحصیلی

    outputs:
        0   :   not confirmed
        1   :   confirmed
*/
var submitedUserConfirmed = function () {
    if(fs.existsSync(NodesDir+"/uniDatabase/"+arguments[0]))
    {
        try
        {
            var BachOnUniDatabase = JSON.parse(fs.readFileSync(NodesDir+"/uniDatabase/"+arguments[0]));
            if(BachOnUniDatabase.CodeMelli != arguments[1]) 
            {
                //console.log("code melli wrong");
                return 0;
            }
            else
            {
                return 1;
                var Degs = arguments[2]; // user given degrees to check
                var UniDegs = BachOnUniDatabase.Degs; // uni database degrees confirmed for user
                var ResOfDegreeConfirm = 1; // user given data confirm flag
                for(var i=0; i<arguments[3] && ResOfDegreeConfirm==1; i++) // search all user given degrees
                {
                    var DegreeFound = 0; // assume given data is wrong
                    for(var j=0; j<BachOnUniDatabase.DegsCount && DegreeFound==0; j++) // search all uniDatabase degrees confirmed for user
                    {
                        if(UniDegs[j].DegreeName == Degs[i].DegreeName && UniDegs[j].SalEtmam == Degs[i].SalEtmam)
                        {
                            //console.log("deg found: "+ Degs[i].DegreeName + " on " + Degs[i].SalEtmam)
                            DegreeFound = 1; // this degree is confirmed by university
                        }
                    }
                    if(DegreeFound==0)
                    {
                        //console.log("deg not found: "+ Degs[i].DegreeName + " on "+Degs[i].SalEtmam)
                        ResOfDegreeConfirm = 0; // one of degrees are wrong (not confirmed by university)
                    }
                }
                return ResOfDegreeConfirm;
            }
        }
        catch(ert)
        {
            return 0;
        }
    }
    else
    {
        return 0;
    }
}








/*
    تائید کاربر و ذخیره اطلاعات در دیتابیس کنونی


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی
        Bach        :   arguments[1]    :   تمامی اطلاعات دانشجویی
*/
var submitUser = function () {
   fs.writeFileSync(NodesDir + "/submiteds/" + arguments[0], JSON.stringify(arguments[1]));
}







/*
    بررسی دیتابیس دانشگاه


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی

    outputs:
        0   :   not found
        1   :   found
*/
var confirmedUserExists = function () {
    if (fs.existsSync(NodesDir+"/uniDatabase/"+arguments[0])){
        return 1;
    }
    else
    {
        return 0;
    }
}







/*
    ثبت اطلاعات دانشجو در دیتابیس دانشگاه


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی
        Bach        :   arguments[1]    :   تمامی اطلاعات دانشجویی
*/
var confirmUser = function () {
    var BachInfo = arguments[1];
    fs.writeFileSync(NodesDir + "/uniDatabase/" + arguments[0], JSON.stringify(arguments[1]));
    var NameB = JSON.parse(fs.readFileSync(NodesDir + "/NameBachSims.json"));
    var BInfo = NameB.BacheInfo;
    BInfo[NameB.BachCount] = {
        BachId: arguments[0],
        BachName: BachInfo.BachName,
        BachLname: BachInfo.BachLname
    };
    NameB.BachCount = NameB.BachCount+1;
    NameB.BacheInfo = BInfo;
    fs.writeFileSync(NodesDir + "/NameBachSims.json", JSON.stringify(NameB));
}




/*
    به دست اوردن اطلاعات دانشجو از دیتابیس کنونی بر اساس شماره دانشجویی


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی

    outputs:
        Bach        :   Object          :   اطلاعات دانشجو
*/
var GetUserInfo = function () {
    var UserInf = JSON.parse(fs.readFileSync(NodesDir + "/submiteds/" + arguments[0]));
    var DegsCountN = Number(UserInf.DegsCount);
    for(var i=0; i< DegsCountN; i++)
    {
        UserInf.Degs[i] = DegreeParse(UserInf.Degs[i]);
    }
    return UserInf;
}



function DegreeParse(Deg) 
{
    var CurrentBranch = Branches[Number(Deg['Branch'])]; // DegreeBranch in Degs
    Deg['DegreeBranch'] = CurrentBranch.BranchName;
    var CurrentRank = CurrentBranch.Ranks[Number(Deg['Rank'])]; // DegreeRankIndex in Degs
    Deg['DegreeRank'] = CurrentRank.RankName;
    var CurrentOri = CurrentRank.Orientations[Number(Deg['Ori'])]; // RankOriIndex in Degs
    Deg['RankOri'] = CurrentOri.OriName;
    return Deg;
}



/*
    به دست اوردن اطلاعات دانشجو از دیتابیس دانشگاه بر اساس شماره دانشجویی


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی

    outputs:
        Bach        :   Object          :   اطلاعات دانشجو
*/
var GetconfirmedUserInfo = function () {
    return JSON.parse(fs.readFileSync(NodesDir + "/uniDatabase/" + arguments[0]));
}






/*
    جستجوی دانشجو بر اساس قسمتی از متن بیو و یا مدرک تحصیلی

    درصورت خالی بودن فیلد های جستجو همه رکورد ها نمایش داده میشوند
    
    سه حالت جستجو:
    1:
        فقط مدرک
        نمایش تمام رکوردهایی که نام مدرک و سال اخذ برابر با الگوی جستجو باشد
    
    2:
        فقط قسمتی از بیو
        نمایش تمامی رکورد هایی که الگوی جستجو در بیو قرار دارد
    
    3:
        هر دو
        نمایش تمامی رکورد هایی که هم بیو شامل الگو باشد و هم مدرکی همنام و همسال الگو باشد



    inputs:
        QueryObj    :   arguments[0]    :   شامل متن جستجو و نوع مدرک و سال فارغ التحصیلی
            QueryObj.word           :   متن جستجو
            QueryObj.Branch         :   -1 for empty query
            QueryObj.Rank           :   -1 for empty query
            QueryObj.Ori            :   -1 for empty query
            QueryObj.SalEtmamFirst  :   First SalEtmam of query
            QueryObj.SalEtmamLast   :   Last SalEtmam of query

    outputs:
        ReturnObj   :   Array of Bach   :   آرایه ای از اطلاعات دانشجویان حاصل جستجو
*/
var SearchUserByBioWord = function () {
    var QueryObj = arguments[0];
    console.log(QueryObj);
    var ReturnObj = [];
    var files = fs.readdirSync(NodesDir+"/submiteds/");
    for(var i=0; i<files.length; i++)
    {
        var BachData = JSON.parse(fs.readFileSync(NodesDir + "/submiteds/" + files[i]));
        var UserBio = BachData.Bio;
        var UserDeg = BachData.Degs;
        if(QueryObj.word == "") // search with degree only
        {
            if(QueryObj.Branch == -1)
            {
                var DegsCountN = Number(BachData.DegsCount);
                for(var i=0; i< DegsCountN; i++)
                {
                    BachData.Degs[i] = DegreeParse(BachData.Degs[i]);
                }
                ReturnObj.push(BachData); // show allllllll records, there is no search patern
            }
            else
            {
                var UserFound = 0;
                for(var j=0; j<UserDeg.length && UserFound==0; j++)
                {
                    if(UserDeg[j].Branch == QueryObj.Branch)
                    {
                        if(UserDeg[j].Rank == QueryObj.Rank
                            && UserDeg[j].SalEtmam <= Number(QueryObj.SalEtmamLast)
                            && UserDeg[j].SalEtmam >= Number(QueryObj.SalEtmamFirst) )
                        {
                            if(QueryObj.Ori == -1 || UserDeg[j].Ori == QueryObj.Ori)
                            {
                                UserFound = 1;
                            }
                        }
                    }
                }
                if(UserFound==1)
                {
                    var DegsCountN = Number(BachData.DegsCount);
                    for(var i=0; i< DegsCountN; i++)
                    {
                        BachData.Degs[i] = DegreeParse(BachData.Degs[i]);
                    }
                    ReturnObj.push(BachData);
                }
            }
        }
        else if(QueryObj.Branch == -1) // search with bio only
        {
            if(UserBio.includes(QueryObj.word))
            {
                var DegsCountN = Number(BachData.DegsCount);
                for(var i=0; i< DegsCountN; i++)
                {
                    BachData.Degs[i] = DegreeParse(BachData.Degs[i]);
                }
                ReturnObj.push(BachData);
            }
        }
        else // search with both bio and degree
        {
            if(UserBio.includes(QueryObj.word))
            {
                var UserFound = 0;
                for(var j=0; j<UserDeg.length && UserFound==0; j++)
                {
                    if(UserDeg[j].Branch == QueryObj.Branch)
                    {
                        if(UserDeg[j].Rank == QueryObj.Rank
                            && UserDeg[j].SalEtmam <= Number(QueryObj.SalEtmamLast)
                            && UserDeg[j].SalEtmam >= Number(QueryObj.SalEtmamFirst) )
                        {
                            if(QueryObj.Ori == -1 || UserDeg[j].Ori == QueryObj.Ori)
                            {
                                UserFound = 1;
                            }
                        }
                    }
                }
                if(UserFound==1)
                {
                    var DegsCountN = Number(BachData.DegsCount);
                    for(var i=0; i< DegsCountN; i++)
                    {
                        BachData.Degs[i] = DegreeParse(BachData.Degs[i]);
                    }
                    ReturnObj.push(BachData);
                }
            }
        }
    }
    return ReturnObj;
}








/*
    جستجوی دانشجو بر اساس تام و نام خانوادگی

    همه رکورد های دیتابیس دانشگاه فراخوانی شده و درصد تشابه نام و نام خانوادگی وارد شده از طرف کاربر با
    همه رکورد ها بررسی میشود
    در صورت تشابه زیاد شماره دانشجویی های ممکن برای کاربر نشان داده میشود

    inputs:
        QueryObj    :   arguments[0]    :   شامل متن جستجو و نوع مدرک و سال فارغ التحصیلی
            QueryObj.name       :   نام 
            QueryObj.lname      :   نام خانوادگی

    outputs:
        ReturnObj   :   Array of Bach ids  :   آرایه ای از شماره دانشجویی و نام و نام خانوادگی در ابجکت
*/
var MatchThresholde = .6; // حداقل میزان تشابه بین اسامی از صفر تا یک
var SearchUserByName = function () {
    var QueryObj = arguments[0];
    var ReturnObj = [];
    if(QueryObj.name != "" || QueryObj.lname != "") // take look if query is wrong
    {
        var NameB = JSON.parse(fs.readFileSync(NodesDir + "/NameBachSims.json"));
        var BInfo = NameB.BacheInfo;
        for(var i=0; i< NameB.BachCount; i++)
        {
            var LNamesimilarity = stringSimilarity.compareTwoStrings(QueryObj.lname, BInfo[i].BachLname);
            if(LNamesimilarity > MatchThresholde)
            {
                var Namesimilarity = stringSimilarity.compareTwoStrings(QueryObj.name, BInfo[i].BachName);
                if(Namesimilarity > MatchThresholde)
                {
                    ReturnObj.push(BInfo[i]);
                }
            }
        }
    }
    return ReturnObj;
}








/*
    ارسال مدرک های ثبت شده
*/
var GetBranches = function () 
{
    return Branches;
}





/*
    ثبت مدرک جدید

    arguments[0]    :   مدرک جدید
*/
var SaveNewBranch = function () 
{
    var newBranch = arguments[0];
    // for checking new branch
    newBranch.index=Branches.length;
    Branches.push(newBranch);
    SyncBranches();
}







/*
    تغییر مدارک قبلی

    arguments[0]    :   index of branch
    arguments[1]    :   branch
*/
var EditBranch = function () 
{
    if(arguments[0]<Branches.length)
    {
        var BranchData = arguments[1];
        // for checking new branch Data
        Branches[arguments[0]] = BranchData;
        SyncBranches();
    }
}




/*
    حذف مدارک قبلی

    arguments[0]    :   index of branch
*/
var DeleteBranch = function () 
{
    if(arguments[0]<Branches.length && arguments[0]>-1)
    {
        Branches.splice(arguments[0],1);
        SyncBranches();
    }
}








module.exports.init = init; // اجرای اولیه دیتابیس
module.exports.submitedUserExists = submitedUserExists; // بررسی دیتابیس کنونی
module.exports.submitedUserConfirmed = submitedUserConfirmed; // بررسی مورد تائید بودن اطلاعات ورودی دانشجو
module.exports.submitUser = submitUser; // تائید کاربر و ذخیره اطلاعات در دیتابیس کنونی
module.exports.confirmedUserExists = confirmedUserExists;   // بررسی دیتابیس دانشگاه
module.exports.confirmUser = confirmUser;   // ثبت اطلاعات دانشجو در دیتابیس دانشگاه
module.exports.GetUserInfo = GetUserInfo;   // به دست اوردن اطلاعات دانشجو از دیتابیس کنونی بر اساس شماره دانشجویی
module.exports.GetconfirmedUserInfo = GetconfirmedUserInfo; // به دست اوردن اطلاعات دانشجو از دیتابیس دانشگاه بر اساس شماره دانشجویی
module.exports.SearchUserByBioWord = SearchUserByBioWord;   // جستجوی دانشجو بر اساس قسمتی از متن بیو و یا مدرک تحصیلی
module.exports.SearchUserByName = SearchUserByName; // جستجوی دانشجو بر اساس تام و نام خانوادگی
module.exports.GetBranches = GetBranches;   // ارسال مدرک های ثبت شده
module.exports.SaveNewBranch = SaveNewBranch;   // ثبت مدرک جدید
module.exports.EditBranch = EditBranch;   // تغییر مدارک قبلی
module.exports.DeleteBranch = DeleteBranch;   // حذف مدارک قبلی