const mongoose = require("mongoose");

const assistanceProgramSchema = new mongoose.Schema({
  programName: {
    type: String,
    required: true,
    unique: true,
  },
  treatmentList: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  grantAmount: {
    type: String,
    required: true,
  },
});

module.exports = AssistanceProgram = mongoose.model(
  "AssistanceProgram",
  assistanceProgramSchema
);
