const ChildProcControl = require('../lib/child_proc_control')
//

// ParentIPCMessenge extends 
// ChildProcControl extends ParentIPCMessenge
// ProcManager extends ChildProcControl

// In the headless version of the host manager, (also in the headless component of the web host, internal UI service... *)
// the control process will take in commands to start, stop, run, etc. child proceses
// the control process will update configurations, etc. 

// This module will communicate on the host, from the headless process to the child 
// start, stop, pause, reconfigure, resume, and application specific commands may be passed to the child 
// from the control interface.

// TASK: replace the DB Interface with commander interface... use tools from programs such as `forever`


// (*) It is expected that some installations of the UI service will spawn local operations either at workstations or 
// at selected internal servers.

//
let g_common_key_value = {}
let g_session_key_value = {}
let g_persistence = {}      // supposed to be external, but is included here for special/test cases
//
//
class ProcManager extends ChildProcControl {
    //
    constructor(conf,parent_operations,c_proc) {
        super(conf)
        //
        this.c_proc = c_proc
        this.key_value = g_common_key_value
        this.session_key_value = g_session_key_value
        this.static = {}            /// maybe a class
        this.persistence = g_persistence
        this.operations = parent_operations
        //
    }

    init(conf) {
        
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
        let v = false
        if ( op_msg.table === "child-req" ) {
            v = this.operations.run_get_op(hash,op_msg)
        } else {
            let table =  op_msg ? this.select_tables(op_msg.table) : this.key_value
            if ( !(table) ) return NaN
            v = table[hash]    
        }
        return v
    }

    set(hash,v,op_msg) {
        if ( op_msg.table === "child-req" ) {
            return this.operations.run_set_op(op_msg,hash,v)
        } else {
            let table =  op_msg ? this.select_tables(op_msg.table) : this.key_value
            if ( !(table) ) return false
            table[hash] = v
        }
        return true
    }

    del(hash,op_msg) {
        if ( op_msg.table === "child-req" ) {
            return this.operations.run_del_op(op_msg,hash,v)
        } else {
            let table =  op_msg ? this.select_tables(op_msg.table) : this.key_value
            if ( !(table) ) return false
            delete table[hash]
        }
        return true
    }

}



module.exports = ProcManager

