module.exports = function(app){
    const book = require('./bookController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 29. 최근 올라온 책 조회 API
    app.get('/app/book', book.getCategoyList);

    // 30. 책 판매 작성 API
    //app.route('/app/book').post(book.postBookSell);

    // 31. 마이페이지 API
    app.get('/app/book/:userId', book.getMyList);

    // 32. 내가 쓴 판매글 수정 API
    //app.patch('/app/book/user/:bookPostId', book.patchMyPost);

    // 33. 책 판매글 세부내용 조회 API
    app.get('/app/book/:bookPostId/detail', book.getDetailPost);



};