import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './LoginStyle.module.css';

const Login = ({ setIsAuthenticated }) => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/users/login', {
                email: emailRef.current.value,
                password: passwordRef.current.value,
            });

            // Kiểm tra nếu đăng nhập thành công
            if (response.data.message === 'Đăng nhập thành công!') {
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('isAuthenticated', 'true'); // Lưu vào localStorage

                // Cập nhật trạng thái đăng nhập và chuyển hướng đến trang chủ
                setIsAuthenticated(true);
                navigate('/'); // Chuyển đến trang chủ
            } else {
                setMessage('Sai thông tin đăng nhập!');
            }
        } catch (err) {
            setMessage('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    return (
        <div>
            <div className={style.container}>
                <h1>Ebook</h1>
                <p>Ebook giúp bạn kết nối và chia sẻ<br/> với mọi người trong cuộc sống của bạn.</p>
            </div>
            <header className={style.header}>
                <form onSubmit={handleSubmit}>
                    <div className={style.box}>
                        <input type="email" ref={emailRef} placeholder="Email address" required />
                        <input type="password" ref={passwordRef} placeholder="Enter password" required />
                    </div>
                    <hr style={{ width: '290px', margin: 'revert' }} />
                    <button type="submit" className={style.link}>Log In</button>
                </form>
                {message && <p style={{ color: 'red', textAlign:"center" , margin: "0 0 -25px 0"}}>{message}</p>}
                <div className={style.link2}>
                    <a onClick={() => navigate('/register')}>Create new account</a>
                </div>
            </header>
        </div>
    );
};

export default Login;
