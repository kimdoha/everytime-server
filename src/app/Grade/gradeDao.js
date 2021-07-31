// 전체 성적 계산
async function calculateGrade(connection, userId) {
    const calculateGradeQuery = `
             CALL myFunction(?);
    `;
    const calculateGradeRow = await connection.query(calculateGradeQuery, userId);

    return calculateGradeRow;
}
// 전공 성적 계산
async function calculateMajorGrade(connection, userId) {
    const calculateMajorGradeQuery = `
            CALL myFunction2(?);
    `;
    const calculateMajorGradeRow = await connection.query(calculateMajorGradeQuery, userId);

    return calculateMajorGradeRow;
}

// 성적 입력
async function inputGrade(connection, insertGradeParams) {
    const insertGradeQuery = `

        INSERT INTO InputGrade( myGradeIdx, subjectName, credit, subjectGrade, isMajor, userId )
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    const insertGradeRow = await connection.query(insertGradeQuery, insertGradeParams );

    return insertGradeRow;
}


// 학점 조회
async function selectTotalGrade(connection){
    const selectTotalGrade = `
        SELECT CONCAT(TRUNCATE((SUM(semesterGrade) / COUNT(DISTINCT(semesterGrade))), 2), ' / ',totalMajor) AS 'totalScore',
               CONCAT((SUM(semesterMajorGrade) / COUNT(DISTINCT(semesterMajorGrade))) ,' / ',totalMajor) AS 'majorScore',
               SUM(semesterCredit) AS 'myCredit',
               majorCredit AS 'targetCredit'
        FROM MySemesterInfo info
                 INNER JOIN UserTB user ON  info.userId = user.id
            INNER JOIN College col ON  col.collegeName = user.college
            INNER JOIN MajorInfo major ON  major.majorName = user.myMajor;
    `;
    const [totalGradeRow] = await connection.query(selectTotalGrade);
    return totalGradeRow;
}

// 학점 비율 조회
async function selectPercentage(connection){
    const selectPercentageQuery = `
        SELECT subjectGrade,
               ROUND(COUNT(subjectGrade)/(SELECT COUNT(subjectGrade) FROM InputGrade)*100)
                   AS percentage
        FROM InputGrade
        GROUP BY subjectGrade
        ORDER BY percentage DESC
            LIMIT 5;
    `;
    const [selectPercentageRow] = await connection.query(selectPercentageQuery);
    return selectPercentageRow;
}

// 학기별 성적
async function semesterGrade(connection, semester){
    const semesterGradeQuery = `
        SELECT semesterName AS '학기', semesterGrade AS '평점',
               IFNULL(semesterMajorGrade, 0) AS '전공', semesterCredit AS '취득'
        FROM MySemesterInfo SI
        WHERE SI.myGradeIdx = ?;
    `;
    const [ semesterGradeRow ] = await connection.query(semesterGradeQuery, semester);
    return semesterGradeRow;
}

module.exports = {
    selectTotalGrade,
    selectPercentage,
    semesterGrade,
    inputGrade,
    calculateGrade,
    calculateMajorGrade
};


