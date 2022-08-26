

console.log("ALL IS CLEAR")

setInterval(() => {
    let the_time =  new Date()
    let time_report = the_time.toLocaleString()
    
    console.log("test3: One more tick: "  + time_report)
},2000)
