const fs = require('fs');
var NodesDir; // database root address


var init = function () {
    NodesDir = arguments[0];
    if (!fs.existsSync(NodesDir)){
        fs.mkdirSync(NodesDir);
        fs.mkdirSync(NodesDir+"/submiteds");
        fs.mkdirSync(NodesDir+"/uniDatabase");
    }
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
                            console.log("deg found: "+ Degs[i].DegreeName + " on " + Degs[i].SalEtmam)
                            DegreeFound = 1; // this degree is confirmed by university
                        }
                    }
                    if(DegreeFound==0)
                    {
                        console.log("deg not found: "+ Degs[i].DegreeName + " on "+Degs[i].SalEtmam)
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
   fs.writeFileSync(NodesDir + "/uniDatabase/" + arguments[0], JSON.stringify(arguments[1]));
}




/*
    تائید کاربر و ذخیره اطلاعات در دیتابیس کنونی


    inputs:
        BachId      :   arguments[0]    :   شماره دانشجویی

    outputs:
        Bach        :   Object          :   اطلاعات دانشجو
*/
var GetUserInfo = function () {
    //console.log(arguments[0]);
    return JSON.parse(fs.readFileSync(NodesDir + "/submiteds/" + arguments[0]));
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
            QueryObj.word       :   متن جستجو
            QueryObj.DegreeName :   نام مدرک
            QueryObj.SalEtmam   :   سال اخذ مدرک

    outputs:
        ReturnObj   :   Array of Bach   :   آرایه ای از اطلاعات دانشجویان حاصل جستجو
*/
var SearchUserByBioWord = function () {
    var QueryObj = arguments[0];
    var ReturnObj = [];
    var files = fs.readdirSync(NodesDir+"/submiteds/");
    for(var i=0; i<files.length; i++)
    {
        var BachData = JSON.parse(fs.readFileSync(NodesDir + "/submiteds/" + files[i]));
        var UserBio = BachData.Bio;
        var UserDeg = BachData.Degs;
        if(QueryObj.word == "") // search with degree only
        {
            if(QueryObj.DegreeName == "0")
            {
                ReturnObj.push(BachData); // show allllllll records, there is no search patern
            }
            else
            {
                var UserFound = 0;
                for(var j=0; j<UserDeg.length && UserFound==0; j++)
                {
                    if(UserDeg[j].DegreeName == QueryObj.DegreeName && UserDeg[j].SalEtmam == QueryObj.SalEtmam)
                    {
                        UserFound = 1;
                    }
                }
                if(UserFound==1)
                {
                    ReturnObj.push(BachData);
                }
            }
        }
        else if(QueryObj.DegreeName == "0") // search with bio only
        {
            if(UserBio.includes(QueryObj.word))
            {
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
                    if(UserDeg[j].DegreeName == QueryObj.DegreeName && UserDeg[j].SalEtmam == QueryObj.SalEtmam)
                    {
                        UserFound = 1;
                    }
                }
                if(UserFound==1)
                {
                    ReturnObj.push(BachData);
                }
            }
        }
    }
    return ReturnObj;
}





module.exports.init = init;
module.exports.submitedUserExists = submitedUserExists;
module.exports.submitedUserConfirmed = submitedUserConfirmed;
module.exports.submitUser = submitUser;
module.exports.confirmedUserExists = confirmedUserExists;
module.exports.confirmUser = confirmUser;
module.exports.GetUserInfo = GetUserInfo;
module.exports.SearchUserByBioWord = SearchUserByBioWord;
