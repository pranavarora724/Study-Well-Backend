
const mongoose = require('mongoose');

// One category van have any categories 
// But a course can have ony one category  

const categorySchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },

        description:{
            type:String
        },

        courses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course"
            }
        ]
    }
)

const Category = mongoose.model('Category' , categorySchema);
module.exports = Category;
