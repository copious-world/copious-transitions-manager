//import UCWID from "ucwid";
//import crypto_wraps from "crypto-wraps"

/*
    // add by gen_public_key
	info.public_key = keys.pk_str		// user info is the basis for creating a user cid the public key is part of it
	info.signer_public_key = keys.signer_pk_str
	info.axiom_public_key = keys.axiom_pk_str

    // resulting packet
    id_packet = {
        "name": name,
        "DOB" : DOB,
        "place_of_origin" : place_of_origin, 
        "cool_public_info" : cool_public_info, 
        "business" : (business === undefined) ? false : business, 
        "public_key" : public_key,
        "signer_public_key" : signer_public_key,
        "axiom_public_key" : axiom_public_key,
        "ccwid" : "aksbsdkufhsiufkesh",

        "public_component" : {
            "name" : "Mr. Jones",
            "place_of_origin" : place_of_origin, 
            "ccwid" : "aksbsdkufhsiufkesh",
            "business" : (business === undefined) ? false : business,
            "public_key" : public_key,
            "signer_public_key" : signer_public_key,
            "axiom_public_key" : axiom_public_key
            "human_frame_url" : human_frame_url
        },
        "private" : {
            "ccwid" : "aksbsdkufhsiufkesh",
            "ucwid" : ucwid,
            "private_key" : "soifw09ruwkrw9i",
            "biometric" : biometric_blob
        }

    }
*/


function make_normalizer() {
    let user_data_normalizer = {
        "version" : () => "1",
        "normalize" : (user_data_str_json) => {
            let normed_data = user_data_str_json
            return normed_data    
        }
    }

    return user_data_normalizer
}

export async function create_ID(user_data,wrapper_key) {

    let ucwid_service = new UCWID({ "normalizer" : make_normalizer, "_wrapper_key" : wrapper_key })
 
    if ( await ucwid_service.wait_for_key() ) {
        let data_as_str = JSON.stringify(user_data)
        let encoder = new TextEncoder()
        let data_as_buffer = encoder.encode(data_as_str)
        let ucwid = await ucwid_service.ucwid(data_as_buffer)
        return [ucwid.ucwid,ucwid]
    }

    return []

}

function store_igid_info(info,privates) {
    let p_info = Object.assign({},info)
    let bio = p_info.biometric
    delete p_info.biometric
    info.public_component = p_info
    info.private = Object.assign({},privates)
    info.private.biometric = bio
}


export async function user_keys(user_data) {
    await crypto_wraps.gen_public_key(user_data,store_igid_info)
    let wrapper_key = user_data.public_component.public_key
    let [crypto_cwid,ucwid_obj] = await create_ID(user_data,wrapper_key)
    user_data.ccwid = crypto_cwid
    user_data.public_component = crypto_cwid
    user_data.private.ccwid = crypto_cwid
    user_data.private.ucwid = ucwid_obj
    return user_data
}

