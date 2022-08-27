const {spawn_child} = require('../lib/child_proc_control')




class ShareComObjects {

    constructor(proc_conf) {
        this.attempt_reconnect = proc_conf.attempt_reconnect
        this.c_proc = false
        this.proc_name = proc_conf.name
        this.conf = proc_conf
        this.resolver = false
    }


    client_add_data_and_react(msg) {
        // leave it up to the descendant class to define this behavior
    }


    spawn_child() {
        //
        let args = [].concat(this.conf.args)
        if ( this.conf.runner ) {
            if( this.conf.runner !== "node" ) {
                if ( Array.isArray(args) ) {
                    args.unshift(this.conf.runner)
                } else if ( typeof args === "string" ) {
                    if ( args.indexOf(',') > 0 ) {
                        args = args.split(',')
                        args.unshift(this.conf.runner)
                    } else {
                        args = [this.conf.runner,args]
                    }
                }
            } else {
                if ( Array.isArray(args) && (args[0] !== 'node') ) {
                    args.unshift("node")
                }
            }
        } else {
            if ( Array.isArray(args) && (args[0] !== 'node') ) {
                args.unshift("node")
            } else if ( typeof args === "string" ) {
                if ( args.indexOf(',') > 0 ) {
                    args = args.split(',')
                    args.unshift('node')
                } else {
                    args = ['node',args]
                }
            }
        }
        //
        let c_proc = spawn_child(args)
        this.c_proc = c_proc
        this.child_controls(this,c_proc)
        //
    }


    _attempt_reconnect(conf) {
    }

    key_value_op(msg) {}

    // ---- ---- ---- ---- ---- ---- ----
    //
    child_controls(client,c_proc) {
        if ( c_proc ) {
            this.running = true
            //
            c_proc.on('close', (onErr) => {
                console.log(`Process ${this.proc_name} stopped...`)
                if ( this.resolver !== false ) {
                    this.resolver()
                }
                if ( onErr ) {
                    console.log(`got a closing error on ${c_proc.pid}  a child process went down`)
                }
                this.running = false
                console.log('Client closed');
                if ( client.attempt_reconnect ) {
                    client._attempt_reconnect(this.conf)
                }
            })
            //
            // this process is the parent process of c_proc
            // when the child sends a message back, a message will be unlocked and then resolved
            // when it unsolicite, it will attempt to satisfy a subscription
            c_proc.on('message',(data) => {
                client.client_add_data_and_react(data.msg)
            });
            //
            c_proc.on('error',async (err) => {
                console.log(__filename)
                console.log(err);
            })
            //
        }
    }


    send_back(msg_obj) {
        let c_proc = this.c_proc
        if ( !c_proc ) return
        let com_msg = {     // comes of mimicing network messages.
            "msg" : JSON.stringify(msg_obj)
        }
        c_proc.send(com_msg)
    }

    // ---- ---- ---- ---- ---- ---- ---- ----
    //

    stop_proc(as_promise) {
        if ( !(this.c_proc && this.c_proc.pid) ) return;
        if ( !this.running ) return
        //
        let result = true
        if ( as_promise ) {
            let self = this
            let close_promise = new Promise((resolve,reject) => {
                this.resolver = () => { resolve(true), self.resolver = false }
            })
            result = close_promise
        }
        process.kill(this.c_proc.pid,"SIGINT")
        return result
    }

    run_proc(if_running) {
        let run_it = true
        if ( if_running ) {
            if ( this.running ) {
                run_it = false
            }
        }
        if ( run_it ) {
            this.spawn_child()
        }
    }


    async restart_proc() {
        await this.stop_proc(true)
        this.run_proc(false)
    }

}



module.exports = ShareComObjects
