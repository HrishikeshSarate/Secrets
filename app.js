//jshint esversion:6
require('dotenv').config();                        //level 2
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");                                     //level 5
const passportLocalMongoose = require("passport-local-mongoose");          //level 5
// const bcrypt = require("bcrypt");
// const saltRounds = 10;                      //level 4 (salting and hashing)

//const md5 = require("md5");                        //level 3
//const encrypt = require("mongoose-encryption");  //level 2


const app = express();

//console.log(md5("123456"));                            //level 3


//console.log(process.env.API_KEY);                       //level 2

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "our secret.",
    resave: false,                                      //level 5
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);


//userSchema.plugin(encrypt,{ secret: process.env.SECRET, encryptedFields: ["password"] });  //Level 2

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets",function(req, res){
    User.find({"secret": {$ne: null}}, function(err, foundUsers){               //$ne(not equal)     
        if(err){
            console.log(err);      
          }else{
              if(foundUsers){
                  res.render("secrets", {userswithSecrets: foundUsers});
              }
          }
    });                                                                         //  if(req.isAuthenticated()){
                                                                               //      res.render("secrets");
                                                                                //  }else{
                                                                                //      res.redirect("/login");
                                                                               //  }
});

app.get("/submit", function(req, res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});

app.post("/submit", function(req, res){
    const submittedSecret = req.body.secret;

    console.log(req.user.id);

    User.findById(req.user.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save(function(){
                    res.redirect("secrets");
                });
            }
        }
    });
});





app.get("/logout",function(req, res){
    req.logout();
    res.redirect("/");
});

app.post("/register", function (req, res) {

        User.register({username: req.body.username}, req.body.password,function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        });                                                     //passsport-local-mongoose

                                                            // bcrypt.hash(req.body.password, saltRounds, function(err, hash){

                                                            //     const newUser = new user({
                                                            //         email: req.body.username,
                                                            //         password: hash
                                                            //     });
                                                            
                                                            //     newUser.save(function (err) {
                                                            //         if (err) {
                                                            //             console.log(err);
                                                            //         } else {
                                                            //             res.render("secrets");
                                                            //         }
                                                            //     });
                                                            // });
   
});

app.post("/login",function(req, res){
                                                            // const username = req.body.username;
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });                                                        // const password = req.body.password;

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
          
        }
    });                                                        // user.findOne({email: username}, function(err, foundUser){     //level 1
                                                            //     if(err){
                                                            //         console.log(err);
                                                            //     }else{
                                                            //         if(foundUser){
                                                            //             bcrypt.compare(password, foundUser.password, function(err, result){
                                                            //             if (result === true){
                                                            //               res.render("secrets");
                                                            //             }
                                                            //             });
                                                            //            // if(foundUser.password === password){                                       //level 2/3
                                                                        
                                                                        
                                                            //         }
                                                            //     }
                                                            // });
});





app.listen(3000, function () {
    console.log("server started at port 3000");
})