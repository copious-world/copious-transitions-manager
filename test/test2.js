
const {IPCChildClient} = require('message-relay-services')
const {load_json_file} = require('../lib/utils')
const {XXHash32} = require('xxhash32-node-cmake')


console.log("TEST 3 STARTS")


let hasher = new XXHash32(9347597)

let conf = load_json_file(process.argv[2])

if ( conf === undefined ) process.exit(0)

let messenger = new IPCChildClient(conf)


console.log("THIS IS TEST 2")

let any_old_key = [
    "this is a key for this is a test",
    "another key 94r9w487r you should know tests when you see them",
    "more keys are as much fun as testing lots of junk"
]


setInterval(async () => {
    let the_time =  new Date()
    let time_report = the_time.toLocaleString()
    //
    let rand_pick = Math.trunc(Math.random()*(any_old_key.length - 1))
    let txt = any_old_key[rand_pick]
    let hash = hasher.hash(txt)
    //
    let status = await messenger.get_on_path({
        "table" : "key_value",
        "hash" : hash
    },"test2")
    //
    console.log(status)
    //
    console.log("test2: One more tick: "  + time_report)

},2000)
