#!/usr/bin/env node
const polka = require('polka');
const send = require('@polka/send-type');
const app         = polka();
//
const { json } = require('body-parser');
const cors = require('cors')

app.use(json())
app.use(cors())
//
const fsPromise = require('fs/promises');
const fs = require('fs-extra')
const http = require('http')

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server;


const {unload_json_file} = require('../lib/utils')
const WebSocketActions = require('../lib/websocket_con')
const ShareComObjects = require('../lib/shared_table')
//
//const clone = require('clone-deep');

const { exec } = require("child_process");


class WSConsole extends console.Console {
    constructor(fn,out,err) {
        super(out,err)
        this.log_custom = fn
    }

    log(...args) {
        super.log(...args)
        this.log_custom(args)
    }
}

let save_console = false
function setup_console(fn) {
    save_console = console
    //
    let custom_console = new WSConsole(fn,process.stdout,process.stderr)
    console = custom_console
}


let g_common_key_value = {}
let g_session_key_value = {}
let g_persistence = {}      // supposed to be external, but is included here for special/test cases

let g_ws_socks = false

class ProcManager extends ShareComObjects {
    constructor(conf,c_proc) {
        super(conf)
        //
        this.c_proc = c_proc
        this.key_value = g_common_key_value
        this.session_key_value = g_session_key_value
        this.static = {}            /// maybe a class
        this.persistence = g_persistence
        //
    }

    select_tables(table_key) {
        switch ( table_key ) {
            case "key_value" : return this.key_value;
            case "session_key_value" : return this.session_key_value;
            case "static" : return this.static;
            case "persistence" : return this.persistence;
        }
    }

    get(hash,op_msg) {
        let table =  op_msg ? this.select_tables(op_msg.table) : this.key_value
        if ( !(table) ) return NaN
        let v = table[hash]
        return v
    }

    set(hash,v,op_msg) {
        let table =  op_msg ? this.select_tables(op_msg.table) : this.key_value
        if ( !(table) ) return false
        table[hash] = v
        return true
    }

    del(hash,op_msg) {
        let table =  op_msg ? this.select_tables(op_msg.table) : this.key_value
        if ( !(table) ) return false
        delete table[hash]
        return true
    }

}



//

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

let conf_str = fs.readFileSync("manager.conf").toString()
let g_config = JSON.parse(conf_str)

//
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//
const MANAGER_PORT = g_config.web_page_port


let g_proc_mamangers = {}
//


function add_one_new_proc(proc,proc_name,conf) {

    let shared_mem_table = new ProcManager(proc)
    shared_mem_table.spawn_child(proc)
    //
    g_proc_mamangers[proc_name] = shared_mem_table

    if ( conf.all_procs[proc_name] === undefined ) {
        conf.all_procs[proc_name] = proc
    }
}


function add_one_dormant_proc(proc,proc_name,conf) {
    let shared_mem_table = new ProcManager(proc)
    g_proc_mamangers[proc_name] = shared_mem_table
    if ( conf.all_procs[proc_name] === undefined ) {
        conf.all_procs[proc_name] = proc
    }
}


function update_one_proc(proc,proc_name,conf) {
    let shared_mem_table = g_proc_mamangers[proc_name]
    if ( shared_mem_table && conf.all_procs[proc_name] ) {
        conf.all_procs[proc_name] = proc
        shared_mem_table.set_conf(proc)
    }

    if ( conf.all_procs[proc_name] === undefined ) {
        console.log("attempting to update a nonexistant proc")
        console.log(proc_name)
        console.dir(proc)
        console.dir(conf.all_procs)
    }
}


function remove_proc(proc_name,conf) {
    if ( conf.all_procs[proc_name] !== undefined ) {
        let proc_m = g_proc_mamangers[proc_name]
        delete conf.all_procs[proc_name]
        delete g_proc_mamangers[proc_name]
        proc_m.stop_proc()
    }
}



function initialize_children(conf) {
    let proc_list = conf.all_procs
    //
    for ( let proc_name in proc_list ) {
        let proc = proc_list[proc_name]
        if ( proc.run_on_start ) {
            add_one_new_proc(proc,proc_name,conf)
        } else {
            add_one_dormant_proc(proc,proc_name,conf)
        }
    }
    //
}



function check_admin_pass(password) {
    if ( g_config.password === password ) {
        return true
    }
    return false
}


function sendable_proc_data() {
    let sendable = JSON.parse(JSON.stringify(g_proc_mamangers))

    for ( let ky in sendable ) {
        let descr = sendable[ky]
        delete descr.child_proc
        delete descr.key_value
        delete descr.session_key_value
        delete descr.static
    }
    return sendable
}



console.log(__dirname)


app.get('/', async (req, res) => {
    try {
        let data = await fsPromise.readFile(`${__dirname}/app/index.html`)
        let page = data.toString()
        res.end(page);
    } catch (e) {
        console.log(e)
        send(res,404,"root: could not load the requested file")
    }
});

app.get('/:file', async (req, res) => {
    let file = ""
    try {
        file = req.params.file
        let data = await fsPromise.readFile(`${__dirname}/app/${file}`)
        let page = data.toString()
        res.end(page);
    } catch (e) {
        console.log(e)
        send(res,404,"could not load the requested file" + file)
    }
})

app.get('assets/:file', async (req, res) => {
    let file = ""
    try {
        file = req.params.file
        let data = await fsPromise.readFile(`${__dirname}/app/assets/${file}`)
        let page = data.toString()
        res.end(page);
    } catch (e) {
        console.log(e)
        send(res,404,"could not load the requested file" + file)
    }
})

app.get('build/:file', async (req, res) => {
    let file = ""
    try {
        file = req.params.file
        let data = await fsPromise.readFile(`${__dirname}/app/build/${file}`)
        let page = data.toString()
        res.end(page);
    } catch (e) {
        console.log(e)
        send(res,404,"could not load the requested file" + file)
    }
})




app.get('/app/procs', (req, res) => {

    if ( g_proc_mamangers ) {
        let sendable = sendable_proc_data()
        let output = JSON.stringify(sendable,"null",2)
        return res.end(output);
    } 
    
    res.end('Get all procs running!');   // memory ,etc.
});


app.get('/app/logs/:proc_name', (req, res) => {
    res.end('show the logs of a proc!');   // get the file from the run directory.
});


app.get('/app/get-config/:enc_file',async (req, res) => {

    let file = decodeURIComponent(req.params.enc_file)
    try {
        let data = await fsPromise.readFile(`./${file}`)
        let page = data.toString()
        res.end(page);
    } catch (e) {
        res.end("could not load the requested file" + file); 
    }
})


app.post('/app/run-sys-op', async (req, res) => {
    let admin_pass = req.body.admin_pass
    let admin_OK = check_admin_pass(admin_pass)
    if ( admin_OK ) {
        //
        let operation = req.body.op
        if ( operation ) {
            switch ( operation.name ) {
                case "add-proc" : {
                    let new_proc = operation.param.proc_def
                    add_one_new_proc(new_proc,operation.param.proc_name,g_config)
                    unload_json_file("manager.conf",g_config)
                    setTimeout(ws_proc_status,1000)
                    break;
                }
                case "remove-proc" : {
                    let proc_m = g_proc_mamangers[operation.param.proc_name]
                    if ( proc_m ) {
                        proc_m.stop_proc()
                    }
                    remove_proc(operation.param.proc_name,g_config)
                    unload_json_file("manager.conf",g_config)
                    setTimeout(ws_proc_status,1000)
                    break;
                }
                case "update-proc" : {
                    let new_proc = operation.param.proc_def
                    update_one_proc(new_proc,operation.param.proc_name,g_config)
                    unload_json_file("manager.conf",g_config)
                    setTimeout(ws_proc_status,1000)
                    break;
                }
                case "stop-proc" : {
                    let proc_m = g_proc_mamangers[operation.param.proc_name]
                    if ( proc_m ) {
                        proc_m.stop_proc()
                        setTimeout(ws_proc_status,1000)
                    }
                    break;
                }
                case "run-proc" : {
                    let proc_m = g_proc_mamangers[operation.param.proc_name]
                    if ( proc_m ) proc_m.run_proc(operation.param.if_running)
                    else {
                        console.log("no proc: " + operation.param.proc_name)
                        console.log(Object.keys(g_proc_mamangers))
                    }
                    setTimeout(ws_proc_status,1000)
                    break;
                }
                case "restart-proc" : {
                    let proc_m = g_proc_mamangers[operation.param.proc_name]
                    if ( proc_m ) proc_m.restart_proc()
                    setTimeout(ws_proc_status,1000)
                    break;
                }
                case "install" : {
                    // npm installer
                    break
                }
                case "remove" : {
                    let proc_m = g_proc_mamangers[operation.param.proc_name]
                    if ( proc_m ) proc_m.stop_proc()
                    // npm remove
                    break
                }
                case "config" : {
                    let file = operation.param.file
                    let output = operation.param.config
                    try {
                        await fsPromise.writeFile(`./${file}`,output)
                    } catch (e) {
                        res.end("could not load the requested file" + file); 
                    }
                    // send a message to the child proc to reset g_config
                    break
                }
                case "exec" : {
                    let cmd_obj = operation.param.proc_def

                    let cmd_list = `${cmd_obj.runner} ${cmd_obj.args}`

                    exec(cmd_list, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        let html_fix = stdout.split('\n').join('<br>')
                        html_fix = `<div>${html_fix}</div>`
                        console.log(`stdout: ${html_fix}`);
                    });
                    // Run a short-lived command (bash script)
                    break
                }

                case "stop-all" : {
                    for ( let proc_name in g_proc_mamangers ) {
                        let proc_m = g_proc_mamangers[proc_name]
                        if ( proc_m ) {
                            proc_m.stop_proc()
                        }    
                    }
                    console.log("stopping-proess...")
                    setTimeout(() => {
                        ws_proc_status()
                        setTimeout(() => {
                            process.exit(0)
                        },2000)
                    },2000)
                    break;
                }
            }
        }
        //
    }
    send(res,200,{ "status" : "OK" })
})



function handler_ws_messages(message_body) {
    console.dir(message_body)
}


function ws_proc_status() {
    if ( g_proc_mamangers && g_ws_socks ) {
        let sendable = sendable_proc_data()
        let op_message = {
            "op" : "proc-status",
            "data" : sendable
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


function ws_console_log(data) {
    if ( g_proc_mamangers && g_ws_socks ) {
        let op_message = {
            "op" : "console-output",
            "data" : data
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------
if ( g_config.wss_app_port ) {   // WEB APP SCOCKETS OPTION (START)
// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------

    g_ws_socks = new WebSocketActions()
    
    let app_server = http.createServer(app);
    app_server.listen(g_config.wss_app_port);
    //
    var g_app_wss = new WebSocketServer({server: app_server});
    g_ws_socks.set_socket_server(g_app_wss,handler_ws_messages)
    //
    

    setInterval(() => { ws_proc_status() },5000)

    setup_console(ws_console_log)

// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------
}       // WEB APP SCOCKETS OPTION (END)
// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------


//
//
//

// ---- ---- ---- ---- ----
initialize_children(g_config)
// ---- ---- ---- ---- ----
app.listen(MANAGER_PORT)
console.log(`listening on port ${MANAGER_PORT}`)
