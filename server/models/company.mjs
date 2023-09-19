import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cap: {
        type: Number,
        required: true
    },
    cash: {
        type: Object,
        default: {}
    }
}, { timestamps: true });


let model;

// Check if the model is already initialized
if (mongoose.models.Company) {
    model = mongoose.model('Company');
} else {
    model = mongoose.model('Company', companySchema);
}

export default model;
