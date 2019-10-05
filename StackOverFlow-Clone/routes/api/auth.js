const express=require('express')
const router=express.Router()
const bcrypt=require('bcryptjs')
const jsonwt=require('jsonwebtoken')
const passport=require('passport')
const key=require('../../setup/myurl')

router.get('/',(req,res)=>res.json({test:'Auth is being tested'}))

//import schema for person to register
const Person=require("../../models/Person")

 
//@type     POST
//@route    /api/auth/register
//@desc     route for registraton
//@access   PUBLIC

router.post("/register",(req,res)=>{
    //Sending queries
    Person.findOne({email:req.body.email})  
    .then(person => {
        //if person is registered then we have to show the  error message
        if(person){
            return res.status(400)
                .json({emailerror:"Email is already registered in our system"})
        }//else we have to create an object then store the information and push it to mongoDB.
        else{
            const newPerson=new Person({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password
            });
            
            //Encrypting our password using bcrypt
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(newPerson.password,salt,(err,hash) => {
                    if(err){throw err;}
                    newPerson.password=hash;
                    newPerson
                    .save()
                    .then(person => res.json(person))
                    .catch(err=>console.log(err))
                })
            })

        }
    })
    .catch(err =>console.log(err))

})
//@type     POST
//@route    /api/auth/login
//@desc     route for login
//@access   PUBLIC
router.post('/login',(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    Person.findOne({email})
        .then( person =>{
            //if user is not found then we show error
            if(!person){
                return res.status(404)
                .json({emailerror:"User not found with this email"})
            }//if person is founded
            bcrypt.compare(password,person.password)
                .then(isCorrect => {
                    if(isCorrect){
                        //res.json({success:'User is able to login successfully'})
                        //use payload and create token for user
                        const payload={
                            id:person.id,
                            name:person.name,
                            email:person.email
                        }
                        jsonwt.sign(
                            payload, 
                            key.secret,
                            {expiresIn:3600},
                            (err,token)=>{
                                if(err){
                                    res.json({
                                        success:false,
                                    })
                                }else{
                                    res.json({
                                        success:true,
                                        token:"Bearer "+ token
                                    })
                                }
                            }
                        )
                    }else{
                        res.status(400).json({passworderror:"Password incorrect"})
                    }
                })
                .catch(err=>console.log(err))
        })
        .catch(err => console.log(err))
})
//@type     GET
//@route    /api/auth/profile
//@desc     route for user profile
//@access   PIRVATE

router.get('/profile',passport.authenticate('jwt',{session:false}),
(req,res)=>{
     //console.log(req)
    res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email,
        profilepic:req.user.profilepic
    })
})

module.exports=router