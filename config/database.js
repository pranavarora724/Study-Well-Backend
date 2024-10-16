
const mongoose = require('mongoose');
require("dotenv").config();

function connectDatabase(){

    mongoose.connect( process.env.MONGO_URL , {
        useNewUrlParser:true,
        useUnifiedTopology:true,
        strictQuery: true
    }
    ).then(console.log("Database connection successfull"))
    .catch((err)=>{
        console.log("Error in database connection");
        console.log(err.message);
                process.exit(1);
    }
)
}

module.exports = connectDatabase;
