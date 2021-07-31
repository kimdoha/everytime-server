module.exports = function(app){
    const table = require('./tableController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 34. 내 시간표 조회 API
    // 로그인 시 일치하는 그 ID 값과 동일한 걸로 바꿔야할듯?
    app.get('/app/table/:semesterId/:num', table.getMyTable);

    // 35. 시간표에 과목 추가(+ 추가 시간표 ) API
    app.route('/app/table').post(table.postMyTable);

    // 36. 시간표에 과목 삭제 API
    app.patch('/app/table/:subjectId', table.patchMyTable);


};