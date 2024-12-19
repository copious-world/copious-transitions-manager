# copious-hosts-manager


**NOTE: This version is temporarily downgraded and published only for convenience in testing.**

 ***A simple web app for managing processes on configured machines***.

 The runtime provides those two functions:
 
 1. A web page server with a web page for starting, stopping, updating, etc. processes on clusters accessed by preconigured machines.
 2. A means of communicating with remote process administration via ssh tunnels.

This manager tool treats processes as child processes of the copious-hosts-manager process. A node in a cluster will not be web enabled, but will provide a TLS port for communicating data and streaming any console information to a workstation web server. The `copious-hm` command will start the web server on a user's machine. It will be a web server that serves static content from its own local directory. 

> **note:** previously this application was just used to tests processes and so it doubled as a storage table. The new version spawns processes that serve tables and attempts to provide some managent of clients within the clusters.

So far, this tool is good for managing a basic configuration for those trying out processes which may also communicate with each other. The runtime is compatible with processes that use communication interfaces provided by [message-relay-services](https://www.npmjs.com/package/message-relay-services).
 
 
## Install

```
npm install -g copious-hosts-manager
```


In preparation for running, there is a need for configuration files.

We prepare configuration files with comments and then run them through a comment stripping tool. We are using [strip-json-comments-cli](https://github.com/sindresorhus/strip-json-comments-cli). 


## Basic Ops
 
 * List a set of host IP's and domains running the headless version
 * Install a process from npm
 * Remove a process
 * Start a process
 * Stop a process
 * List processes
 * Set top level config parameters....

>**note:** ssh services have to be set up on the remote machines and on their cluster members. The copious-hm command will use special keys other than ssh login keys.

## Run 

For running on the user's workstation:

```
copious-hm manager.conf
```

Here, the user might be called the ***admin***.

On the remote providing external access to the cluster:

```
copious-hm --headless manager.conf
```

The configuration file is a JSON object that describes how to call programs from the command line.

As it might be best to start the program with data from a USB stick or other device, the following is another way to call up the program:


```
copious-hm manager.conf --drive="path to USB"
```

Once the `copious-hm` process is running, the admin user should surf the configured port on the local host. So, in the navbar of your browser, enter the following:

```
https://localhost:<configed port>/
```


**example:**

In the following, configuration file description, a port has been selected for the copious-hm instance:

```
"web_page_port" : 8989,
```

In this case, the navbar url would be the following:


```
https://localhost: 8989/
```

The api url's are relative to the port.



## Configuration File

You can get an example manager.conf file into you working directory by using [get-npm-assets](https://www.npmjs.com/package/get-npm-assets)

```
get-npm-assets copious-hm
```

Here is what it looks like:

```
{
    "password" : "your password",
    "web_page_port" : 8989,
    "wss_app_port" : 8990,
    "host_list" : "host-file.json",
    "pem_file" : "custom-pub-key.pem",
    "all_procs" : {

        "test1.sh" : {
            "name" : "test1.sh",
            "run_on_start" : false,
            "attempt_reconnect" : false,
            "runner" : "bash",
            "args" : ["test/test1.sh","Print this message"]
        },
        "test2.js" : {
            "name" : "test2.js",
            "run_on_start" : false,
            "attempt_reconnect" : true,  
            "runner" : "node",
            "args": [
                "test/test2.js",
                "test/test2.conf"
            ]
        },
        "test3.js" : {
            "name" : "test3.js",
            "run_on_start" : false,
            "attempt_reconnect" : false,  
            "runner" : "node",
            "args": [
                "test/test3.js",
                "test/test3.conf"
            ]
        }

    }
}

```

**The top level fields are as follows**:

* **password** :: you have to type this in on the web page to make anything work
* **web\_page\_port** :: this is the html server port. Surf to your computer's IP and specifiy this port, e.g.: `http://<my machine's ip>:8989`
* **wss\_app\_port** :: this is for websockets. 
* **all\_procs** :: this is a map of process names to process descriptions. The web page will know about these at startup.

Have a look at the different process descriptions. You will see that they refer to programs and their descriptions.

Let's have a closer look at the fields for describing the processes. 

* **name**  :: a name that identifies the process
* **run\_on\_start** :: whether or not to start a process as soon as the manager comes up or wait for the admin to start it from the web page
* **attempt\_reconnect** :: if the process fails, should the manager try to restart it?
* **runner** :: a program name that uses the parameters. This will be what runs at the outermost part of the process. It may run a script mentioned in the arguments, or it may be the name of a binary executable.
* **args** parameters that are fed to the runner

For example, "test3.js" has a "node" runner **node.js**. The first parameter of the argments list is a javascript file in the test directory. So, "test3.js" will be available to run from the test page.

Once the manager is running, you can surf to the web page:

```
 http://<my machine's ip>:8989
```

On the web page you can select the process, find the "op" section and click on the "run" button.

## The Web Page

You can see what the web page looks like here: [web page](http://www.copious.world/transition-manager/)

>**Note**: nothing works on this page. The computer is not available for public operation. *For viewing purposes only*...

On the front page you can see buttons:

* **overview**
* **stdout**
* **ops**

Clicking on these shows different panels.

The first panel, **overview**, shows a list box (processes will be seen there if you try it). Selecting a process makes it available for use in the **ops** panel. It can be removed as well using "remove" on the front panel.

On the **overview**, you can **add** a processes to the configuration file. You can run a command line using he **exec** button. You can install npm modules or uninstall them. The buttons lead to dialogs to help you enter field values.

On the **stdout** panel, you can view the terminal output of a process.

On the **ops** panel, you can **run**, **stop**, **restart**, **update** or **remove** a process (remove is the same as the front panel). Or, you can get access to the configuration file, **config**. 

The **confg** button will look at the arguments array and ask if that is the config file you want to edit. A rudimentary editor will be opened in a panel with the config file contents. The editor expects that you will specify the configuration in JSON. The configuration will only update with parseable JSON. The JSON will be seen on a box on the left.

**TO SEE THE WHOLE PAGE**, you need to try out examples.


## A Look at Example Apps

Here are two test program that can be managed by the **copious-transitions-manager**. 

In the following, test2.js is the process that gets values from the communication channel, while test3.js writes values to the communication channel. You can see that test2.js calls **messenger.get\_on\_path**, while test3.js calls **messenger.set\_on\_path**.

**test2.js**

```
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

```


**test3.js**

```

//
const {IPCChildClient} = require('message-relay-services')
const {load_json_file} = require('../lib/utils')
const {XXHash32} = require('xxhash32-node-cmake')


console.log("TEST 3 STARTS")


let hasher = new XXHash32(9347597)

let conf = load_json_file(process.argv[2])

if ( conf === undefined ) process.exit(0)

let messenger = new IPCChildClient(conf)

let any_old_key = [
    "this is a key for this is a test",
    "another key 94r9w487r you should know tests when you see them",
    "more keys are as much fun as testing lots of junk"
]

let things_to_send = [
    "this is a test",
    "you should know tests when you see them",
    "have fun testing lots of junk"
]

setInterval(async () => {
    //
    let the_time =  new Date()
    let time_report = the_time.toLocaleString()
    //
    let rand_pick = Math.trunc(Math.random()*(any_old_key.length - 1))
    let txt = any_old_key[rand_pick]
    let hash = hasher.hash(txt)
    //
    let status = await messenger.set_on_path({
        "table" : "key_value",
        "hash" : hash,
        "v" : things_to_send[rand_pick]
    },"test2")
    //
    console.log(status)
    //
    console.log("test3: One more tick: "  + time_report)
},2000)

```

### check it out

You can run these from the web page and see the messages they print in the **stdout** panel.

Later, hypothetically, you could use a different class from [message-relay-services](https://www.npmjs.com/package/message-relay-services) and a more sophisticated server to run the same programs. All you have to do is change the class in the require line:

```
const {IPCChildClient} = require('message-relay-services')
```

For example:

```
const {MessageRelayer} = require('message-relay-services')
```

Givent the endpoint server the programs attach to provides an appropiate hash table functionality, the programs would not have to change more.

## Debug an App

Here is an example for debugging an app that might otherwise be called directly as a runner. 

```
    "igid-auth-debug": {
      "name": "igid-auth-debug",
      "runner": "node",
      "args": [
        "--inspect-brk",
        "/home/a-user/.npm-global/lib/node_modules/captcha-igid/index.js",
        "assets/basic-user-service-igid.conf "
      ]
    }

```

## Issues?

[issues on github](https://github.com/copious-world/copious-transitions-manager/issues)

## dependencies

The web page have been developed in Svelte. Find the project in the **manager-app** diretory.

## Thanks from [copious.world](http://www.copious.world)