// MODULE: CRYPTO HASH (modularized)

// >> import
import * as base64 from "../modules/base64.js";

//<<
//windowize>>let base64 = window
//$>>	do_hash_buffer
async function do_hash_buffer(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await g_crypto.digest('SHA-256', data);
    return hash
}

//$>>	do_hash
export async function do_hash(text) {
    let buffer = await do_hash_buffer(text)
    const hashArray = Array.from(new Uint8Array(buffer));
    return base64.bytesToBase64(hashArray)
}

//$>>	from_hash
export function from_hash(base64text) {
    let bytes = base64.base64ToBytes(base64text)
    return bytes
}

//$>>	to_base64
export function to_base64(text) {
    return base64.base64encode(text)
}

//$>>	from_base64
export function from_base64(base64text) {
    let bytesAsText = base64.base64decode(base64text)
    return bytesAsText
}

//$>>	from_base64_to_uint8array
export function from_base64_to_uint8array(base64text) {
    while ( base64text.length %4 ) base64text += '='
    return base64.base64ToBytes(base64text)
}

//$>>	to_base64_from_uint8array
export function to_base64_from_uint8array(a_uint8Array) {
    let b = base64.bytesToBase64(a_uint8Array)
    b = b.replace(/\=/g,'')
    return b
}

//$$EXPORTABLE::
/*
do_hash_buffer
do_hash
from_hash
to_base64
from_base64
from_base64_to_uint8array
to_base64_from_uint8array
*/
