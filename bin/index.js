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
const ShareComObjects = require('../lib/shared_table')
const WebSocketActions = require('../lib/websocket_con')
//


let g_common_key_value = {}
let g_session_key_value = {}

let g_ws_socks = false

class ProcManager extends ShareComObjects {
    constructor(conf,c_proc) {
        super(conf)
        //
        this.c_proc = c_proc
        this.key_value = g_common_key_value
        this.session_key_value = g_session_key_value
        this.static = {}            /// maybe a class
        //
    }

    select_tables(table_key) {
        switch ( table_key ) {
            case "key_value" : return this.key_value;
            case "session_key_value" : return this.session_key_value;
            case "static" : return this.static;
        }
    }

    client_add_data_and_react(op_msg) {
        let table = this.select_tables(op_msg.table)
        switch ( op_msg.op ) {
            case "G" : {
                let v = table[op_msg.key]
                if ( v !== undefined ) {
                    this.send_back({ "hash" : op_msg.hash, "v" : v })
                } else {
                    this.send_back({ "hash" : op_msg.hash, "err" : "none" })
                }
                break;
            }
            case "S" : {
                table[op_msg.key] = op_msg.v
                this.send_back({ "hash" : op_msg.hash, "OK" : true })
                break;
            }
            case "D" : {
                delete table[op_msg.key]
                this.send_back({ "hash" : op_msg.hash, "OK" : true })
                break;
            }
        }
    }
}



//

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

let conf_str = fs.readFileSync("manager.conf").toString()
let g_config = JSON.parse(conf_str)

//
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//
const MANAGER_PORT = 8989


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


function remove_proc(proc_name) {
    if ( conf.all_procs[proc_name] !== undefined ) {
        let proc_m = g_proc_mamangers[proc_name]
        delete conf.all_procs[proc_name]
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



app.get('/', async (req, res) => {
    try {
        let data = await fsPromise.readFile('./app/index.html')
        let page = data.toString()
        res.end(page);
    } catch (e) {
        res.end("could not load the requested page"); 
    }
});


app.get('/procs', (req, res) => {

    if ( g_proc_mamangers ) {
        let output = JSON.stringify(g_proc_mamangers,"null",2)
        return res.end(output);
    } 
    
    res.end('Get all procs running!');   // memory ,etc.
});


app.get('/logs/:proc_name', (req, res) => {
    res.end('show the logs of a proc!');   // get the file from the run directory.
});
  

app.post('/run-sys-op', async (req, res) => {
    let admin_pass = req.body.admin_pass
    let admin_OK = check_admin_pass(admin_pass)
    if ( admin_OK ) {
        //
        let operation = req.body.op
        if ( operation ) {
            switch ( operation.name ) {
                case "add-proc" : {
                    add_one_new_proc(proc,proc_name,g_config)
                    unload_json_file("manager.conf",g_config)
                    break;
                }
                case "remove-proc" : {
                    remove_proc(operation.param.proc_name)
                    unload_json_file("manager.conf",g_config)
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
                    // send a message to the child proc to reset g_config
                    break
                }
                case "exec" : {
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
        let op_message = {
            "op" : "proc-status",
            "data" : g_proc_mamangers
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
