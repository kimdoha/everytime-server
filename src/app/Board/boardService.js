const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const boardProvider = require("./boardProvider");
const boardDao = require("./boardDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");


// 8. category 게시판 생성
exports.createCategory = async function(title, description){
    try{
        const insertCategoryParams = [ title, description ];

        const connection = await pool.getConnection(async (conn) => conn);

        const categoryResult = await boardDao.insertCategory(connection, insertCategoryParams);
        console.log(`추가된 카테고리 : ${categoryResult[0].insertId}`)
        connection.release();
        return response({ "isSuccess": true, "code": 1000, "message": "카테고리가 추가되었습니다." }, insertCategoryParams);
    }
    catch (err){
        logger.error(`App - createCategory Service error\n: ${err.message}`);
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


// 13. 좋아요 생성
exports.createLike = async function(  pcr, pcrIdx, userId ){
    try{
        const insertLikeParams = [  pcr, pcrIdx, userId ];

        const connection = await pool.getConnection(async (conn) => conn);

        const likeResult = await boardDao.createLike(connection, insertLikeParams);
        console.log(`추가된 좋아요 : ${likeResult[0].insertId}`)
        connection.release();
        return response({ "isSuccess": true, "code": 1000, "message": "좋아요 생성 성공" });
    }
    catch (err){
        logger.error(`App - createLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
