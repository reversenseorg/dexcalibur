#!/bin/sh
if [ $(basename $PWD) == 'dexcalibur' ] 
then 
    $(jsdoc -d ./docs -r . -c ./scripts/config.jsdoc.json)
else
    echo "Go into ./dexcalibur/ folder before to run JSDoc."
fi