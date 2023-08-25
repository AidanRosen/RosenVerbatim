import React from 'react';
import logo from '../a.png'; // Tell webpack this JS file uses this image
import './shared.css';


const forgotpassword = () => {

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
                 Recover Password
            </div>
            
            <div className="formfields">
                 <div>
                    <div><label for="email" class="" >Email</label> </div>
                    <input type="email" placeholder={hintText} />
                 </div>
            </div>

          

            <div className="formfields">
                 <div>
                    
                 <button className="continue_btn">Submit</button>
                 </div>
            </div>

            <div className="formfields">
                 <div className='loginlink'>                    
                 <a href='./signup'>Register</a> &nbsp;/&nbsp; <a href='./login'> Login</a>
                 </div>
            </div>


        </div>

    {/* Main Container Div End */}
   </div>  


    );
};
 
export default forgotpassword;