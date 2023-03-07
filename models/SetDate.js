const mongoose = require("mongoose");

// Start: Define our set date schema
const setDateSchema = new mongoose.Schema({
  setDate_ID: Number,
  startDate: Date,
  endDate: Date
});

const SetDate = mongoose.model('SetDate', setDateSchema);

/**
 *  Function: Thêm 1 Set Date
 */
function insertSetDate(data) {
  SetDate.findOneAndUpdate(
    { setDate_ID: 1 },
    { startDate: data.startDate, endDate: data.endDate },
    { new: true, upsert: true }
  ).then(updated => {
    console.log(updated);
  }).catch(err => {
    console.error(err);
  });
}

async function checkSetDateExists() {
  const myRecord = await SetDate.findOne({ setDate_ID: 1 });
  if (myRecord) {
    return myRecord;
  } else {
    return myRecord;
  }
}



// Export the Mongoose model
module.exports = {
  SetDate,
  insertSetDate, checkSetDateExists
};
