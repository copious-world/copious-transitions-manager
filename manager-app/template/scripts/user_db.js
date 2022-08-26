
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// MODULE: USER DB   (windowized)
//


/*
// user_data
{
    "name_key" : name_key,
    "name": '',
    "DOB" : "",
    "place_of_origin" : "", 
    "cool_public_info" : "", 
    "business" : false, 
    "public_key" : false,
    "signer_public_key" : false,
    "biometric" : false
}
*/


function identity_fn(data) {
    return data
}

let g_contacts = {}
function set_contact_map(contacts_map) {
    g_contacts = contacts_map
}

function contact_from_ucwid(user_ucwid) {
    let c = g_contacts[user_ucwid]
    return c
}

function name_key_of(user_info) {
    if ( (user_info.name === undefined) || (user_info.DOB === undefined) ) {
        return false
    }
    let name_key = `${user_info.name}-${user_info.DOB}`
    return name_key
}

function value_fallback(value) {
    let vv = value ? value : ""
    return vv
}


class HumanUserDB extends AppDBWrapper {

    constructor(conf) {
        super("human-user-records",conf)
        this.current_user_name = ""
        this.current_description = ""
        this.current_file_list = []
        //
        this.current_user_object = false
        this.current_user_data = false
        //
        this.clear_identity_list_data()
    }

    async add_user(user_object) {
        this.current_session_name = user_object.name
        let part_id = "user-meta"
        //
        let blob_data = user_object
        //
        blob_data = JSON.stringify(blob_data)
        await this.add_data(blob_data,part_id)
    }

    async update_user(user_object) {
        await this.add_user(user_object)
    }

    async get_user(sel_user) {
        try {
            let user_Obj = await this.get_session(sel_user)
            if ( user_Obj ) {
                //
                this.current_user_object = user_Obj
                //
                this.current_user_name = user_Obj.name
                //
                this.current_session_name = user_Obj.name
                //
                this.current_user_info = user_Obj.user_info
                //
                this.current_user_data = user_Obj.data
                //
                this.current_file_list = []
                let data_map = user_Obj.data
                for ( let part_id in data_map ) {
                    if ( part_id !== "user-meta" ) {
                        this.current_file_list.push(JSON.parse(data_map[part_id]))
                    }
                }
                //
                return user_Obj
            }
        } catch (e) {
            console.log("get_user")
        }
    }

    get_file_details(part_id) {
        if ( !(part_id) || (part_id.length === 0) ) return ""
        if ( this.current_user_object ) {
            let user_Obj = this.current_user_object
            if ( user_Obj ) {
                let data_map = user_Obj.data
                if ( typeof data_map[part_id] === "string" ) {
                    return JSON.parse(data_map[part_id])    
                }
            }
        }
        return false
    }

    //
    async add_file(file_name,description,svg,to_layer) {
        if ( svg === undefined ) svg = ""
        if ( to_layer == undefined ) to_layer = 0
        let file_record = {
            "name" : file_name, 
            "description" : description,
            "data" : "", "ouput" : "", "svg" : svg, "layer" : to_layer }
        //
        let data = JSON.stringify(file_record)
        await this.add_data(data,file_name)
    }

    //
    async remove_file(file_name) {
        this.current_session_name = this.current_user_name
        await this.remove_data(file_name,this.current_user_name)
    }

    //
    async remove_user() {
        this.current_session_name = this.current_user_name
        await this.delete_session(this.current_user_name)
    }

    // 
    async get_file_names() {
        let sess_name = this.current_session_name
        try {
            let sess_data = await this.get_session(sess_name)
            if ( sess_data ) {
                let f_names = Object.keys(sess_data.data)
                return f_names
            }    
        } catch (e) {
            console.log("get_file_names")
        }
        return []
    }

    async get_file_entries() {
        let sess_name = this.current_session_name
        try {
            let sess_data = await this.get_session(sess_name)
            if ( sess_data ) {
                let f_names = sess_data.data.map((f_data) => JSON.parse(f_data))
                return f_names
            }
        } catch (e) {
            console.log("get_file_entries")
        }
        return []    
    }

    // // // // // // // // // // // // // // // // // // // // // // // // // // // // 

    app_add_fields(sessionObj) {
        sessionObj.project_name = this.current_user_name
        sessionObj.author = this.current_author
        sessionObj.description = this.current_description
    }

    application_data_update(blob_url,part_id,blob_data) {
        // implemented by derived method (override)
    }

    async app_secure_total_session(sess_name) {
         // implemented by derived method (override)
    }

    application_revise_current_session(sess_name) {
        // implemented by derived method (override)
    }

    application_update_session_name_selections(sess_name,name_list) {

    }


    clear_identity_list_data() {
        this.identity_list = []
        this.user_list = []
    }

    application_total_entry(identity) {
        this.identity_list.push(identity)
        this.user_list.push(identity.user_info)
    }


    async get_known_users() {
        this.clear_identity_list_data()
        await g_human_user_storage.load_name_list()
        return [this.user_list,this.identity_list]
    }
    

}



//$>>	db_startup

const DB_VERSION = 1
const DATA_STORE = "human-projects"
const describe_data = "user records"

let g_human_user_storage = false
let g_human_user_storage_ref = [false]

async function db_startup() {
    //
    g_human_user_storage = new HumanUserDB({
        "DB_VERSION" : DB_VERSION,
        "DATA_STORE" : DATA_STORE,
        "describe_data" : describe_data
    })

    await g_human_user_storage.init_database()
    await g_human_user_storage.load_name_list()

    g_human_user_storage_ref[0] = g_human_user_storage
    
    return g_human_user_storage
}



//$>>	store_user
async function store_user(user_information,privates) {
    if ( !g_human_user_storage ) return(false)
    //
    let name_key = name_key_of(user_information)
    if ( !name_key ) return(false)
    //
    let store_u_i = Object.assign({},user_information)
    //
    let storage_obj = {		// prepare a data structure to store data made by this app's ipfs gateway
        "name" : name_key,
        "user_info" : store_u_i,
        "data" : {},
        "ucwid" : '',
        "dirs" :  '',
        "files" :  '',
        "stored_externally" : false
    }
    //
    if ( privates.priv_key ) {
        storage_obj.priv_key = privates.priv_key
    }
    //
    if ( privates.signer_priv_key ) {
        storage_obj.signer_priv_key = privates.signer_priv_key
    }
    //
    if ( privates.signature_protect ) {
        storage_obj.signature_protect = privates.signature_protect
    }
    //
    await g_human_user_storage.add_user(storage_obj)
    return(true)
}



//$>>	get_known_users
async function get_known_users() {
    if ( g_human_user_storage ) {
        return await g_human_user_storage.get_known_users()
    }
    return false
}

//$>>	get_user_public_wrapper_key
async function get_user_public_wrapper_key(name_key) {
    let user_object = await g_human_user_storage.get_user(name_key)
    if ( user_object ) {
        let pub_key = g_human_user_storage.current_user_info.public_key
        return pub_key
    }
    return false
}



//$>>	get_user_public_signer_key
async function get_user_public_signer_key(name_key) {
	//
    let user_object = await g_human_user_storage.get_user(name_key)
    if ( user_object ) {
        let signer_public_key = g_human_user_storage.current_user_info.signer_public_key
        return signer_public_key
    }
    return false
}



//$>>	unstore_user
async function unstore_user(identity) {
    let name_key = identity.name
    if ( g_human_user_storage.current_user_name !== name_key ) {
        await g_human_user_storage.get_user(name_key)
    }
    await g_human_user_storage.remove_user()
}



//$>>	finalize_user_identity
// finalize_user_identity
// Once the application gets its user ucwid's, it calls finalize_user_identity 
// and this function stores the user values in the identity object in indexedDB.
//
async function finalize_user_identity(u_info,identity_files) {
    //
// "id" : ucwid with key,
// "clear_id" : ucwid without key,
// "dir_data" : user directory structure
    //
    let storage_obj = await identity_from_user(u_info)
    //
    let ucwid = value_fallback(identity_files.id)
    storage_obj.ucwid = ucwid
    storage_obj.dirs = value_fallback(value_fallback(identity_files.dir_data).dirs)
    storage_obj.files = value_fallback(value_fallback(identity_files.dir_data).files)
    storage_obj.stored_externally =  (ucwid.length > 0)
    //
    // UPDATE
    await g_human_user_storage.update_user(storage_obj)
}





//$>>	update_identity
async function update_identity(identity) {
    try {
        let u_info = identity.user_info
        let storage_obj = await identity_from_user(u_info)
        for ( let ky in storage_obj ) {
            if ( (ky == "dirs") || (ky === "files") ) {
                storage_obj[ky] = identity[ky]
            }
        }
        if ( identity.profile_image ) {
            storage_obj.profile_image = identity.profile_image
        }
        if ( identity.asset_keys ) {
            storage_obj.asset_keys = Object.assign({},identity.asset_keys)
        }
        if ( identity.introductions ) {
            storage_obj.introductions = identity.introductions
        }
        if ( identity.messages ) {
            storage_obj.messages = identity.messages
        }
        // UPDATE
        await g_human_user_storage.update_user(storage_obj)
        //
    } catch (e) {
    }
}

//$>>	restore_identity
async function restore_identity(identity) {
    try {
        await g_human_user_storage.add_user(identity)
    } catch (e) {
    }
}


//$>>	identity_from_user
async function identity_from_user(user_info) {
    let name_key = name_key_of(user_info)
    if ( !name_key ) return(false)
    //
    try {
       let identity = await g_human_user_storage.get_user(name_key)
       return identity
    } catch (e) {
    }
    return false
}



//$>>	fix_keys
async function fix_keys(identity) {
	let u_info = identity.user_info
	if ( !u_info ) return // can't fix it
	if ( ( identity.priv_key === undefined) || ( identity.signer_priv_key === undefined ) || ( u_info.signer_public_key === undefined ) ) {
		try {
			let storage_obj = await identity_from_user(u_info)
			if ( identity.priv_key === undefined ) {
				let keypair = await pc_wrapper_keypair_promise()
				// ---- ---- ---- ----
				let pub_key = keypair.publicKey
				let priv_key = keypair.privateKey
				let exported = await g_crypto.exportKey("jwk",pub_key);
				let pub_key_str = JSON.stringify(exported)

				let priv_exported = await g_crypto.exportKey("jwk",priv_key);
				let priv_key_str =  JSON.stringify(priv_exported);
				//
				storage_obj.priv_key = priv_key_str
				u_info.public_key = pub_key_str
			}
			//
			if ( ( identity.signer_priv_key === undefined ) || ( u_info.signer_public_key === undefined ) ) {
				let signer_pair = await pc_keypair_promise()
				//
				let signer_pub_key = signer_pair.publicKey
				let signer_priv_key = signer_pair.privateKey

				let sign_exported = await g_crypto.exportKey("jwk",signer_pub_key);
				let sign_pub_key_str = JSON.stringify(sign_exported)

				let sign_priv_exported = await g_crypto.exportKey("jwk",signer_priv_key);
				let sign_priv_key_str = JSON.stringify(sign_priv_exported);
				//
				storage_obj.signer_priv_key = sign_priv_key_str					
				u_info.signer_public_key = sign_pub_key_str
			}

            // UPDATE
            await g_human_user_storage.update_user(identity)
 
		} catch (e) {
		}
	}
}




//$>>	download_identity
var downloader_url = null
async function download_identity(user_info,remove) {
    //
    let downloadlink = document.getElementById("identity-download-link")
    if ( !(downloadlink) ) return false
    try {
        //
        let identity = await identity_from_user(user_info)
        let download_str = JSON.stringify(identity,null,4)

        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(download_str);

        let ext = ".json"
        let fname = identity.name_key

        downloadlink.setAttribute("href",     dataStr     );
        downloadlink.setAttribute("download", (fname + ext) );
        downloadlink.click();
        //
        if ( remove ) {
            await unstore_user(identity)
        }
    } catch (e) {}
}


//$>>	upload_identity
async function upload_identity() {
    let identity_str = await get_file()
    let identity = JSON.parse(identity_str)
    await restore_identity(identity)
    return identity
}


async function add_user_locally(id_packet) {
    //
/*
    let id_packet = {
        "user" : user_data,
        "keys" : keys,
        "original_cwid" : key_id_pair[0],
        "ucwid" :  key_id_pair[1]
    }
*/
    //
    return true
}



function get_file() {
    get_file_from_file_element(`drop-click-file_loader`)
}

async function user_info_add_picture(fname,blob64) {
    // 
}

async function load_blob_as_url(img_ucwid) {
    //
}






//$$EXPORTABLE::
/*
db_startup
store_user
unstore_user
finalize_user_identity
update_identity
restore_identity
identity_from_user
get_known_users
get_user_public_wrapper_key
get_user_public_signer_key
fix_keys
*/
