// 8. 게시판 추가
async function insertCategory(connection, insertCategoryParams) {
    const insertCategoryQuery = `
        INSERT INTO Board_TB(title, description) VALUES (?, ?);
    `;
    const insertCatecoryRow = await connection.query(
        insertCategoryQuery,
        insertCategoryParams
    );

    return insertCatecoryRow;
}

// title => 게시판 존재 여부
async function isCategory(connection, title) {
    const isCategoryQuery = `
        SELECT title
        FROM Board_TB BT
        WHERE BT.title LIKE concat ('%', ?, '%') ;
    `;

    const [categoryRows] = await connection.query(isCategoryQuery, title);
    return categoryRows;
}

// boardIdx => 게시판 존재 여부
async function isBoardIdExist(connection, boardIdx){
    const isBoardExistQuery = `
        SELECT boardIdx, title, description, status 
        FROM Board_TB
        WHERE boardIdx = ? AND status != 0;
    `;
    const [isBoardRows] = await connection.query(isBoardExistQuery, boardIdx);
    return isBoardRows;
}


// 9. 게시판 삭제
async function deleteBoard(connection, boardId){
    const deleteBoardQuery = `
        UPDATE Board_TB
        SET status = 0
        WHERE boardIdx = ?;
    `;
    const deleteBoardRow = await connection.query(deleteBoardQuery, boardId);
    return deleteBoardRow;
}

// 즐겨찾기 게시판
async function selectBoard(connection) {
    const selectBoardListQuery = `
        SELECT BoardT.boardIdx, title, LEFT(content, 35) AS content
        FROM (SELECT boardIdx, title FROM Board_TB WHERE status != 0 AND fixing != 0) BoardT
            INNER JOIN (SELECT boardIdx, content
            FROM (SELECT boardIdx, content, createdAt FROM PostTB ORDER BY createdAt DESC) PostT
            GROUP BY boardIdx) PostT
        ON PostT.boardIdx = BoardT.boardIdx;
              `;
    const [boardRows] = await connection.query(selectBoardListQuery);
    return boardRows;
}

// 검색으로 게시판 조회
async function selectBoardBySearch(connection, search) {
    const selectBoardQuery = `
        SELECT BoardT.boardIdx, title, LEFT(content, 35) AS content
        FROM (SELECT boardIdx, title FROM Board_TB WHERE status != 0) BoardT
            INNER JOIN (SELECT boardIdx, content
            FROM (SELECT boardIdx, content, createdAt FROM PostTB ORDER BY createdAt DESC) PostT
            GROUP BY boardIdx) PostT
        ON PostT.boardIdx = BoardT.boardIdx
        WHERE title LIKE concat ('%', ?, '%');
                `;
    const [boardSearchRows] = await connection.query(selectBoardQuery, search);
    return boardSearchRows;
}

// 게시판 게시글 조회
// 시간이 남으면 익명1, 익명2 숫자 카운트
async function selectPostByBoardIdx(connection, boardIdx){
    const selectPostQuery = `
        SELECT COMMONT.postIdx AS postIdx, boardTitle, postTitle, content, postImage, user, createdAt, likeCount,
               IFNULL(count, 0) AS commentCount
        FROM (SELECT postIdx, boardTitle, postTitle, content, postImage, user, createdAt, IFNULL(likeCount, 0) AS likeCount
              FROM (
                       SELECT postIdx,
                              BT.title                  AS boardTitle,
                              IFNULL(PostTB.title, ' ') AS postTitle,
                              content,
                              postImage,
                              CASE
                                  WHEN anonymous = 1 THEN '익명'
                                  END                   AS user,

                    CASE
                        WHEN TIMESTAMPDIFF(MINUTE, PostTB.createdAt, now()) <= 0 THEN '방금 전'
                        WHEN TIMESTAMPDIFF(MINUTE, PostTB.createdAt, now()) < 60
                            THEN CONCAT(TIMESTAMPDIFF(MINUTE, PostTB.createdAt, now()), '분 전')
                        WHEN TIMESTAMPDIFF(HOUR, PostTB.createdAt, now()) < 24
                            THEN CONCAT(TIMESTAMPDIFF(HOUR, PostTB.createdAt, now()), '시간 전')
                        WHEN TIMESTAMPDIFF(DAY, PostTB.createdAt, now()) < 30
                            THEN CONCAT(TIMESTAMPDIFF(DAY, PostTB.createdAt, now()), '일 전')
                        ELSE CONCAT(TIMESTAMPDIFF(MONTH, PostTB.createdAt, now()), '달 전')
                        END                   AS createdAt

                       FROM PostTB
                           INNER JOIN Board_TB BT ON BT.boardIdx = PostTB.boardIdx
                       WHERE BT.boardIdx = ? AND BT.status != 0
                   ) PostT
                       LEFT OUTER JOIN
                   (SELECT pcrIdx, IFNULL(count(*), 0) AS likeCount
                    FROM Like_TB
                    WHERE pcr = 0
                    GROUP BY pcrIdx) LikeT
                   ON PostT.postIdx = LikeT.pcrIdx) COMMONT
                 LEFT OUTER JOIN
             (SELECT CommentT.postIdx AS postIdx, CommentT.doubleIdx AS doubleIdx,
                     (IFNULL(count(*), 0) + IFNULL(count(*), 0)) AS count
              FROM Comment_TB CommentT
                  RIGHT OUTER JOIN (
                  SELECT doubleIdx , IFNULL(count(*), 0) count2
                  FROM DoubleComment
                  GROUP BY DoubleComment.doubleIdx
                  ) DoubleT
              ON CommentT.doubleIdx = DoubleT.doubleIdx
              GROUP BY postIdx) DCOMMENTT
             ON COMMONT.postIdx = DCOMMENTT.postIdx;
    `;
    const [boardPostRows] = await connection.query(selectPostQuery, boardIdx);
    return boardPostRows;
}



async function createPost(connection, insertPostInfoParams) {
    const insertPostQuery = `
        INSERT INTO PostTB( userId, boardIdx, title, postImage, content, anonymous)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    const insertPostRow = await connection.query(insertPostQuery, insertPostInfoParams );

    return insertPostRow;
}

// 13. 게시글 삭제

async function isPostIdExist(connection, postIdx){
    const isPostIdQuery = `
        SELECT * FROM PostTB WHERE postIdx = ? AND status != 0;
    `;
    const [isPostRow] = await connection.query(isPostIdQuery, postIdx);
    return isPostRow;
}
// 게시글 삭제 (1) 게시글 대댓글 삭제
async function deleteDouble(connection, postIdx){
    const deleteDoubleQuery = `
        UPDATE DoubleComment SET status = 0
    `;
    const deleteDoubleRow = await connection.query(deleteDoubleQuery, postIdx);
    return deleteDoubleRow;
}
// 게시글 삭제 (2) 게시글 댓글 삭제
async function deleteCommentPost(connection, postIdx){
    const deleteCommentQuery = `
        UPDATE DoubleComment SET status = 0
    `;
    const deleteCommentRow = await connection.query(deleteCommentQuery, postIdx);
    return deleteCommentRow;
}
// 게시글 삭제 (3) 게시글 삭제
async function deletePost(connection, postIdx){
    const deletePostQuery = `
        UPDATE PostTB SET status = 0 WHERE postIdx = ?;
    `;
    const deletePostRow = await connection.query(deletePostQuery, postIdx);
    return deletePostRow;
}

// 게시판 + 댓글 + 리뷰
async function isPcr0Exist(connection, pcrIdx){
    const isPcr0Query = `
        SELECT *
        FROM (SELECT
                  pcrIdx
              FROM Like_TB LT
              WHERE pcr = 0) LTB
                 INNER JOIN PostTB CT ON CT.postIdx = LTB.pcrIdx
        WHERE pcrIdx = ?;
    `;
    const isPcr0Row = await connection.query(isPcr0Query, pcrIdx);
    return isPcr0Row;
}
async function isPcr1Exist(connection, pcrIdx){
    const isPcr1Query = `
        SELECT *
        FROM (SELECT
                  pcrIdx
              FROM Like_TB LT
              WHERE pcr = 1) LTB
                 INNER JOIN Comment_TB CT ON CT.commentIdx = LTB.pcrIdx
        WHERE pcrIdx = ?;
    `;
    const isPcr1Row = await connection.query(isPcr1Query, pcrIdx);
    return isPcr1Row;
}
async function isPcr2Exist(connection, pcrIdx){
    const isPcr2Query = `
        SELECT
        SELECT *
        FROM (SELECT
                  pcrIdx
              FROM Like_TB LT
              WHERE pcr = 2) LTB
                 INNER JOIN Review RV ON RV.reviewIdx = LTB.pcrIdx
        WHERE pcrIdx = ?;
    `;
    const isPcr2Row = await connection.query(isPcr2Query, pcrIdx);
    return isPcr2Row;
}

async function createLike(connection, insertLikeParams) {
    const insertLikeQuery = `
        INSERT INTO Like_TB(pcr, pcrIdx, userId) VALUES (?, ?, ?);
    `;
    const insertLikeRow = await connection.query(insertLikeQuery, insertLikeParams);

    return insertLikeRow;
}
module.exports = {
    insertCategory,
    isCategory,
    deleteBoard,
    selectBoard,
    selectBoardBySearch,
    selectPostByBoardIdx,
    isBoardIdExist,
    createPost,
    deletePost,
    deleteCommentPost,
    deleteDouble,
    isPostIdExist,
    isPcr0Exist,
    isPcr1Exist,
    isPcr2Exist,
    createLike
};


