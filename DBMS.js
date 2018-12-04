const fs = require('fs');
var NodesDir;

var submitedUserExists = function () {
    if (fs.existsSync(NodesDir+"/submiteds/"+arguments[0])){
        return 1;
    }
    else
    {
        return 0;
    }
}

var submitedUserConfirmed = function () {
    /*
        BachId      :   arguments[0],
        CodeMelli   :   arguments[1],
        Degrees     :   arguments[2],
        DegsCount   :   arguments[3]
    */
    if(fs.existsSync(NodesDir+"/uniDatabase/"+arguments[0]))
    {
        try
        {
            var BachOnUniDatabase = JSON.parse(fs.readFileSync(NodesDir+"/uniDatabase/"+arguments[0]));
            if(BachOnUniDatabase.CodeMelli != arguments[1]) 
            {
                console.log("code melli wrong");
                return 0;
            }
            else
            {
                var Degs = arguments[2]; // user given degrees to check
                var UniDegs = BachOnUniDatabase.Degs; // uni database degrees confirmed for user
                var ResOfDegreeConfirm = 1; // user given data confirm flag
                for(var i=0; i<arguments[3]; i++) // search all user given degrees
                {
                    var DegreeFound = 0; // assume given data is wrong
                    for(var j=0; j<BachOnUniDatabase.DegsCount && DegreeFound==0; j++) // search all uniDatabase degrees confirmed for user
                    {
                        
                        if(UniDegs[j].DegreeName == Degs[i].DegreeName && UniDegs[j].SalEtmam == Degs[i].SalEtmam)
                        {
                            console.log("deg found: "+ Degs[i].DegreeName + " on "+Degs[i].SalEtmam)
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

var submitUser = function () {
    /*
        BachId      :   arguments[0],
        Bach        :   arguments[1],
    */
   fs.writeFileSync(NodesDir+"/submiteds/"+arguments[0], JSON.stringify(arguments[1]));
}

var confirmedUserExists = function () {
    if (fs.existsSync(NodesDir+"/uniDatabase/"+arguments[0])){
        return 1;
    }
    else
    {
        return 0;
    }
}

var confirmUser = function () {
    /*
        BachId      :   arguments[0],
        Bach        :   arguments[1],
    */
   fs.writeFileSync(NodesDir+"/uniDatabase/"+arguments[0], JSON.stringify(arguments[1]));
}

var GetUserInfo = function () {
    console.log(arguments[0]);
    return JSON.parse(fs.readFileSync(NodesDir+"/submiteds/"+arguments[0]));
}

var SearchUserByBioWord = function () {
    var QueryObj = arguments[0];
    var ReturnObj = [];
    var files = fs.readdirSync(NodesDir+"/submiteds/");
    for(var i=0; i<files.length; i++)
    {
        var BachData = JSON.parse(fs.readFileSync(NodesDir+"/submiteds/"+files[i]));
        var UserBio = BachData.Bio;
        var UserDeg = BachData.Degs;
        if(QueryObj.word == "") // query with degree only
        {
            if(QueryObj.DegreeName == "0")
            {
                ReturnObj.push(BachData);
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
        else if(QueryObj.DegreeName == "0") // query with bio only
        {
            if(UserBio.includes(QueryObj.word))
            {
                ReturnObj.push(BachData);
            }
        }
        else // query with both bio and degree
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

var init = function () {
    NodesDir = arguments[0];
    if (!fs.existsSync(NodesDir)){
        fs.mkdirSync(NodesDir);
        fs.mkdirSync(NodesDir+"/submiteds");
        fs.mkdirSync(NodesDir+"/uniDatabase");
    }
}

module.exports.submitedUserExists = submitedUserExists;
module.exports.submitedUserConfirmed = submitedUserConfirmed;
module.exports.submitUser = submitUser;
module.exports.confirmedUserExists = confirmedUserExists;
module.exports.confirmUser = confirmUser;
module.exports.GetUserInfo = GetUserInfo;
module.exports.SearchUserByBioWord = SearchUserByBioWord;
module.exports.init = init;