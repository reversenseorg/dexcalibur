
const _path_ = require("path");


class ProjectWorkspace
{
    constructor( pEngine, pProject){
        this.engine = pEngine;
        this.project = pProject;

        this.path = _path_.join( pEngine.workspace.getLocation(), pProject.uid);
        this.appdata = _path_.join(this.path, "appdata");
        this.appdata = _path_.join(this.path, "appdata");
        this.appdata = _path_.join(this.path, "appdata");
        this.appdata = _path_.join(this.path, "appdata");
        this.appdata = _path_.join(this.path, "appdata");

    }

    getAppdataLocation(){

    }

}

module.exports = ProjectWorkspace;