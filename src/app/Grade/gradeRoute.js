module.exports = function(app){
    const grade = require('./gradeController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 33. 전체 학점 조회 API
    // 로그인 시 일치하는 그 ID 값과 동일한 걸로 바꿔야할듯?
    app.get('/app/grade', grade.getTotalGrade);

    // 34. 학점(A, B, C, D) 비율 API
    app.get('/app/grade/percentage', grade.getPercentageGrade);

    // 35. 학기별 학점 조회 API
    app.get('/app/grade/:semester', grade.getSemesterGrade);

    // 36. 학기별 성적 입력 API
    app.route('/app/grade').post(grade.postSemesterGrade);

    // 37. 학기별 성적 수정 API
    //app.patch('/app/grade/:semester', grade.patchSemesterGrade);


};