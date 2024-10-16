
const express = require('express');
const app = express();

const profileRoutes = require('./routes/Profile');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/Payments');
const courseRoutes = require('./routes/Course');
const contactRoutes = require('./routes/Contact');


const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
require("dotenv").config();

const cloudinaryConnect = require('./config/cloudinary');
const connectDatabase = require('./config/database');

cloudinaryConnect();
connectDatabase();

app.use(express.json());
app.use(cookieParser());

const corsOption = {
    origin:"http://localhost:3000",
    credentials:true
}

app.use(cors(corsOption));

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)

app.use('/api/v1/auth' , userRoutes);
app.use("/api/v1/profile" , profileRoutes);
app.use("/api/v1/course" , courseRoutes);
app.use("/api/v1/payment" , paymentRoutes);
app.use("/api/v1/contact" , contactRoutes);

// Now making default route
app.get("/"  ,  (req,res) =>{
    return res.json({
        success:true,
        message:'App running . This is default route'
    })
})

const PORT = 4000 || process.env.PORT;
app.listen(PORT , ()=>{
    console.log(`App is successfullt runnig at Port = ${PORT}`);
})

