

function c2s(char_arr){
    var charr = Java.array("char",char_arr), str="";
    for(var i=0; i<char_arr.length(); i++)
        str += String.fromCharCode(char_arr[i]);

    return str;
}
