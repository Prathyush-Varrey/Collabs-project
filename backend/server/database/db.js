let mongoose = require('mongoose');



let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;



let userSchema = new Schema({
     firstName: String,
     lastName: String,
     email: {type : String, unique : true}, 
     password: String
})


let userModel = new mongoose.model('user', userSchema);

module.exports = { userModel };