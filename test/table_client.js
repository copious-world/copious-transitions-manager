//
const ChildProcCom = require('../lib/client_com')
const {ChildProcDBComInterface} = requie('shared-table-types')
const {load_json_file} = require('../lib/utils')
const {XXHash32} = require('xxhash32-node-cmake')


console.log("TEST 3 STARTS")


let hasher = new XXHash32(9347597)

let conf = load_json_file(process.argv[2])

if ( conf === undefined ) process.exit(0)




let controlled_node = new ChildProcCom(conf)
let table_client = new ChildProcDBComInterface(conf.shared_table)

let messenger = table_client
let parent_messenger = controlled_node


controlled_node.acts_on(table_service)
controlled_node.table_client(table_service)




let any_old_key = [
    "this is a key for this is a test",
    "another key 94r9w487r you should know tests when you see them",
    "more keys are as much fun as testing lots of junk"
]



let things_to_send = [
    "this is a test",
    "you should know tests when you see them",
    "have fun testing lots of junk"
]

setInterval(async () => {
    //
    let the_time =  new Date()
    let time_report = the_time.toLocaleString()
    //
    let rand_pick = Math.trunc(Math.random()*(any_old_key.length - 1))
    let txt = any_old_key[rand_pick]
    let hash = hasher.hash(txt)
    //
    let status = await messenger.set_on_path({
        "table" : "key_value",
        "hash" : hash,
        "v" : things_to_send[rand_pick]
    },"test2")
    //
    console.log(status)
    //
    console.log("test3: One more tick: "  + time_report)
},2000)
