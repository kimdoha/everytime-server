// 33. 책 포스트 존재 여부
async function isPostExist(connection, postId) {
    const isPostExistQuery = `
        SELECT bookName, bookAuthor, publisher,  CONCAT(SUBSTRING(user.college,1,3) ,' 재학생') AS user,
       content, salePrice, originalPrice,
       DATE_FORMAT( BP.createdAt , '%Y년 %c월 %d일') AS createdAt,
       underlineTrace , handwritingTrace , isCover, writingName,
       pageDiscoloration, pageDamage, myBookImage, deliveryAvailable,
       directTransaction, meetPlace, latitude, longitude


        FROM BookPost BP
            INNER JOIN BookInfo BI ON BP.bookId = BI.bookId
            INNER JOIN UserTB user ON BP.userId = user.id
        WHERE bookPostIdx = ? AND isCompletedSell != 'Y';
    `;

    const [isPostRows] = await connection.query(isPostExistQuery, postId);
    return isPostRows;
}

// 판매완료인지 여부 확인
async function isSellPost(connection, postId){
    const isSellPostQuery = `
        SELECT * FROM BookPost WHERE bookPostIdx = ? AND isCompletedSell = 'Y';
    `;
    const [isPostRows] = await connection.query(isSellPostQuery , postId);
    return isPostRows;
}


// 판매 완료 된 책 content 바꾸기
async function isSellResult(connection, postId){
    const updateStateQuery = `
        UPDATE BookPost SET content = '이 책은 판매가 완료되었습니다.' WHERE bookPostIdx = ?;
    `;
    const updateStateRow = await connection.query(updateStateQuery, postId);
    return updateStateRow;
}

// 최근 올라온 책
async function selectBook(connection) {
    const selectBookListQuery = `
        SELECT bookName, bookAuthor, publisher, originalPrice, salePrice,
               myBookImage,CONCAT(SUBSTRING(user.college,1,3) ,' 재학생')  AS user,

               CASE
                   WHEN deliveryAvailable = '가능'
                       THEN CONCAT('택배: ',deliveryAvailable)
                   ELSE ' '
                   END AS delivery,

               CASE
                   WHEN BP.directTransaction = '가능'
                       THEN CONCAT('직거래: ',meetPlace)
                   ELSE ' '
                   END AS directMeet,

               CASE
                   WHEN isCompletedSell = 'Y'
                       THEN '판매완료'
                   ELSE ''
                   END AS isSell

        FROM BookPost BP
                 INNER JOIN BookInfo BI ON BP.bookId = BI.bookId
                 INNER JOIN UserTB user ON BP.userId = user.id
        ORDER BY BP.createdAt DESC
            LIMIT 7;
              `;
    const [bookRows] = await connection.query(selectBookListQuery);
    return bookRows;
}

// 검색으로 책 조회
async function selectBookBySearch(connection, search) {
    const selectBookQuery = `
            SELECT bookName, bookAuthor, publisher, originalPrice, salePrice,
           myBookImage,CONCAT(SUBSTRING(user.college,1,3) ,' 재학생')  AS user,
    
            CASE
                WHEN deliveryAvailable = '가능'
                THEN CONCAT('택배: ',deliveryAvailable)
                ELSE ' '
            END AS delivery,
    
            CASE
                WHEN BP.directTransaction = '가능'
                THEN CONCAT('직거래: ',meetPlace)
                ELSE ' '
            END AS directMeet,
    
            CASE
                WHEN isCompletedSell = 'Y'
                THEN '판매완료'
                ELSE ''
            END AS isSell
        
        FROM BookPost BP
        INNER JOIN BookInfo BI ON BP.bookId = BI.bookId
        INNER JOIN UserTB user ON BP.userId = user.id
        WHERE title LIKE concat ('%', ?, '%')
        ORDER BY BP.createdAt DESC;
    `;
    const [bookSearchRows] = await connection.query(selectBookQuery, search);
    return bookSearchRows;
}

// 마이페이지 조회
async function selectMyBookPost(connection, userId){
    const selectMyBookQuery = `
        SELECT bookName, bookAuthor, publisher, originalPrice, salePrice,
               myBookImage, CONCAT(SUBSTRING(user.college,1,3) ,' 재학생') AS user,

        CASE
            WHEN deliveryAvailable = '가능'
            THEN CONCAT('택배: ',deliveryAvailable)
            ELSE ' '
        END AS delivery,

        CASE
            WHEN BP.directTransaction = '가능'
            THEN CONCAT('직거래: ',meetPlace)
            ELSE ' '
        END AS directMeet,

        CASE
            WHEN isCompletedSell = 'Y'
            THEN '판매완료'
            ELSE ' '
        END AS isSell

        FROM BookPost BP
        INNER JOIN BookInfo BI ON BP.bookId = BI.bookId
        INNER JOIN UserTB user ON BP.userId = user.id
        WHERE BP.userId = ?
        ORDER BY BP.createdAt DESC;
    `;
    const [myBookPostRows] = await connection.query(selectMyBookQuery, userId);
    return myBookPostRows;
}



// async function createPost(connection, insertPostInfoParams) {
//     const insertPostQuery = `
//         INSERT INTO PostTB( userId, boardIdx, title, postImage, content, anonymous)
//         VALUES (?, ?, ?, ?, ?, ?);
//     `;
//     const insertPostRow = await connection.query(insertPostQuery, insertPostInfoParams );

//     return insertPostRow;
// }



module.exports = {
    selectBook,
    selectBookBySearch,
    selectMyBookPost,
    isPostExist,
    isSellPost,
    isSellResult
};


