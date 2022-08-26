


// ----
let g_search_table = {}
let g_when_table = {}
let g_all_keys = []

let g_prune_timeout = null

const TIMEOUT_THRESHHOLD = 4*60*60

// got this from somewhere
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


function gen_unique_id() {
    let ky = uuidv4()
    while ( g_all_keys.indexOf(ky) >= 0 ) ky = uuidv4()
    return ky
} 

function prune_old_keys() {
    //
    let deleters = []
    let tcheck = Date.now()
    for ( let ky in g_search_table ) {
        let was_when = g_when_table[ky]
        if ( (tcheck - was_when) > TIMEOUT_THRESHHOLD ) {
            deleters.push(ky)
        }
    }
    deleters.forEach((ky) => {
        delete g_when_table[ky]
        delete g_search_table[ky]
    })

    deleters = []  // push it along
}


export function add_search(key) {
    if ( g_all_keys.length >= 200 ) {
        if ( g_prune_timeout === null ) {
            g_prune_timeout = setTimeout(prune_old_keys,60000*10)
        }
    }
    let uid = gen_unique_id()
    g_search_table[key] = uid // writes over old seaches
    g_when_table[key] = Date.now()
    g_all_keys = Object.keys(g_search_table)
    return(uid)
}


export function get_search(key,add_if_new = false) {

    if ( key in g_search_table ) {
        return(g_search_table[key])
    }
    if ( add_if_new ) {
        return(add_search(key))
    }
}