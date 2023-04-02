const mongoose = require("mongoose");
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const timezone = 'Asia/Ho_Chi_Minh';
const dateFormat = 'DD/MM/YYYY';
const dateTimeFormat = 'DD/MM/YYYY HH:mm';

// Start: Define our event schema
const eventSchema = new mongoose.Schema({
    name: String,
    startDate: Date,
    firstClosureDate: Date,
    finalClosureDate: Date,
    status: {
        type: Boolean,
        default: false
    }
});

const Event = mongoose.model('Event', eventSchema);

/**
 *  Function: Insert Event
 */
function insertEvent(data) {
    Event.create(data);
}

/**
 *  Function: Get all information about Events
 */
async function getAllEvents() {
    // Use find method to get all documents from "events" table
    const events = await Event.find();

    const formattedList = events.map(item => {
        return {
            ...item.toObject(),
            startDate: moment(item.startDate).tz(timezone).format(dateFormat),
            firstClosureDate: moment(item.firstClosureDate).tz(timezone).format(dateFormat),
            finalClosureDate: moment(item.finalClosureDate).tz(timezone).format(dateFormat)
        };
    });

    return formattedList;
}

/**
 * Function: Get the data of an event by id
 */
async function getEventByID(id) {
    const event = await Event.findOne({ _id: id });

    const convertedData = {
        ...event._doc,
        startDate: event.startDate.toISOString().slice(0, 10),
        firstClosureDate: event.firstClosureDate.toISOString().slice(0, 10),
        finalClosureDate: event.finalClosureDate.toISOString().slice(0, 10)
    };

    return convertedData;
}

/**
 * Function: Update Event
 */
async function updateEvent(id, data) {
    await Event.findByIdAndUpdate(id, data);
}

/**
 * Function: Delete event
 */
async function deleteEvent(id) {
    await Event.findByIdAndRemove(id);
}

/**
 * Function: Implement set Date Event, change status from false to true
 */
async function setDate(id) {
    await Event.updateMany({ status: true }, { $set: { status: false } }, { new: true });
    await Event.findByIdAndUpdate(id, { status: true }, { new: true });
}

/**
 * Function: Kiểm tra tất cả records trong event chỉ có 1 record có status = true, nếu thỏa mãn kiểm tra thời gian hiện tại trong khoảng thời gian từ start Date đến first Closure Date
 */
async function hasTrueStatusEvent() {
    try {
        const events = await Event.find({ status: true });

        if (events.length == 1) {
            const event = await Event.findOne({ status: true });

            const currentTime = moment.tz(timezone)
            const startDate = moment(event.startDate);
            const firstClosureDate = moment(event.firstClosureDate);

            if (currentTime.isAfter(startDate) && currentTime.isBefore(firstClosureDate)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 * Function: Kiểm tra tất cả records trong event chỉ có 1 record có status = true, nếu thỏa mãn kiểm tra thời gian hiện tại trong khoảng thời gian từ start Date đến first Closure Date
 */
async function hasTrueStatusComment() {
    try {
        const events = await Event.find({ status: true });

        if (events.length == 1) {
            const event = await Event.findOne({ status: true });

            const currentTime = moment.tz(timezone)
            const startDate = moment(event.startDate);
            const finalClosureDate = moment(event.finalClosureDate);

            if (currentTime.isAfter(startDate) && currentTime.isBefore(finalClosureDate)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Every 10s will check the expiration date of the event
schedule.scheduleJob('*/10 * * * * *', async () => {

    const currentDate = new Date();
    // The event query is having status as true
    const events = await Event.find({
        status: true
    });

    if (events.length == 1) {
        for (const event of events) {
            // If the current date matches or is past the finalClosureDate date (compare GMT+0 London)
            if (currentDate >= event.finalClosureDate) {
                // Change status to false and save
                event.status = false;
                await event.save();
            }
        }
    }
});


// Export the Mongoose model
module.exports = {
    Event,
    insertEvent, getAllEvents, getEventByID, updateEvent, deleteEvent, setDate, hasTrueStatusEvent, hasTrueStatusComment
};
