import React from 'react';
import logo from '../a.png'; // Tell webpack this JS file uses this image
import './shared.css';
 
const SignUp = () => {

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


        <div className="formContainer">
            <div className="centerMessage">
                 Create Your Account
            </div>
            
            <div className="formfields">
                 <div>
                    <div><label for="email" class="" >Email</label> </div>
                    <input type="email" placeholder={hintText} />
                 </div>
            </div>

            <div className="formfields">
                 <div>
                    <div><label for="password" class="" >Password</label> </div>
                    <input type="password" placeholder={hintText2} />
                 </div>
            </div>

            <div className="formfields">
                 <div>
                    
                 <button className="continue_btn">CONTINUE</button>
                 </div>
            </div>

            <div className="formfields">
                 <div className='loginlink'>                    
                    <a href='./login'> Already registered? Login</a>
                 </div>
            </div>


        </div>

       


    {/* Main Container Div End */}
   </div>  
    );
};
 
export default SignUp;