module.exports = function(app){
    const review = require('./reviewController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 21. 최근 강의평 조회 API
    app.get('/app/review', review.getReview);

    // 22. 강의평 작성 API
    //app.route('/app/review').post(review.postReview);

    // 39. 세부 강의평 조회 API
    app.get('/app/review/:search', review.getReviewDetail);

    // 40. 강의평 좋아요 API
    //app.route('/app/review/like').post(review.postLike);

    // jwt를 사용하기 위해 jwtMiddleware 를 체이닝 방식으로 추가하는 예제
    // app.get('/app/users/:userId', jwtMiddleware, user.getUserById);

};