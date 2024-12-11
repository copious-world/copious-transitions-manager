const fs = require('fs')


function remove_punct(s) {
    let punctuationless = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    let finalString = punctuationless.replace(/\s{2,}/g," ");
    return finalString
}


let name_to_url = (human_name) => {
    human_name = human_name.toLowerCase()
    human_name = remove_punct(human_name)
    human_name = human_name.replace(/\s/g,'_')
    human_name = encodeURIComponent(human_name)
    return human_name
}

module.exports.to_url = name_to_url



module.exports.load_json_file = (src) => {
    try {
        let contents = JSON.parse(fs.readFileSync(src).toString())
        return contents
    } catch (e) {
        console.log(e)
    }
    return undefined
}


module.exports.unload_json_file = (dst,contents) => {
    let contents_as_str = JSON.stringify(contents,null,2)
    try {
        fs.writeFileSync(dst,contents_as_str)
    } catch (e) {
        console.log(e)
    }
    return undefined
}


module.exports.check_existence = async (human_name,config_otput) => {
    try {
        let namer = name_to_url(human_name)
        await fsPromise.access(`${config_output}/${namer}.html`,fsPromise.constants.R_OK)
        return false
    } catch (e) {
        return true
    }
}




module.exports.gen_id = () => {
    let rr = Math.random()
    rr = Math.trunc(rr*10000)
    rr = `${rr}`
    while ( rr.length < 4 ) {
        rr = '0' + rr
    }
    let tt = Date.now()
    let ss = `${tt}${rr}`

    return ss.substring(4)
}

