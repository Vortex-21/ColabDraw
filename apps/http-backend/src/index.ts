import express from 'express'
const app = express(); 


app.get("/", (req,res) => {
    res.send("Welcome to Excalidraw"); 
})
app.listen(3002, () => {
    console.log('Listening at port 3000'); 
})