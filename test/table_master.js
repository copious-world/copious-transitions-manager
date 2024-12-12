//
const ChildProcCom = require('../lib/client_com')
const {ProcJSTableManager} = requie('shared-table-types')
const {load_json_file} = require('../lib/utils')

let conf = load_json_file(process.argv[2])

if ( conf === undefined ) process.exit(0)

let controlled_node = new ChildProcCom(conf)
let table_service = new ProcJSTableManager(conf.shared_table)

controlled_node.acts_on(table_service)
controlled_node.requests_from(table_service)
