

console.log("THIS IS TEST 2")

setInterval(() => {
    let the_time =  new Date()
    let time_report = the_time.toLocaleString()
    
    console.log("test2: One more tick: "  + time_report)
},2000)
