import mongoose from "mongoose";
const Schema = mongoose.Schema;

const companySchema = new Schema({
    code: {
        type: String,
        required: true
    },
    cap: {
        type: String,
        required: true
    }
},{timestamps: true});

const Company = mongoose.model('Company', companySchema);

export default Company;