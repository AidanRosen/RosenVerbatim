import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import logo from '../../a.png'; // Tell webpack this JS file uses this image
import '../../pages/shared.css';


export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [validPass, setValidPass] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setValidPass(true);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setValidPass(false);
    } else {
      setValidPass(true);
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered:", userCredential.user);
      console.log(userCredential.user);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        username: username,
      });

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      navigate('/login');
      // Optionally, you can redirect the user to a different page after successful registration.
    } catch (error) {
      setError(error.message);
    }

  };

  let hintText = 'Email',
    hintText2 = "Password";

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

      <form onSubmit={handleRegister}>
        <div className="formContainer">
          <div className="centerMessage">
            Create Your Account
          </div>

          <div className="formfields">
            <div>
              <div><label for="username" class="">Username</label></div>
              <input type="username" placeholder="Username" value={username} onChange={handleUsernameChange} />
            </div>
          </div>

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
              {!validPass && (
                <div>
                  Password must be at least 8 characters long!
                </div>
              )}
            </div>
          </div>


          <div className="formfields">
            <div>
              <a href='./login'>
                <button className="continue_btn" onClick={handleRegister}>CONTINUE</button>
              </a>

            </div>
          </div>

          {showSuccessMessage && (
            <div className="notification visible">
              Account created successfully!
            </div>
          )}

          <div className="formfields">
            <div className='loginlink'>
              <a href='./login'> Already registered? Login</a>
            </div>
          </div>
        </div>
      </form>


      {/* Main Container Div End */}
    </div>
  );
}
