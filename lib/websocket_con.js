
const WSS_PING_INTERVAL = 10000


const {gen_id} = require('../lib/utils')


class WebSocketActions {

    constructor() {
        this.going_sessions = {}
        //
        this.checking_pings = false
        this.supects = {}  // suspect that the connection might not be alive, so we ping it
        //
        this.app_wss = false
        this.message_handler = false
        this.trans_processor = false
        this.user_processor = false
        this.ws_client_attempt_timeout = null
    }


    // ------------------------------------------------------------

    set_socket_server(app_wss,handler) {
        //
        this.app_wss = app_wss
        this.message_handler = handler

        console.log("setting applicaiton server web sockets")

        this.app_wss.on("connection", (ws,req) => {
console.log("connections ws...")
            this.setup_app_ws(ws)
        });
        //
    }
    

    // ------------------------------------------------------------
    // APPLICATION WS (COM EXCHAGE)
    // ------------------------------------------------------------


    //   send_to_ws   -- websocket wrapper
    send_to_ws(ws,data) {
        if ( ws ) {
            try {
                let message = JSON.stringify(data)
                ws.send(message);
            } catch (e) {}
        }
    }

    // setup_app_ws
    setup_app_ws(ws) {  // ws is the new connection, app_wss is the server 

        if ( !this.app_wss ) return
        //
        this.add_ws_session(ws)

        ws.on("message", async (data) => {
            try {
                let body = JSON.parse(data.toString());
                //
                let server_id = body.message ? body.message.server_id : false
                if ( server_id  && this.message_handler ) {      // transitional
                    this.message_handler(body.message)
                } else {
                    let ping_id = body.ping_id
                    if ( ping_id ) {
                        this.ponged(ws)
                        this.send_to_ws(ws,body.message)
                    }
                }
            } catch (e) {}
        });

        ws.on("close", () => {
            this.close_wss_session(ws)
        });

    }

    // add_ws_session
    //
    add_ws_session(ws) {
        ws._app_x_isAlive = true;
        let ws_id = gen_id()          // make up an id...
        this.going_sessions[ws_id] = ws
        ws._app_x_ws_id = ws_id
        this.send_ws(ws_id,{ "status" : "connected", "type" : "ws_id" })
        //
        if ( !(this.checking_pings) ) {
            this.start_checking_pings()
        }
    }

    // ping
    //
    ping(ws) {      // send a message to a client to see if it is up
        ws._app_x_isAlive = false;
        let data = {
            "data" : { "type" : "ping", "ping_id" : ws._app_x_ws_id },
            "time" : Date.now(),
        }
        ws.send(JSON.stringify(data));    
    }

    // ponged
    //
    ponged(ws) {
        ws._app_x_isAlive = true;
        if ( this.supects[ws._app_x_ws_id] ) {
            delete this.supects[ws._app_x_ws_id]
        }
    }

    // close_wss_session
    //
    close_wss_session(ws) {
        let result = false
        if ( ws ) {
            let ws_id =  ws._app_x_ws_id
            try {
                result = ws.close()
            } catch (e) {
            }
            if ( ws_id && this.going_sessions[ws_id]) delete this.going_sessions[ws_id]
        }
        return result
    }

    // send_ws
    //
    send_ws(ws_id,data) {
        let ws = this.going_sessions[ws_id]
        if ( ws ) {
            let message = {
                "ws_id" : ws_id,
                "data" : data
            }
            this.send_to_ws(ws,message)
        }
    }

    send_to_going_sessions(data) {
        for ( let ws_id in this.going_sessions ) {
            this.send_ws(ws_id,data)
        }
    }

    // do_pings
    //
    do_pings(caller) {
        for ( let key in this.going_sessions ) {
            let ws = this.going_sessions[key]
            if ( !(ws._app_x_isAlive) ) {
                this.supects[ws._app_x_ws_id] = ws
            } else {
                this.ping(ws)
            }
        }
        setTimeout(() => { caller.do_pings(caller) },WSS_PING_INTERVAL)
    }

    // close_suspects
    //
    close_suspects() {
        for ( let wsid in this.supects ) {
            let ws = this.supects[wsid]
            delete this.supects[wsid]
            this.close_wss_session(ws) 
        }
    }

    // start_checking_pings
    //
    start_checking_pings() {
        this.checking_pings = true
        let self = this
        setTimeout(() => { self.do_pings(self) },WSS_PING_INTERVAL)
        setTimeout(() => { self.close_suspects() },WSS_PING_INTERVAL*2)
    }

}



class TokenBoundWebSocketActions extends WebSocketActions {

    constructor() {
        super()
        this.going_ws_sessions = {} // map token to web socket
    }

    // 
    send_ws_outofband(token_key,data) {
        if ( token_key ) {
            let ws_list = this.going_ws_sessions[token_key]
            if ( ws_list ) {
                for ( let ws of ws_list ) {
                    if ( ws ) {
                        this.send_to_ws(ws,data)
                    }
                }
            }
        }
    }


    // 
    ws_shutdown(ws) {
        let token = null
        for ( let tk in going_ws_sessions ) {
            let ws_dex = going_ws_sessions[tk].indexOf(ws)
            if ( ws_dex >= 0 ) {
                token = tk
                going_ws_sessions[token].splice(ws_dex,1)
                break
            }
        }
        if ( token && (going_ws_sessions[token].length == 0) ) {
            delete going_ws_sessions[token]
        }
    }


}

module.exports = WebSocketActions
module.exports.TokenBoundWebSocketActions = TokenBoundWebSocketActions
