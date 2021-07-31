const jwtMiddleware = require("../../../config/jwtMiddleware");
const boardProvider = require("../../app/Board/boardProvider");
const boardService = require("../../app/Board/boardService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


/**
 * API No. 8
 * API Name : 게시판 생성 API
 * [POST] /app/boards
 */
// 시간이 되면 익명 추가
exports.postCategory = async function (req, res) {

    /**
     * Body: title, description
     */
    const { title, description } = req.body;

    // 빈 값 체크
    if (!title)
        return res.send(response(baseResponse.INPUT_TITLE_EMPTY));


    // 길이 체크
    if (title.length < 2 || title.length > 30)
        return res.send(response(baseResponse.INPUT_LENGTH));

    // 중복 체크
    const isCategory = await boardProvider.categoryExistCheck(title);
    console.log(isCategory);
    if(isCategory.length > 0) {
        console.log(isCategory);
        return res.send(errResponse(baseResponse.CREATE_REDUNDANT_BOARD));
    }


    const categoryResponse = await boardService.createCategory( title, description );

    return res.send(categoryResponse);
};

/**
 * API No. 9
 * API Name : 게시판 즐겨찾기 조회 API
 * [GET] /app/boards
 //  */
exports.getCategoyList = async function (req, res) {

    const search = req.query.search;

    if (!search) {
        // 즐겨찾기 게시판 조회
        const boardListResult = await boardProvider.retrieveBoardList();
        if(boardListResult.length < 1)
            return res.send(errResponse(baseResponse.SELECT_BOARD_EMPTY));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "즐겨찾기 게시판이 조회되었습니다." }, boardListResult));
    } else {
        // 일부 게시판 조회
        const boardListBySearch = await boardProvider.retrieveBoardList(search);
        console.log(boardListBySearch);
        if(boardListBySearch.length < 1)
            return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "검색한 게시판이 조회되었습니다." }, boardListBySearch));
    }
};

/**
 * API No. 10
 * API Name : 게시판 삭제 API
 * [Patch] /app/boards/:boardId
//  */

exports.patchBoard = async function (req, res) {

    const boardId = req.params.boardId;

    // 빈값 체크
    if(!boardId)
        return res.send(response(baseResponse.INPUT_EMPTY));

    // 활성 게시판 (status == 1) 이 아니면 ,
    const isBoard = await boardProvider.boardExistCheck(boardId);
    if(isBoard.length < 1)
        return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));

    else {
        const editBoardStatus = await boardService.editBoardStatus(boardId);
        return res.send(editBoardStatus);
    }
};



/**
 * API No.11
 * API Name : 게시글들 조회 API
 * [GET] /app/posts/:boardId
 */

exports.getPostList = async function (req, res) {

    /**
     * Query String: boardId
     */
    const boardId = req.params.boardId;

    // 여기 부분 다시 수정
    if (!boardId) {
        return res.send(errResponse(baseResponse.INPUT_WRONG));

    } else {
        // 게시판이 존재여부 체크
        const isBoard = await boardProvider.boardExistCheck(boardId);
        if(isBoard.length < 1)
            return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));

        const postListByBoardId = await boardProvider.retrievePostList(boardId);

        if(postListByBoardId.length < 1)
            return res.send(errResponse(baseResponse.SELECT_POST_EMPTY));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "해당 게시판의 게시글을 조회했습니다." }, postListByBoardId));
    }
};

/**
 * API No. 12
 * API Name : 게시글 작성 API
 * [POST] /app/post/
 */

exports.writePost = async function (req, res){
    /**
     * Body: userId, boardId, title, postImage, content, annoymous
     */

    const { userId, boardIdx, title, postImage, content, anonymous } = req.body;

    // 빈 값 체크
    if (!userId)
        return res.send(response(baseResponse.INPUT_EMPTY));

    if (!boardIdx)
        return res.send(response(baseResponse.INPUT_BOARDID_EMPTY));


    // 게시판 인덱스 유효검사
    const isBoard = await boardProvider.boardExistCheck(boardIdx);
    if(isBoard.length < 1)
        return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));

    // title 길이 제한 검사
    if (title.length < 2 || title.length > 5000){
        if(title.length < 2){
            return res.send(response(baseResponse.INPUT_TITLE_LENGTH));
        } else {
            return res.send(response(baseResponse.INPUT_TITLE_LENGTH2));
        }
    }

    const writeResponse = await boardService.createPost(
        userId, boardIdx, title, postImage, content, anonymous
    );

    return res.send(writeResponse);

};

/**
 * API No. 13
 * API Name : 게시글 삭제 API
 * [POST] /app/post/:postIdx
 */
//
exports.patchPost = async function (req, res) {

    const postIdx = req.params.postId;

    // 빈값 체크
    if(!postIdx)
        return res.send(response(baseResponse.INPUT_EMPTY));

    // 활성 게시글 (status == 1) 이 아니면 ,
    const isPost = await boardProvider.postExistCheck(postIdx);
    if(isPost.length < 1)
        return res.send(errResponse(baseResponse.SELECT_POST_EMPTY ));

    else {
        const editPostStatus = await boardService.editPostStatus(postIdx);
        return res.send(editPostStatus);
    }
};

/**
 * API No. 14
 * API Name : 좋아요 생성 API
 * [POST] /app/post/like
 */

exports.postLike = async function (req, res) {
    
    const { pcr, pcrIdx, userId } = req.body;

    // 빈 값 체크
    if (!pcr || !pcrIdx || !userId)
        return res.send(response(baseResponse.INPUT_EMPTY));

    // 공백 체크
    var re = /s$/;
    if(re.test(pcr) || re.test(pcrIdx) || re.test(userId))
        return res.send(response(baseResponse.INPUT_NOT_SPACE));

    // 숫자 체크
    var regExp = /^[0-9]+$/;
    if(!regExp.test(pcr) || !regExp.test(pcrIdx) || !regExp.test((userId)))
        return res.send(response(baseResponse.INPUT_NUMBER));

    // 포스트 + 댓글 + 리뷰 유효 검사
    const isPcrExist = await boardProvider.pcrExistCheck(pcr, pcrIdx);
    if(isPcrExist.length < 1)
        return res.send(errResponse(baseResponse.SEARCH_NOT_EXIST));


    const likeResponse = await boardService.createLike(
        pcr, pcrIdx, userId
    );

    return res.send(likeResponse);
};