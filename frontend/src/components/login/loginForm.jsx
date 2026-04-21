import react, { useState } from 'react';
import {useNavigate} from  'react-router-dom';
import './loginForm.css';

const API_URL = 'http://localhost:3000';

function LoginForm()
{
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (e) =>{
        e.preventDefault();

        const data ={
            user_email: email,
            password: password
        }

        try{
            const response = await fetch(`${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if(response.ok)
            {
                console.log(`login sucessfully, token: ${result.token}`);

                localStorage.setItem("token", result.token);

                alert("Đăng nhập thành công!");

                navigate('/dashboard');
            }
            else
            {
                alert(result.message || "Đăng nhập thất bại!");
            }
        }
        catch(err)
        {
            console.error("Lỗi kết nối: ", err);
            alert("Lỗi kết nối tới server!");
        }
    }

    return(
        <div className= "login-container">
            <form onSubmit ={onSubmit} className='login-form'>
                <h3>Login Here</h3>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter username or email" required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
                <button type="submit">Login</button>
                <a id="register-link" href="/register">Don't have an account yet? Register here!</a>
            </form>
        </div>
    );
}

export default LoginForm;