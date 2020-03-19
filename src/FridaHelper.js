const _ps_ = require("child_process");

module.exports = {
    getLocalFridaVersion: function(pFridaPath){
        let v = _ps_.execSync(pFridaPath + ' --version');
        return v.slice(0 , v.lastIndexOf( require('os').EOL )).toString();
    }
}