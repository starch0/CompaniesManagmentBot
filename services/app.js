const express = require('express'),
    mangoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = 
        require("passport-local-mongoose")

const User = require('./model/User.js')
const app = express()

mangoose.connect('mongodb://localhost/27017',)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}))
app.use(require("express-session")({
    secret: "miau",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/secret', isLoggedIn, (req,res)=>{
    res.render('register')
})

app.get('/register', (req,res)=>{
    res.render('register')
})

app.get('/login', (req,res) =>{
    res.render('login')
  })

app.post('/register', async (req,res)=>{
    const userExist = await User.findOne({username: req.body.username})
    if (userExist){
        return res.status(400).json({message: 'user exist'})
    }
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
    })
    return res.status(200).json(user)
})

app.post('/login', passport.authenticate('local', {
  sucessRedirect: '/secret',
  failureRedirect: 'login',
  //failureFlash: true,
}))

app.get("/logout", (req, res)=> {
    req.logout((err)=> {
        if (err){return next(err) }
        res.redirect('/')
      })
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()) return next()
    res.redirect('/login')
}

const port = 3000 
app.listen(port, ()=>{
    console.log('🔥')
})
