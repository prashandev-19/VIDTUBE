/* 
    id string pk
    username string
    email string
    fullName string
    avatar string
    coverImage string
    watchHistory ObjectId[] videos
    password string
    refreshToken string
    createdAt Date
    updatedAt Date
*/

import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(  
    {
      username : {
        type : String,
        required : true,
        unique : true, //create a unique index for this field
        lowercase : true,
        trim : true,
        index : true //create an index for this field
      },

      email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true
      },
      fullname: {
        type : String,
        required : true,
        trim : true,
        index : true
      },
      avatar : {
        type : String , //cloudinary URL
        required : true
      },
      coverImage : {
        type : String , //cloudinary URL
      },
      watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
      ],
      password : {
        type : String,
        required : [true , "password is required"] , //with [] we can also control the message displayed in the 
                                                  // frontend if the user doesn't fill the password.
      },
      refreshToken : {
        type : String
      }
    } , 
    { timestamps : true}
)

userSchema.pre("save" , async function(next){
  
  if(!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password , 10)

  next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function(){
  // short lived access token

  //jwt.sign(payload, secret, options)
  return jwt.sign({ // payload - the data we want to send to the client
    _id: this._id,
    email : this.email,
    username : this.username,
    fullname : this.fullname
  }, 
  // secret - the secret key to sign the token
  // we can use the same secret key for both access and refresh tokens
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn : process.env.ACCESS_TOKEN_EXPIRY} 
  // options - the options for the token
  )
}


userSchema.methods.generateRefreshToken = function(){
  // short lived access token

  return jwt.sign({
    _id: this._id, //only the id is enough for the refresh token
  },
  process.env.REFRESH_TOKEN_SECRET,
  { expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
)
}

export const User = mongoose.model("User" , userSchema);