import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import '../styles/register.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Register(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const onSubmit = async (e) =>{
        e.preventDefault();

        if(password !== confirmPassword)
        {
            alert("Password does not match!");
            return;
        }

        const data = {
            user_email: email,
            password: password
        }

        try{
            const response = await fetch(`${API_URL}/auth/register`, 
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/JSON"
                    },
                    body: JSON.stringify(data)
                }
            );
            
            const result = await response.json();
            
            if(response.ok){
                alert("Register successfully! Please login to continue.");
                console.log(result.message || "Register Completed");
                navigate('/login');
            }
            else{
                alert(result.message || "Register failed!");
            }
        }
        catch(err)
        {
            console.error("Connection error: ", err);
            alert("Error connecting to server!");
        }
    };

    return(
        <div className="register-container">
            <form onSubmit={onSubmit}>
                <h3>Sign Up</h3>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Name or Email" required/>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/>
                <label htmlFor="confirmPassword">Re-Password</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Please enter your password again" required/>
                <div className="terms">
                    <input type="checkbox" id="CB" required/>
                    <label htmlFor="CB">I agree to the <a href="https://phunugioi.com/wp-content/uploads/2020/11/anh-meo-de-thuong-cute-nhat.jpg" target="_blank">Terms and Conditions</a></label>
                </div>
                <button type="submit">Sign Up</button>
                <a href="/login" id="login-link">Already have an account? Login here.</a>
            </form>
        </div>
    );
}

export default Register;