const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const bookDao = require("./bookDao");

// 29. 최근 올라온 책 조회
exports.retrieveBookList = async function (search) {
    if (!search) {
        const connection = await pool.getConnection(async (conn) => conn);
        const bookListResult = await bookDao.selectBook(connection);
        connection.release();

        return bookListResult;

    } else {
        const connection = await pool.getConnection(async (conn) => conn);
        const bookListBySearchResult = await bookDao.selectBookBySearch(connection, search);
        connection.release();

        return bookListBySearchResult;
    }
};
// 31. 마이페이지 조회
exports.retrieveMyBookList = async function (userId){

    const connection = await pool.getConnection(async (conn) => conn);
    const selectMyBookPost = await bookDao.selectMyBookPost(connection, userId);
    connection.release();

    return selectMyBookPost;
};

// 33. 책 포스트 ID로 세부 내용 조회
exports.retrieveBookPost = async function (postId){

    const connection = await pool.getConnection(async (conn) => conn);
    const isPostResult = await bookDao.isPostExist(connection, postId);
    connection.release();

    return isPostResult;
}

// 해당 글이 판매 완료인지 확인
exports.sellBookList = async function(postId){
    const connection = await pool.getConnection(async (conn) => conn);
    const isSellPostResult = await bookDao.isSellPost(connection, postId);
    connection.release();

    return isSellPostResult;
}
