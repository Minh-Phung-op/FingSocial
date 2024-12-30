import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './Resgister.module.css';

const Register = () => {
    const fullNameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const rePasswordRef = useRef(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const fullName = fullNameRef.current.value;
        const rePassword = rePasswordRef.current.value;

        if (password !== rePassword) {
            setMessage('Mật khẩu không khớp!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/users/register', {
                fullName,
                email,
                password,
            });

            if (response.data.message === 'success') {
                setMessage('Đăng ký thành công!');
                navigate('/login'); // Chuyển hướng đến trang đăng nhập
            } else {
                setMessage('Đăng ký không thành công, thử lại!');
            }
        } catch (err) {
            setMessage('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    return (
        <div className={style.page}>
            <h1 style={{ fontSize: '42px', color: '#1877f2', marginBottom: '10px', marginTop: '35px' }}>Ebook</h1>
            <div className={style.container}>
                <div className={style.title}>
                    <h2 className={style.first_title}>Tạo tài khoản mới</h2>
                    <p className={style.first_sub_title}>Nhanh chóng và dễ dàng</p>
                    <hr className={style.hr} />
                </div>
                <header>
                    <form onSubmit={handleSubmit}>
                        <div className={style.box}>
                            <input type="text" ref={fullNameRef} placeholder="Enter Full Name" required />
                            <input type="email" ref={emailRef} placeholder="Email address" required />
                            <input type="password" ref={passwordRef} placeholder="Enter password" required />
                            <input type="password" ref={rePasswordRef} placeholder="Enter Re-password" required />
                        </div>
                        <hr style={{ width: '290px', margin: 'revert' }} />
                        <button type="submit" className={style.link}>Sign Up</button>
                    </form>
                    {message && <p style={{ color: 'red' , textAlign:"center"}}>{message}</p>}
                    <div className={style.link1}>
                        <a onClick={() => navigate('/login')}>Do you already have an account?</a>
                    </div>
                </header>
            </div>
        </div>
    );
};

export default Register;
