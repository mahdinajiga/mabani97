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
    */
    if(fs.existsSync(NodesDir+"/uniDatabase/"+arguments[0]))
    {
        try
        {
            var BachOnUniDatabase = JSON.parse(fs.readFileSync(NodesDir+"/uniDatabase/"+arguments[0]));
            if(BachOnUniDatabase.CodeMelli != arguments[1]) 
            {
                return 0;
            }
            else
            {
                return 1;
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
module.exports.init = init;