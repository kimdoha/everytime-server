const jwtMiddleware = require("../../../config/jwtMiddleware");
const reviewProvider = require("../../app/Review/reviewProvider");
const reviewService = require("../../app/Review/reviewService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

/**
 * API No. 21
 * API Name : 최근 강의평 조회 API
 * [GET] /app/review ? search = ''회 (과목명이나 교수명으로 검)
 //  */
exports.getReview = async function (req, res) {

    /**
     * Query String: search
     */
    const search = req.query.search;

    if (!search) {
        // 최근 올라온 강의평 순서대로 조회
        const reviewListResult = await reviewProvider.retrieveReviewList();
        if(reviewListResult.length < 1) // SELECT_BOOK_EMPTY
            return res.send(errResponse(baseResponse.SELECT_REVIEW_EMPTY ));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "최근 강의평 조회 성공" }, reviewListResult));
    } else {
        // 검색된 내용 순서대로 조회
        if(search.length < 2)
            return res.send(errResponse(baseResponse.INPUT_SEARCH_LENGTH ));

        const reviewListBySearch = await reviewProvider.retrieveReviewList(search);
        if(reviewListBySearch.length < 1)
            return res.send(errResponse(baseResponse.SEARCH_REVIEW_EMPTY));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "강의평가 검색 조회 성공" }, reviewListBySearch));
    }
};


/**
 * API No. 23
 * API Name : 세부 강의평 조회 API
 * [GET] /app/review/:search/detail
 //  */