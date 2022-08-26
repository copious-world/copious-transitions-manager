const {spawn} = require('child_process')




function spawn_child(proc_name) {
    let cproc = false
    if ( Array.isArray(proc_name) ) {
        let proc = proc_name.shift()
        cproc = spawn(proc,proc_name,{ "stdio" : ["pipe","pipe","pipe","ipc"]})
    } else {
        cproc = spawn('node',[proc_name],{ "stdio" : ["pipe","pipe","pipe","ipc"]})
    }
    if ( cproc ) {
        cproc.stderr.on('data',(data) => {
            console.log(data.toString())
        })
        cproc.stdout.on('data',(data) => {
            console.log(data.toString())
        })    
    }
    return cproc
}


module.exports.spawn_child = spawn_child


