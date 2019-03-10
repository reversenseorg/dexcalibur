const Dex = require("./src/project.js");

function run(app, api="android:7.0.0", port=8000){
    var proj = new Dex(app);
    proj.useAPI(api).fullscan();
    proj.web.start(port);
    return proj;
}

module.exports = {
    START: run
};