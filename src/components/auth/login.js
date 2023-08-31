import React, { useState } from "react"
import { useLogin } from "../../hooks/auth"
import { auth } from "../../lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth";
import logo from '../../a.png'; // Tell webpack this JS file uses this image
import '../../pages/shared.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useLogin();

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log(email);
            console.log(password)
            await login({ email, password });
        }
        catch (error) {
            console.log(error);
        }
    };

    let hintText = 'Email',
        hintText2 = "Password";
    console.log("in login component")

    return (
        <div class="container">  {/* Main Container Div Start *}
             
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>    

        {/* Logo Start   */}
            <div class="logo">
                <a href='./../'>
                    <img src={logo} alt="Logo" />
                </a>
            </div>
            {/* Logo End */}


            <div class="row">  {/* Body Container Div Start */}

            </div>  {/* Body Container Div End */}

            <div className="formContainer">
                <div className="centerMessage">
                    Log In to your Account
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="formfields">
                        <div>
                            <div><label for="email" class="" >Email</label> </div>
                            <input type="email" placeholder={hintText} value={email} onChange={handleEmailChange} />
                        </div>
                    </div>

                    <div className="formfields">
                        <div>
                            <div><label for="password" class="" >Password</label> </div>
                            <input type="password" placeholder={hintText2} value={password} onChange={handlePasswordChange} />
                        </div>
                    </div>

                    <div className="formfields">
                        <div>
                            <a href="AudioManager">
                                <button className="continue_btn">Log In</button>
                            </a>
                        </div>
                    </div>
                </form>

                <div className="formfields">
                    <div className='loginlink'>
                        <a href='./register'> Haven't registered? Sign up</a>
                    </div>
                </div>
                <div className="formfields">
                    <div className='loginlink'>
                        <a href='./forgotpassword'> Forgot Password?</a>
                    </div>
                </div>
            </div>

            {/* Main Container Div End */}
        </div>
    );
}
