var commands = [];

function cmd(info = {}, func) {
    var data = info;

    // function attach
    data.function = func;

    // defaults
    if (data.dontAddCommandList === undefined) data.dontAddCommandList = false;
    if (!data.desc) data.desc = '';
    if (data.fromMe === undefined) data.fromMe = false;

    // ✅ IMPORTANT: Always set category properly
    data.category = info.category ? info.category : 'misc';

    if (!data.filename) data.filename = "Not Provided";

    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
};
