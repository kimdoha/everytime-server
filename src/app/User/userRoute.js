module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    const jwt = require("jsonwebtoken");
    const crypto = require("crypto");
    const {connect} = require("http2");


    // 1. 유저 생성 (회원가입) API
    app.route('/app/users/register').post(user.postUsers);


    // 2. 특정 유저 조회 API
    app.get('/app/users/:userId', user.getUserById);

    // 3. 사용자 활성화 비활성화
    //app.patch('/app/user', user.patchStatus);

    // 4. 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/users/:userId/nickName', jwtMiddleware, user.patchUsers)

    // 5. 사용자 프로필 이미지 수정
    app.patch('/app/users/:userId/profileImage', jwtMiddleware ,user.patchProfileImage);

    // 5. 친구 유저 조회 API
    app.get('/app/user/friends', user.getFriendsById);


    var users = [
        {
            email:'',
            password: '',
            nickname:""
        }
    ];

    app.get('/app/user/logout', function(req, res){
        delete req.session.nickname;
        req.session.save(function(){
            res.redirect('/app/user/welcome');
        }) ;
    });


    //7. 로그인 하기 API (JWT 생성)// TODO: After 로그인 인증 방법 (JWT)
    //
    //app.post('/app/user/login', user.login);

    app.post('/app/user/login', function(req, res){
        const email = req.body.email;
        const password = req.body.password;

        var me = {
            email:'',
            password: '',
            nickname: ''
        };

        // homepage
        if(email === me.email && password === me.password){
            req.session.nickname = me.nickname;
            req.session.save(function(){
                res.redirect('/app/user/welcome');
            });
            //res.send(req.session);
        } else {
            res.send('Login FAIL <a href="/app/user/login">login</a>');
        }

    });


    app.get('/app/user/login', function(req,res){
        var output = `
        
            <h1>LOGIN</h1>
            <form  action="/app/user/login" method="post" >
                <p><input type="email" name="email" placeholder="email"/></p>
                <p><input type="password" name="password" placeholder="password"/></p>
                <p><input type="submit" /></p>
            </form>
        `;
        res.send(output);
    });
    //app.post('/app/logout', user.logout);


};
