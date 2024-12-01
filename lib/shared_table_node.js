const ChildProcControl = require('../lib/child_proc_control')
//
//
let g_common_key_value = {}
let g_session_key_value = {}
let g_persistence = {}      // supposed to be external, but is included here for special/test cases
//
//
class ProcManager extends ChildProcControl {
    //
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



module.exports = ProcManager

