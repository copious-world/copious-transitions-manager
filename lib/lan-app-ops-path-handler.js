#!/usr/bin/env node

const {PathHandler,path_hanlder_classes} = require('message-relay-services')


const HostOps = require('../lib/host_ops')
const AllProcsManager = require('../all_procs_manager')


// This process becomes the forever process manager for processes launched off of a very private web service.
//

// For each type of shared table launched, this process maintains a list of interface types that may be configured 
// for processes that it launches. Also, can launch other DB management processes. 
// When this launches a processes, it can check that the configuration of the process has an interface conforming 
// to the types of DB managers that this has launched.

// Principle going forward: Every single application process can attach to a DB/Shared Mem table, while every DB or table 
// is a standalone manager that provides lifecycle for the shared object. 

// This proces, the copious-transions-manager, manages the DB lifecycle processes and spawns applications configured to attach 
// to the share objects. 



//
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//

console.log(__dirname)

/**
 * ProcJSTableManager
 * 
 * This class provides a fuax DB interface for parents and children. 
 * There is no message forwarding for communication between the classes. 
 * 
 */
class PathHandlerProcManager extends PathHandler {
    //
    constructor(conf,all_procs) {
        super(conf)
        //
        this._all_procs = new AllProcsManager(conf)
        this._host_ops = new HostOps(conf,this._all_procs)
        //
        // ---- ---- ---- ---- ----
        this._all_procs.initialize_children()
        // ---- ---- ---- ---- ----
    }

    //
    id_augmentation(msg_obj) {
        let user_id = msg_obj._user_dir_key ? msg_obj[msg_obj._user_dir_key] : msg_obj._id
        if ( (user_id === undefined) && (msg_obj._id !== undefined) ) {
            user_id = msg_obj._id
        }
        msg_obj._id = user_id
    }

    //
    async app_message_handler(msg_obj) {
        let op = msg_obj._tx_op
        let result = "ERR"
        //
        this.id_augmentation(msg_obj)
        //
        switch ( op ) {
            case 'S' : {
                //
                if ( await this._host_ops.app_run_sys_op(msg_obj) ) {
                    result = "OK"
                }
                //
                return({ "status" : result,  "explain" : "set", "when" : Date.now() })
            }
            case 'M' : {
                result = "OK"


                return({ "status" : result,  "explain" : "mod", "when" : Date.now() })
            }
            case 'G' : {        // get user information
                let data = ""

                let status = await this._host_ops.data_read_op(msg_obj)

                if ( status ) {
                    result = "OK"
                    data = msg_obj.data
                }

                return({ "status" : result, "data" : data,  "explain" : "get", "when" : Date.now() })
            }
            case 'D' : {        // delete asset from everywhere if all ref counts to zero. (unpinned)

                return({ "status" : result,  "explain" : "del", "when" : Date.now() })
            }
            default: {  // or send 'S'
                let status = false

                result = status ? "OK" : "ERR"
            }
        }
        //
        return({ "status" : result, "explain" : `${op} performed`, "when" : Date.now(), "_tracking" : msg_obj._tracking })
    }
}


path_hanlder_classes["PROC-MANAGER"] = PathHandlerProcManager;


module.exports.PathHandlerProcManager = PathHandlerProcManager
