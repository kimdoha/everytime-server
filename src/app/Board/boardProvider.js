const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const boardDao = require("./boardDao");


// 10. 즐겨찾기 게시판 조회
exports.retrieveBoardList = async function (search) {
    if (!search) {
        const connection = await pool.getConnection(async (conn) => conn);
        const boardListResult = await boardDao.selectBoard(connection);
        connection.release();

        return boardListResult;

    } else {
        const connection = await pool.getConnection(async (conn) => conn);
        const boardListBySearchResult = await boardDao.selectBoardBySearch(connection, search);
        connection.release();

        return boardListBySearchResult;
    }
};

exports.retrievePostList = async function (boardIdx){

    const connection = await pool.getConnection(async (conn) => conn);
    const boardPostResult = await boardDao.selectPostByBoardIdx(connection, boardIdx);
    connection.release();

    return boardPostResult;
};

// boardId => 게시판 여부
exports.boardExistCheck = async function (boardIdx){

    const connection = await pool.getConnection(async (conn) => conn);
    const isBoardResult = await boardDao.isBoardIdExist(connection, boardIdx);
    connection.release();

    return isBoardResult;
}


exports.categoryExistCheck = async function (title){

    const connection = await pool.getConnection(async (conn) => conn);
    const isCategoryResult = await boardDao.isCategory(connection, title);
    connection.release();

    return isCategoryResult;
}

// postId => 게시 여부
exports.postExistCheck = async function(postIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    const isPostResult = await boardDao.isPostIdExist(connection, postIdx);
    connection.release();

    return isPostResult;
}

// 포스트 + 댓글 + 리뷰 유효 검사
exports.pcrExistCheck = async function (pcr, pcrIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    const isPcrResult = await boardDao.isPcrExist(connection, pcr, pcrIdx);
    connection.release();

    return isPcrResult;
}