const mongoose = require("mongoose");
const AssistanceProgram = require("../models/assistanceProgram.schema");

mongoose.connect(
  "mongodb+srv://avi_edgar:avi_edgar2020@node-rest-assistance-pr.tfwzd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

async function InsertManyAsync(programs) {
  console.log(`InsertManyAsync Started, programs: ${programs}`);
  for (let program of programs) {
    await AssistanceProgram.bulkWrite([
      {
        updateMany: {
          filter: { programName: program.programName },
          update: program,
          upsert: true,
        },
      },
    ])
      .then((result) => {
        console.log(`InsertManyAsync - result: ${result}`);
        return result;
      })
      .catch((error) => {
        console.log(`InsertManyAsync - ERROR: ${error}`);
      });
  }
}

async function UpdateManyAsync(programs) {
  console.log(`UpdateManyAsync Started, programs: ${programs}`);
  for (let program of programs) {
    await AssistanceProgram.updateOne(
      { programName: program.programName },
      { ...program }
    )
      .exec()
      .then((result) => {
        console.log(`UpdateManyAsync - result: ${result}`);
        return result;
      })
      .catch((error) => {
        console.log(`UpdateManyAsync - ERROR: ${error}`);
      });
  }
}

async function GetManyAsync(filter, projection, callback) {
  console.log(
    `GetManyAsync Started, filter: ${filter}, projection: ${projection}`
  );

  await AssistanceProgram.find(filter, projection)
    .exec()
    .then((result) => {
      console.log(`GetManyAsync - result: ${result}`);
      callback(result);
    })
    .catch((error) => {
      console.log(`GetManyAsync - ERROR: ${error}`);
    });
}

module.exports.UpdateManyAsync = UpdateManyAsync;
module.exports.GetManyAsync = GetManyAsync;
module.exports.InsertManyAsync = InsertManyAsync;
