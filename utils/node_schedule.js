const schedule = require('node-schedule');

module.exports = function (app) {
    schedule.scheduleJob('*/5 * * * * *', async function () {
        // code để cập nhật dữ liệu ở đây
        console.log('Data updated at', new Date());
    });
};
