// 최근 올라온 강의평
async function selectReview(connection) {
    const selectReviewListQuery = `
      SELECT CONCAT(subjectName,':', professor) AS title,
       starPoint, CONCAT(SUBSTRING(semester,3), ' 수강자') AS user, content

    FROM Review RV
    INNER JOIN UserTB US ON RV.userId = US.id
    INNER JOIN Subject SB ON RV.subjectIdx = SB.subjectIdx
    ORDER BY RV.createdAt DESC;
              `;
    const [reviewRows] = await connection.query(selectReviewListQuery);
    return reviewRows;
}
// 검색으로 강의평 조회
async function selectReviewBySearch(connection, insertParams){
    const reviewListQuery = `
        SELECT CONCAT(subjectName,':', professor) AS title,
               starPoint, CONCAT(SUBSTRING(semester,3), ' 수강자') AS user, content

        FROM Review RV
        INNER JOIN UserTB US ON RV.userId = US.id
        INNER JOIN Subject SB ON RV.subjectIdx = SB.subjectIdx
        WHERE professor LIKE CONCAT('%', ?, '%')
        OR subjectName LIKE CONCAT('%', ?, '%')
        ORDER BY RV.createdAt DESC;
       `;
    const [reviewSearchRows] = await connection.query(reviewListQuery, insertParams);
    return reviewSearchRows;
}

async function selectReviewDetail(connection, search){
    const reviewDetailQuery = `
        SELECT subjectName, semester, content, starPoint, likeCount
        FROM (SELECT reviewIdx, subjectName, semester, content, starPoint
              FROM Review RV
                       INNER JOIN Subject S ON S.subjectIdx = RV.subjectIdx
              WHERE subjectName LIKE CONCAT('%', ?, '%')
              ORDER BY RV.createdAt DESC) CommentT
                 INNER JOIN
             (SELECT pcrIdx, count(*) AS likeCount
              FROM Like_TB
              WHERE pcr = 2
              GROUP BY pcrIdx) LikeT
             ON CommentT.reviewIdx = LikeT.pcrIdx;
       `;
    const [reviewDetailRows] = await connection.query(reviewDetailQuery, search);
    return reviewDetailRows;
}

module.exports = {
    selectReview,
    selectReviewBySearch,
    selectReviewDetail
};

