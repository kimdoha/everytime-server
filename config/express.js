const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');

module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());

    require('../src/app/User/userRoute')(app);
    require('../src/app/Board/boardRoute')(app);
    require('../src/app/Grade/gradeRoute')(app);
    require('../src/app/Table/tableRoute')(app);
    require('../src/app/Book/bookRoute')(app);
    require('../src/app/Review/reviewRoute')(app);

    return app;
};