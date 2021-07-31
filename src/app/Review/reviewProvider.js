const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const reviewDao = require("./reviewDao");

// Provider: Read 비즈니스 로직 처리
// 29. 최근 올라온 강의평 조회
exports.retrieveReviewList = async function (search) {
    if (!search) {
        const connection = await pool.getConnection(async (conn) => conn);
        const reviewListResult = await reviewDao.selectReview(connection);
        connection.release();

        return reviewListResult;

    } else {
        const insertParams = [search, search];
        const connection = await pool.getConnection(async (conn) => conn);
        const reviewListBySearchResult = await reviewDao.selectReviewBySearch(connection, insertParams);
        connection.release();

        return reviewListBySearchResult;
    }
};