let express = require('express');
let {userModel} = require('./database/db');
const { z } = require('zod');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { auth, JWT_SECRET } = require('./database/auth');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config()

let DB_URL = process.env.DB_String

mongoose.connect(DB_URL);
if (!DB_URL) {
     throw new Error("Database URL not set in environment variables")
}
let app = express();

app.use(cors())
app.use(express.json());


app.post('/api/user/signup', async function (req, res) {
     try {
          let userData = z.object({
               firstName: z.string(),
               lastName: z.string(),
               email: z.string().email(),
               password: z.string()
          });
     
          let validatedData = userData.safeParse(req.body);
          if (!validatedData.success) {
               return res.status(400).send({
                    message: `Validation error`,
                    errors: validatedData.error.errors
               });
               
          };
          

          let { firstName, lastName, email, password } = req.body;

          const hashedPassword = await bcrypt.hash(password, 10);

          await userModel.create({
               firstName: firstName,
               lastName: lastName,
               email: email,
               password: hashedPassword,
          })

          res.json({
               message : `Account Created Successfully`
          })

          // end of try 
     } catch (error) {
          res.status(400).send({
               message: `Something Went wrong, ${error}`
          })
     }
})

app.post('/api/user/login', async function (req, res) {
     let { email, password } = req.body;

     const user = await userModel.findOne({
          email: email,
     });

     if (!user) {
          return res.status(403).send({
               message:`Invalid Credentials`
          })
     }

     const isPasswordCorrect = await bcrypt.compare(password, user.password);

     if (!isPasswordCorrect) {
          return res.status(401).send({ message: 'Invalid Credentials' });
     }

     const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
     

     res.json({ token });

})

app.get('/me',auth, async function (req, res){
     try {
          const user = await userModel.findById(req.user.id).select('-password');

          if (!user) {
               return res.status(403).send({
                    message: `${user} not found, Please Create Account`
               });
          };

          res.status(200).send({ user });
          
     } catch (error) {
          res.status(500).send({ message: `Error retrieving user: ${error.message}` })
     }
})


let port = 3000
app.listen(port, () => {
     console.log(`Application Started http://localhost:${port}`);
})