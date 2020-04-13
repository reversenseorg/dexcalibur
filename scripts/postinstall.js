'use strict';

const _FS_ = require('fs');
const _PATH_ = require('path');
const _OS_ = require('os');

// Linux : /home/*/.dexcalibur
const dexcaliburPrefs = _PATH_.join( _OS_.homedir(), '.dexcalibur');

// create '.dexcalibur' folder into user home
if(_FS_.existsSync( dexcaliburPrefs)==false){
    _FS_.mkdirSync(dexcaliburPrefs);
}

// setup Dexcalibur's bootstrap file 
/*_FS_.copyFileSync( 
    _PATH_.join( __dirname, 'files', 'config.json'),
    _PATH_.join( dexcaliburPrefs, 'config.json')
);*/