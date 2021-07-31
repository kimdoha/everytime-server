module.exports = function(app){
    const board = require('./boardController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 8. 게시판 생성 API
    app.route('/app/boards').post(board.postCategory);

    // 9. 게시판 즐겨찾기 API
    app.get('/app/boards', board.getCategoyList);

    // 10. 게시판 삭제 API
    app.patch('/app/boards/:boardId', board.patchBoard);

    // 11. 게시판의 게시글 조회 API
    app.get('/app/posts/:boardId', board.getPostList);

    // 12. 게시글 작성 API
    app.route('/app/post').post(board.writePost);

    // 13. 게시글 삭제 API
    app.patch('/app/post/:postId', board.patchPost);

};
