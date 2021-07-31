const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const bookProvider = require("./bookProvider");
const bookDao = require("./bookDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");


// 8. 판매 완료이면 완료 처리
exports.updateState = async function(postId){
    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const isSellResult = await bookDao.isSellResult(connection, postId);
        console.log(`추가된 카테고리 : ${isSellResult[0].insertId}`)
        connection.release();
        return response({ "isSuccess": true, "code": 1000, "message": "판매 완료된 책입니다." }, {"update" : postId});
    }
    catch (err){
        logger.error(`App - isSell Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }

};


// 9. category 게시판 삭제
exports.editBoardStatus = async function(boardId){
    try{

        const connection = await pool.getConnection(async (conn) => conn);

        const editBoardResult = await boardDao.deleteBoard(connection, boardId);
        console.log(`삭제된 카테고리 : ${editBoardResult[0].insertId}`)
        connection.release();

        return response({ "isSuccess": true, "code": 1000, "message": "카테고리가 삭제되었습니다." }, {"Delete": boardId });
    }
    catch (err){
        logger.error(`App - editBoard Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }

};

// 11. 게시글 작성
exports.createPost = async function( userId, boardIdx, title, postImage, content, anonymous ){
    try{
        const insertPostInfoParams = [ userId, boardIdx, title, postImage, content, anonymous ];

        const connection = await pool.getConnection(async (conn) => conn);

        const postResult = await boardDao.createPost(connection, insertPostInfoParams);
        console.log(`추가된 포스트 : ${postResult[0].insertId}`)
        connection.release();
        return response({ "isSuccess": true, "code": 1000, "message": "게시글 작성에 성공하셨습니다." });
    }
    catch (err){
        logger.error(`App - createPost Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 13. 게시글 삭제
exports.editPostStatus = async function(postIdx){
    try{

        const connection = await pool.getConnection(async (conn) => conn);

        await connection.beginTransaction()     // 트랜잭션 적용 시작
        const deleteDoubleResult = await boardDao.deleteDouble(connection, postIdx);
        const deleteCommentResult = await boardDao.deleteCommentPost(connection, postIdx);
        const deletePostResult = await boardDao.deletePost(connection, postIdx);
        console.log(`삭제된 게시글 : ${deletePostResult[0].insertId}`)
        await connection.commit()
        connection.release();

        return response({ "isSuccess": true, "code": 1000, "message": "게시글 삭제되었습니다." }, {"Delete": postIdx });
    }
    catch (err){
        const connection = await pool.getConnection(async (conn) => conn);
        await connection.rollback()
        connection.release();

        logger.error(`App - deletePost Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// exports.createUser = async function (userId, password, name, email, nickname, studentId, myMajor, college) {
//     try {
//         // 이메일 중복 확인
//         const emailRows = await userProvider.emailCheck(email);
//         if (emailRows.length > 0)
//             return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);
//
//         // id 중복 확인
//         const userIdRows = await userProvider.userIdCheck(userId);
//         if (userIdRows.length > 0)
//             return errResponse(baseResponse.SIGNUP_REDUNDANT_USERID);
//
//         // 학교 확인
//         const collegeRows = await userProvider.collegeCheck(college);
//         if (collegeRows.length === 0)
//             return errResponse(baseResponse.SIGNUP_COLLEGE_EMPTY);
//
//         // 비밀번호 암호화
//         const hashedPassword = await crypto
//             .createHash("sha512")
//             .update(password)
//             .digest("hex");
//
//         const insertUserInfoParams = [userId, hashedPassword, name, email, nickname, studentId, myMajor, college];
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
//         console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
//         connection.release();
//         return response(baseResponse.SIGN_UP_SUCCESS);
//
//
//     } catch (err) {
//         logger.error(`App - createUser Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// };



// exports.updateNickName = async function (userId, newName){
//
//     try{
//         const updateNickNameInfoParams = [userId, nickname];
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         const updateResult = await userDao.updateNickName(connection, updateNickNameInfoParams);
//         console.log(`수된 회원 : ${updateResult[0].insertId}`)
//         connection.release();
//         return response(baseResponse.SIGN_UP_SUCCESS);
//
//     }
//     catch (err) {
//         logger.error(`App - createUser Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// }