const validator = require("validator");

const validate = async (data) =>{
    const manditoryField = ["firstName" , "emailId" , "password"];
    
    const isAllowed = manditoryField.every((k) => Object.keys(data).includes(k));

    if(!isAllowed)
        throw new Error("Fields Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error ("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
}

module.exports = validate;