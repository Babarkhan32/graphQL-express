const mongoose = require("mongoose");

const User = {
    id: {
    type:'ObjectId'
    },
    name: {
        type:'string'
    },
    email: {
        type:'string'
    }
};

module.exports = mongoose.model("user", User, "user");
