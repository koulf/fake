const express = require('express');
const app = express();
port = process.env.PORT || 3000;

console.log(port);

app.get('/',(req,res)=>{
    res.send({ok:"ok"})
})

app.listen(port, ()=>console.log("ejecutando servidor"))

