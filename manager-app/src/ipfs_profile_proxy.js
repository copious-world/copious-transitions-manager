
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
const CONTACTS = 'contacts'
const MANIFEST  = 'manifest'
const TOPICS = 'topics'

const CURRENT_PRIVATE_MESSAGE_VERSION = 1.2
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
let g_search_table = {}
let g_when_table = {}
let g_all_keys = []

let g_prune_timeout = null

const TIMEOUT_THRESHHOLD = 4*60*60
const SIG_REQUIRED = false


var alert_error = (msg) => {
    alert(msg)
    console.log(new Error("stack"))
}

export function set_alert_error_handler(fn) {
    if ( typeof fn === 'function' ) {
        alert_error = fn
    }
}


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


// // https://www.copious.world/interplanetary-contact
var g_profile_port = ''   // 6111
function correct_server(srvr) {
    if ( srvr.indexOf(':5') > 0 ) {
        srvr = srvr.replace('5111','6111')   /// CHANGE ...        
    }
    return srvr
}

var g_stem_prefix = 'interplanetary-contact/contact/'   // by service...


// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
// ASSETS


async function fetch_asset(topics_cid,identity,btype,asset) {  // specifically from this user
    //
    let user_cid = identity.cid
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol

    btype = btype ? true : false
    
    let data_stem = `${g_stem_prefix}get-asset/${asset}`
    let sp = '//'
    let post_data = {
        "btype" : btype,
        "user_cid" : user_cid,
        "cid" : topics_cid
    }
    let search_result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( search_result ) {
        if ( search_result.status === "OK" ) {
            let data = search_result[asset];
            if ( typeof data === 'string' ) {
                let decryptor = await window.user_decryption(identity,asset)      // user user cid to get the decryptor...
                if ( decryptor !== undefined ) {
                    try {
                        data = await decryptor(data)        // decryption
                    } catch (e) {
                    }
                }
                if ( data ) {
                    try {
                        let data_obj = JSON.parse(data)
                        return data_obj
                    } catch (e) {
                        return [false,data]
                    }
                }    
            } else {
                return data
            }
        }
    } else {
        return [false,search_result]
    }
}


export async function fetch_contacts(contacts_cid,identity,btype) {  // specifically from this user
    return await fetch_asset(contacts_cid,identity,btype,CONTACTS)
}

export async function fetch_manifest(manifest_cid,identity,btype) {  // specifically from this user
    return await fetch_asset(manifest_cid,identity,btype,MANIFEST)
}

export async function fetch_topics(topics_cid,identity,btype) {  // specifically from this user
    return await fetch_asset(topics_cid,identity,btype,TOPICS)
}


// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
// ASSETS


async function update_asset_to_ipfs(asset,identity,is_business,contents) {
    let user_cid = identity.cid
    let srver = location.host
    srver = correct_server(srver)
    //
    if ( typeof contents !== 'string' ) {
        contents = JSON.stringify(contents)
    }
    let encryptor = await window.user_encryption(identity,asset)
    let encoded_contents = contents
    if ( encryptor !== undefined ) {        // encryption
        encoded_contents = await encryptor(contents)
    }
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}put-asset/${asset}`
    let sp = '//'
    let post_data = {
        "cid" : user_cid,
        "business" : is_business,
        "contents" : encoded_contents
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        return result.update_cid
    }
    return false
}


export async function update_contacts_to_ipfs(identity,is_business,contents) {
    return await update_asset_to_ipfs(CONTACTS,identity,is_business,contents)
}

export async function update_manifest_to_ipfs(identity,is_business,contents) {
    return await update_asset_to_ipfs(MANIFEST,identity,is_business,contents)
}

export async function update_topics_to_ipfs(identity,is_business,contents) {
    return await update_asset_to_ipfs(TOPICS,identity,is_business,contents)
}

// // contact page
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------

//
// fetch_contact_page
//
export async function fetch_contact_page(identity,business,asset,contact_cid) {  // specifically from this user
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}get-contact-page/${asset}`     // asset as parameter
    let sp = '//'

    let post_data = {
        "cid" : contact_cid,     //
        "business" : business
    }
    let search_result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( search_result ) {
        let contact_form = search_result.contact;
        let decryptor = window.user_decryption(identity,asset)
        if ( decryptor !== undefined ) {
            try {
                contact_form = await decryptor(contact_form)
            } catch (e) {
            }
        }
        if ( contact_form ) {
            if ( typeof contact_form === "string" ) {
                let data_obj = JSON.parse(contact_form)
                try {
                    return data_obj
                } catch (e) {
                }
            } else {
                return contact_form
            }
        }
    }
    return false
}

// // 
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------

let g_user_fields = ["name", "DOB", "place_of_origin", "cool_public_info", "business", "public_key", "signer_public_key", "biometric"]
// not checking for "cid" for most cases...
export async function add_profile(u_info) {
    let user_info = Object.assign(u_info)
    //
    for ( let field of g_user_fields ) {
        if ( user_info[field] === undefined ) {
            if ( field ===  "public_key" ) {
                let p_key = get_user_public_wrapper_key(`${user_info.name}-${user_info.DOB}`)   // out of DB (index.html)
                if ( p_key ) {
                    user_info.public_key = p_key
                    continue
                }
            }
            if ( field ===  "signer_public_key" ) {
                let p_key = get_user_public_signer_key(`${user_info.name}-${user_info.DOB}`)   // out of DB (index.html)
                if ( p_key ) {
                    user_info.signer_public_key = p_key
                    continue
                }
            }
            alert_error("undefined field " + field)
            return
        }
    }
    if ( user_info.cid !== undefined ) {        // remove reference to a cid when adding a new profile...
        delete user_info.cid
    }
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}add/profile`
    let sp = '//'
    let post_data = user_info
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let ipfs_identity = result.data
        if ( typeof ipfs_identity.dir_data === 'string' ) {
            ipfs_identity.dir_data = JSON.parse(ipfs_identity.dir_data)
        }
        // "id" : cid with key,
        // "clear_id" : cid without key,
        // "dir_data" : user directory structure
        u_info.cid = ipfs_identity.id
        await finalize_user_identity(u_info,ipfs_identity)
        return true
    }
    return false
}


export async function fetch_contact_cid(someones_info,clear) {  // a user,, not the owner of the manifest, most likely a recipients
    let user_info = Object.assign({},someones_info) 
    for ( let field of g_user_fields ) {
        if ( user_info[field] === undefined ) {
            if ( (field === "public_key") && clear ) {
                delete user_info.public_key
                continue;
            }
            if ( (field === "signer_public_key") && clear ) {
                delete user_info.signer_public_key
                continue;
            }
            if ( (field === "biometric")  && clear ) {     // when wrapping a key use the recipients public wrapper key
                // delete public_key key from messages that are introductions, etc. (this is used for the clear user directory id)
                delete user_info.biometric            
                continue
            }
            alert_error("undefined field " + field)
            return
        }
    }
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}get/user-cid`
    let sp = '//'
    let post_data = user_info
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let cid = result.cid
        return cid
    }
    return false
}

export async function fetch_cid_json(jcid) {
    if ( jcid === undefined ) return false
    //
    let data_stem = `${g_stem_prefix}get/json-cid/${jcid}`
    let result = await fetchEndPoint(data_stem,g_profile_port)
    if ( result.status === "OK" ) {
        let json_str = result.json_str
        if ( typeof json_str === "string" ) {
            try {
                displayable = JSON.parse(json_str)
                return displayable
            } catch (e) {}    
        } else {
            return json_str
        }
    }
    return false
}




export async function fetch_contact_info(cid) {  // a user,, not the owner of the manifest, most likely a recipients
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}get/user-info`
    let sp = '//'
    let post_data = {
        "cid" : cid
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let user_info = result.user_info
        return user_info
    }
    return false
}




export async function get_dir(identity,clear) {
    //
    let user_info = identity.user_info
    for ( let field of g_user_fields ) {
        if ( user_info[field] === undefined ) {
            if ( (field === "public_key")  && !(clear) ) {
                let p_key = get_user_public_wrapper_key(`${user_info.name}-${user_info.DOB}`)
                if ( p_key ) {
                    user_info[field] = p_key
                    continue
                }
            }
            if ( (field === "signer_public_key")  && !(clear) ) {
                //continue
                let p_key = get_user_public_signer_key(`${user_info.name}-${user_info.DOB}`)
                if ( p_key ) {
                   user_info[field] = p_key
                   continue
                }
            }
            alert_error("undefined field " + field)
            return
        }
    }
    //
    if ( clear ) {
        delete user_info.public_key 
    }
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}dir`
    let sp = '//'
    let post_data = user_info
    post_data.cid = identity.cid
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let dir_tree = result.data
        try {
            dir_tree = JSON.parse(dir_tree)
            return dir_tree
        } catch (e) {}
    }
    return false
}

// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------

let g_message_fields = ["name", "user_cid", "subject", "readers", "date", "when", "business", "public_key", "wrapped_key", "encoding","message"]
async function send_kind_of_message(m_path,recipient_info,identity,message,clear) {
    //
    let user_info = identity.user_info  // from sender == user_info
    // assume that user info has been properly formed and ready to act as recipient
    //
    // make sure that 
    let recipient = Object.assign({},recipient_info)
    for ( let field of g_user_fields ) {
        if ( (field === "public_key")  && clear ) {     // when wrapping a key use the recipients public wrapper key
            // delete public_key key from messages that are introductions, etc. (this is used for the clear user directory id)
            delete recipient_info.public_key            
            continue
        }
        if ( (field === "signer_public_key")  && clear ) {     // when wrapping a key use the recipients public wrapper key
            // delete public_key key from messages that are introductions, etc. (this is used for the clear user directory id)
            delete recipient_info.signer_public_key            
            continue
        }
        if ( (field === "biometric")  && clear ) {     // when wrapping a key use the recipients public wrapper key
            // delete public_key key from messages that are introductions, etc. (this is used for the clear user directory id)
            delete recipient_info.biometric            
            continue
        }
        if ( recipient[field] === undefined ) {
            alert_error("undefined field " + field)
            return
        }
    }

    let sendable_message = Object.assign({},message)
    //
    let user_cid = identity.cid
    sendable_message.user_cid = user_cid    // cid of from  (should have been set)
                                                        // the recipient will wrap key with this (so refresh his memory)
    if ( clear ) {
        sendable_message.public_key = user_info.public_key
        sendable_message.signer_public_key = user_info.signer_public_key  // send the signature key in the intro (just this once)
        // the id of the clear directory ignores the key.
        // the identity of established contact messages requires the public key (so it stays for not clear)
        delete recipient.public_key  // this has to do with the identiy and the directory where introductions go.
        delete recipient.signer_public_key  // and this. Clear identity does not use keys
    } else  {
        //
        if ( sendable_message.when === undefined ) sendable_message.when = Date.now()
        if ( sendable_message.date === undefined ) sendable_message.date = (new Date(message.date)).toISOString()
        if ( sendable_message.name === undefined ) sendable_message.name = user_info.name       // from

        // should have been set in the interface ... but can still catch this here.
        sendable_message.public_key = user_info.public_key  // basically says we know the recipient (we have talked)
        sendable_message.nonce = message.nonce  // for AES CBC...
        //
        // CAN'T PROCEED WITHOUT A KEY
        //
        let key_to_wrap = await window.gen_cipher_key()  /// this will be an AES KEY, new each time.
        if ( key_to_wrap === undefined || !(key_to_wrap) ) {
            alert_error("could not get key ")
            alert("no cipher key")
            return
        } else {
            //
            sendable_message.message = JSON.stringify(message)  // STRINGIFY
            //
            let encryptor = await window.user_encryption(identity,"message")  // encryptor may vary by user... assuming more than one in indexedDB
            let encoded_contents = sendable_message.message 
            if ( encryptor !== undefined ) {
                let aes_key = key_to_wrap                   // ENCRYPT
                encoded_contents = await encryptor(encoded_contents,aes_key,sendable_message.nonce)  // CBC starting with nonce...
            }
            sendable_message.message = encoded_contents     // ENCODED
            //
            // WRAP the key just used with the public wrapper key of the recipient (got the key via introduction...)
            sendable_message.wrapped_key = await window.key_wrapper(key_to_wrap,recipient.public_key)
            // SIGN the wrapped key using the sender's private signer key (receiver should already have public signature...)
            sendable_message.signature = await window.key_signer(sendable_message.wrapped_key,identity.signer_priv_key)
            //
            delete sendable_message.subject
            delete sendable_message.readers
        }

        sendable_message.version = CURRENT_PRIVATE_MESSAGE_VERSION
    }
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}${m_path}`
    let sp = '//'
    let post_data = {
        "receiver" : recipient,
        "message" : sendable_message
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let m_cid = result.message_cid
        return m_cid
    }
    return false
}

/*
if ( !(introduction) && encrypting ) {
    if ( encrypting ) {
        message = {
            "name" : active_identity.user_info.name,
            "user_cid" : active_identity.cid
        }
        let [wrapped, aes_key] = get_wrapped_aes_key(public_key)  // recipient's public wrapper key
        message.wrapped_key = wrapped
        message.ctext = get_encipherd_message(JSON.stringify(message_object),aes_key)
    }
}
*/


export async function send_message(recipient_info,identity,message) {
    let m_path = 'send/message'
    let result = await send_kind_of_message(m_path,recipient_info,identity,message,false)
    return result
}


export async function send_introduction(recipient_info,identity,message) {
    let m_path = 'send/introduction'
    let result = await send_kind_of_message(m_path,recipient_info,identity,message,true)
    return result
}


export async function send_topic(recipient_info,identity,message) {
    let m_path = '/send/topic'
    let result = await send_kind_of_message(m_path,recipient_info,identity,message,false)
    return result
}


export async function send_topic_offer(recipient_info,identity,message) {
    let m_path = '/send/topic_offer'
    let result = await send_kind_of_message(m_path,recipient_info,identity,message,true)
    return result
}

// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------

async function* message_decryptor(messages,identity) {
    let priv_key = identity.priv_key
    for ( let message of messages ) {
        if ( message.version && (message.version > 1.0) ) {
            let wrapped_key = message.wrapped_key
            try {
                let signature = message.signature
                if ( signature || SIG_REQUIRED ) {
                    if ( !signature ) continue
                    let user_cid = message.user_cid
                    let contact = contact_from_cid(user_cid)
                    let signer_pub_key = contact.signer_public_key
                    //
                    let ok = await window.verifier(wrapped_key,signature,signer_pub_key)
                    if ( !(ok) ) continue
                }
                let clear_m = await window.decipher_message(message.message,wrapped_key,priv_key,message.nonce)
                if ( clear_m !== false ) {
                    message.message = JSON.parse(clear_m)
                } else {
                    continue
                }
            } catch (e) {}
        }
        yield message
    }
}

async function clarify_message(messages,identity) {
    let clear_messages = []
    try {
        for await (let message of message_decryptor(messages,identity) ) {
            try {
                let cmessage = false
                if ( typeof message.message === "string" ) {
                    cmessage = JSON.parse(message.message)
                } else {
                    cmessage = message.message
                }
                if ( message.f_cid ) {
                    cmessage.f_cid =  message.f_cid
                }
                clear_messages.push(cmessage)
            } catch (e) {
                //clear_messages.push(message)
            }
        }
    } catch (e) {
        console.log('caught', e)
    }
    return(clear_messages)
}

// get_spool_files
//  ---- identity - sender's information...
//  ---- spool_select - the name of a spool, e.g. 'spool' 'deleted', 'read', 'events', etc.
//  ---- clear -- WHICH PATHWAY -- use either the 'clear' cid path (no keys, no encryption) or use the key based message pathway, cid
//  ---- offset -- offset into the dirctory list (paging)
//  ---- count -- max per page
//
async function get_spool_files(identity,spool_select,clear,offset,count) {
    //
    let cid = identity.cid
    if ( clear ) {
        cid = identity.clear_cid
    }
    if ( cid === undefined ) return false
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}get-spool`
    let sp = '//'
    let post_data = {
        'cid' : cid,
        'spool' : spool_select,  // false for introduction
        'business' : identity.user_info.business,
        'offset' : offset,
        'count' : count
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let messages = result.data
        let cid_list = result.cid_list
        try {
            if ( Array.isArray(messages) ) {
                messages = messages.map((msg,index) => {
                    if ( typeof msg === "string" ) {
                        try {
                            let obj = JSON.parse(msg)
                            if ( cid_list ) {
                                obj.f_cid = cid_list[index]
                            }
                            return obj
                        } catch(e) {
                            return msg
                        }
                    }
                })
            } else if ( typeof messages === 'string' ) {
                messages = JSON.parse(messages)
            }
            if ( !clear ) {
                messages = await clarify_message(messages,identity)
            }
            return messages
        } catch (e) {}
    }
    return false
}


async function get_special_files(identity,op_category,offset,count) {
    //
    return await get_spool_files(identity,op_category,false,offset,count)
    //
}


export async function get_message_files(identity,offset,count) {
    // picks up both clear and encrypted messages...
    //
    // expected_messages -- decrypted messages from the key based identity
    let expected_messages = await get_spool_files(identity,true,false,offset,count)
    //
    // solicitations -- message sent by those who don't have the receiver's public keys 
    let solicitations = await get_spool_files(identity,true,true,offset,count)
    //
    return [expected_messages,solicitations]
}

export async function get_topic_files(identity,offset,count) {
    let expected_messages = await get_spool_files(identity,false,false,offset,count)
    let solicitations = await get_spool_files(identity,false,true,offset,count)
    return [expected_messages,solicitations]
}

export async function get_categorized_message_files(identity,op_category,offset,count) {
    let expected_messages = await get_special_files(identity,op_category,offset,count)
    return expected_messages
}


// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//
//  PUBLIC TEMPLATES AVAILABLE FROM DESIGNERS....
//


export async function get_template_list(offset,count,category,btype) {
    //
    if ( category === undefined ) {
        category = 'any'
    }
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}template-list/${category}`
    let sp = '//'
    let post_data = {
        'category' : category,
        'business_types' : btype ? "business" : "profile",
        'start' : offset,
        'count' : count
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let t_list = result.templates
        try {
            t_list = JSON.parse(t_list)
            return t_list
        } catch (e) {}
    }
    return false
}



export async function get_contact_template(template_cid) {
    //
    let data_stem = `${g_stem_prefix}get/template-cid/${template_cid}`
    let result = await fetchEndPoint(data_stem,g_profile_port)
    if ( result.status === "OK" ) {
        let contact_template = result.template
        if ( typeof contact_template === "string" ) {
            try {
                contact_template = JSON.parse(contact_template)
                return contact_template
            } catch (e) {}    
        } else {
            return contact_template
        }
    }
    return false
}


export async function get_named_contact_template(template_name,biz) {
    //
    let biz_t = biz ? "business" : "profile"
    let data_stem = `${g_stem_prefix}get/template-name/${biz_t}/${template_name}`
    let result = await fetchEndPoint(data_stem,g_profile_port)
    if ( result.status === "OK" ) {
        let contact_template = result.data
        try {
            t_list = JSON.parse(contact_template)
            return contact_template
        } catch (e) {}
    }
    return false
}



export async function get_named_contact_template_cid(template_name,biz) {
    let data_stem = `${g_stem_prefix}get/template-cid-from-name/${biz}/${template_name}`
    let result = await fetchEndPoint(data_stem,g_profile_port)
    if ( result.status === "OK" ) {
        let cid = result.cid
        return cid
    }
    return false
}


export async function put_contact_template(name,data) {
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    if ( typeof data !== 'string' ) {
        data = JSON.stringify(data)
    }
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}put/template`
    let sp = '//'
    let post_data = {
        'name' : name,
        'uri_encoded_json' : encodeURIComponent(data)
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let t_cid = result.template_cid
        return t_cid
    }
    return false
}

// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//

export async function message_list_ops(user_cid,dst_cid,op,param,biz_t,message_list,src_cat) {
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}message-list-op/${op}`
    let sp = '//'
    let post_data = {
        'user_cid' : user_cid,
        'dst_cid' : dst_cid,
        'param' : param,
        'business' : biz_t,
        'message_list' : message_list.join(',')
    }
    if ( src_cat ) {
        post_data.source_category = src_cat
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let t_cid = result.template_cid
        return t_cid
    }
    return false
}


// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//

const CHUNK_SIZE = 1000000
// upload_data_file
export async function upload_data_file(name,blob64) {
    //
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}put/blob`
    let sp = '//'
    let len = blob64.length
    let post_data = {
        "name" : name,
        "tstamp" : Date.now(),
        "offset" : 0,
        "chunk" : "",
        "end" : false
    }
    for ( let i = 0; i < len; i += CHUNK_SIZE ) {
        let chunk = blob64.substr(i,CHUNK_SIZE)
        post_data.chunk = chunk
        post_data.offset = i
        if ( (i + CHUNK_SIZE ) > len ) {
            post_data.end = true
        }
        let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
        if ( result.status === "OK" ) {
            if ( result.end_of_data ) {
                let f_cid = result.cid
                return f_cid    
            }
        }
    }

    return false
    //
}




export async function load_blob_as_url(blob_cid) {
    let srver = location.host
    srver = correct_server(srver)
    //
    let prot = location.protocol  // prot for (prot)ocol
    let data_stem = `${g_stem_prefix}get/blob`
    let sp = '//'
    let post_data = {
        "cid" : blob_cid
    }
    let result = await postData(`${prot}${sp}${srver}/${data_stem}`, post_data)
    if ( result.status === "OK" ) {
        let data = result.data
        return data    
    }
    //
    return false
}


// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//


// dont_store_html
export function dont_store_html(manifest_obj) {
    //
    let cc_forms = manifest_obj.custom_contact_forms
    //
    let cids = []
    let cid_map = {}
    if ( Array.isArray(cc_forms) ) {
        for ( let entry of cc_forms ) {
            delete entry.html;
            let cid = entry.cid
            if ( entry.preference === undefined ) {
                entry.preference = 1.0
            }
            cids.push(entry.cid)
            cid_map[cid] = entry
        }
    } else {
        cid_map = cc_forms
        for ( let cid in cc_forms ) {
            let entry = cc_forms[cid]
            delete entry.html;
            entry.cid = cid
            cids.push(cid)
        }
    }

    manifest_obj.custom_contact_forms = cid_map
    manifest_obj.sorted_cids = cids.sort((a,b) => {
        return(cid_map[a].preference - cid_map[b].preference)
    })
}
