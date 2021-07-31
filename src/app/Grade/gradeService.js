const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const gradeProvider = require("./gradeProvider");
const gradeDao = require("./gradeDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");


// 성적 입력
exports.inputGrade = async function( semester, subjectName, credit, subjectGrade, isMajor ){
    try{

        const insertGradeParams = [ semester, subjectName, credit, subjectGrade, isMajor ];

        const connection = await pool.getConnection(async (conn) => conn);

        const inputGradeResult = await gradeDao.inputGrade(connection, insertGradeParams);

        await connection.beginTransaction()     // 트랜잭션 적용 시작
        const calculateGradeResult = await gradeDao.calculateGrade(connection, userId);
        console.log(`전체 성적 계산 : ${calculateGradeResult[0]}`)


        const calculateMajorGradeResult = await gradeDao.calculateMajorGrade(connection, userId);
        console.log(`전공 성적 계산 : ${calculateMajorGradeResult[0]}`)

        const viewGradeResult = await gradeDao.semesterGrade(connection, semester, userId);

        console.log(`추가된 포스트 : ${inputGradeResult[0].insertId}`)
        await connection.commit()           //  트랜잭션 종료

        connection.release();
        return response({ "isSuccess": true, "code": 1000, "message": "성적 입력 성공" });
    }
    catch (err){
        logger.error(`App - inputGrade Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

