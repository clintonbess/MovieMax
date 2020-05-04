const db = require('../model/user');
const salt = 10;
const bcrypt = require('bcrypt');


const create = async (req,res)=>{
    try{
        const {firstName, lastName, email, password} = req.body;
        const existingUser = await db.User.findOne({email : email});
         // Find the existing user;
        if(existingUser){
            res.status(400).json({
                error : "User with this email already exists"
            })
        }
        // Hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = {
            firstName,
            lastName,
            email,
            password : hashedPassword
        }
        // Creating New User
        db.User.create(user,(err,userData)=>{
            if(err) console.log(err);
            res.status(200).json({
                data : userData
            })
        })
    } catch(err){
        console.log(err)
    }
};

const destroy = (req,res)=>{
    db.User.findByIdAndDelete(req.params.userId,(error,deletedUser)=>{
        if(error)return console.log(error);
        res.json({
            status: 200,
            count: 1,
            data : deletedUser,
            requestedAt: new Date().toLocaleString()
        });
    });
}

const index = (req,res)=>{
    db.User.find({},(error,allUsers)=>{
        if(error) return console.log(error);
        res.json({
            status: 200,
            count: allUsers.length,
            data: allUsers,
            requestedAt: new Date().toLocaleString()
        });
    });
}

const update =(req,res)=>{
    db.User.findByIdAndUpdate(req.params.userId,req.body,{new:true},(error,updatedUser)=>{
        if(error)return console.log(error);
        res.json({
            status: 200,
            data: updatedUser,
            requestedAt: new Date().toLocaleString(),
        });
    });
}

const show = (req,res)=>{
    db.User.findOne(req.params.id, (error,foundUser)=>{
        if(error) console.log(error);
        res.json({
            status: 201,
            data: foundUser,
            requestedAt: new Date().toLocaleString(),
        })
    })
}; 

const createSession = (req,res)=>{
    console.log('req sessssion---->Creating session');
    db.User.findOne({email: req.body.email},(err,foundUser)=>{
        if(err) return res.status(500).json({
            status: 500,
            Message: "something went wrong"
        })
        if(!foundUser) return res.status(200).json({
            status: 201,
            message: "incorrect password or email"
        })
        if(req.body.password === foundUser.password){
            req.session.currentUser = foundUser._id;
            res.status(201).json({
                status: 201,
                data: {
                    id: foundUser._id,
                    name: foundUser.name,
                    email: foundUser.email,
                    cardNumber: foundUser.cardNumber,
                    cvc: foundUser.cvc
                }
            })
        }
    })

}

const addMovie = (req,res) => {
    const movie = req.body
    console.log(movie)
    db.User.findById(req.params.userId, (error, foundUser)=>{
        if(error)return console.log(error);
        db.Movies.findOne({tmdbID: movie}, (error, foundMovie)=>{
            if(error)return console.log(error);
            if(foundMovie){
                foundUser.favoriteMovies.push(foundMovie._id);
            } else {
                db.Movies.create({tmdbID:movie}, (error, createdMovie)=>{
                    if(error)return console.log(error);
                    foundUser.favoriteMovies.push(createdMovie._id);
                })
            }
            foundUser.save((error, savedUser)=>{
                if(error)return console.log(error);
                res.json({
                    status: 200,
                    data: savedUser,
                    requestedAt: new Date().toLocaleString(),
                });
            });
        })
    });
}

const addToFavorites = (req,res)=>{
    db.User.findById(req.params.userId, (error, foundUser)=>{
        if(error) console.log("error", error)
        if(foundUser){
            console.log("Adding Movies")
            console.log(req.body.movie)
            console.log(foundUser.favoriteMovies)
            foundUser.favoriteMovies.push(req.body.movie)
        }
        foundUser.save((error,savedUser)=>{
            if(error) console.log(error)
            else{
                res.json({
                    status: 200,
                    data : savedUser.favoriteMovies
                })
            }
        })
    })

}

const getFavorites=(req,res)=>{
    console.log('Req Came thru')
    db.User.findById(req.params.id,(error,foundUser)=>{
        if(error) console.log(error);
        if(foundUser){
            const data = foundUser.favoriteMovies
            console.log(data)
            res.json({
                status : 200,
                data : data
            })
            console.log(res.json)
        }
    })
}


module.exports ={
    show,
    update,
    create,
    destroy,
    index,
    createSession,
    addMovie,
    getFavorites,
    addToFavorites
}