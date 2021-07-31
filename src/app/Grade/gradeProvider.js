const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const gradeDao = require("./gradeDao");


// 33. 전체 학점 조회
exports.retrieveTotalGrade= async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const totalGradeResult = await gradeDao.selectTotalGrade(connection);
    connection.release();

    return totalGradeResult;
};

//34. 학점 비율 조회
exports.retrievePercentage= async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const selectPercentageResult = await gradeDao.selectPercentage(connection);
    connection.release();

    return selectPercentageResult;
};

// 35. 학기별 성적
exports.retrieveSemesterGrade = async function (semester){

    const connection = await pool.getConnection(async (conn) => conn);
    const semesterGradeResult = await gradeDao.semesterGrade(connection, semester);
    connection.release();

    return semesterGradeResult;
};

