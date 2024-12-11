const {IPCChildClient} = require('message-relay-services')

// dropping the notion of callbacks for this version....

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
/**
 * ChildProcCom
 * 
 * A communication class for communication with a parent controller process.
 * The child either makes requests to the parent or responds to control commands from the parent,
 * including such thingas as configuration changes,
 * resource allocations, etc.  The child may filter some of the variables the parent has access to by 
 * providing filters.
 * 
 * 
 * When making an application specifically controlled by the host manager, then the app will include this class
 * for communication with paths to the front ends that do monintoring and administration.
 * 
 * (Exported for client applications launched by the copious-host-manager)
 * 
 */
class ChildProcCom {

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  //
    constructor(table_key,path,persistence,relays) {
        super()
        this.dirty = false
        this.root_path = process.cwd()
        this.table_key = table_key
        this.messenger_path = path
        if ( conf.client_of !== undefined ) {
            this.messenger = new MessageRelayer(conf)
        } else {
            try {       // provide a way to attach to special kinds of clients 
                        // some of them may implement communicator methods in custom ways,
                        // e.g C++, Rust, shared memory, etc.
                this.messenger = new require(conf.client_of.client_connector)
                        //
            } catch (e) {
                console.log("no configuration for conf.client_of.client_connector")
                console.log("no configuration for conf.client_of")
                console.log("bad shared table communication - exiting")
                process.exit(0)
            }
        }
    }



    initialize(conf) {
        try {
            this.messenger = new IPCChildClient(conf)
        } catch (e) {
            console.log(e)
            console.log("From within publication-igid/lib/basic-version/db_com")
        }
    }


    //
    subscribe_to_parent_commands(conf) {
        let parent_subscription_conf = conf.parent_command_conf
        //
        let handler_supplier = require(parent_subscription_conf.parent_response_handler)
        let parent_topic_list = parent_subscription_conf.accepted_topics
        //
        for ( let topic_def of parent_topic_list ) {
            let topic = topic_def.topic
            let path = "proc-control"
            let message = {}
            let handler = handler_supplier.get_supplier_action(topic,path,this)
            this.parent_messages.subscribe(topic,path,message,handler)
        }
    }



    // These become methods about state variables in the parent and child


    async update(value) {
        let status = await this.messenger.mod_on_path({
            "table" : this.table_key,
            "hash" : id,
            "v" : value
        },this.messenger_path)
        if ( status.OK ) {
            this.dirty = true
        }
        return status.OK
    }

    async delete(id) {
        let status = await this.messenger.del_on_path({
            "table" : this.table_key,
            "hash" : id
        },this.messenger_path)
        if ( status.OK ) {
            this.dirty = true
        }
        return status.OK
    }

    async get(id) {
        let obj = await this.messenger.get_on_path({
            "table" : this.table_key,
            "hash" : id
        },this.messenger_path)
        if ( obj.err !== undefined ) return false
        return obj.v
    }

    async set(id,value) {
        let status = await this.messenger.set_on_path({
            "table" : this.table_key,
            "hash" : id,
            "v" : value
        },this.messenger_path)
        //
        if ( status.OK ) {
            this.dirty = true
        }
        return status.OK
    }

}



module.exports = ChildProcCom