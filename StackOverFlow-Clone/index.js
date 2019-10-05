const express=require('express')
const mongoose=require('mongoose')
const bodyparser=require('body-parser')
const passport=require('passport')


//bring all routes
const auth=require('./routes/api/auth')
const questions=require('./routes/api/questions')
const profile=require('./routes/api/profile')

const app=express()

//middleware for bodyparser
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json()); // talk with json data

//mongo db configuration
const db=require('./setup/myurl').mongoURL

//attempt to connect to database

mongoose
    .connect(db)
    .then(()=>console.log('MongoDB connected successfully'))
    .catch(err=>console.log(err))

//passport middleware
app.use(passport.initialize())

//config for JWT strategy
require("./strategies/jsonjwtstrategy")(passport)

//route for testing 
app.get('/',(req,res)=>{
    res.send('Hey there bigstack')
})

//actual routes
app.use('/api/auth',auth)
app.use('/api/questions',questions)
app.use('/api/profile',profile)

const port=process.env.PORT||3000

app.listen(port,()=> console.log(`App is running at port ${port}`))