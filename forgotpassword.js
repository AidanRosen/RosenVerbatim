import React from 'react';
import logo from '../a.png'; 
import './shared.css';


const forgotpassword = () => {

    let hintText = 'Email',
    hintText2 = "Password";

    return (


        <div class="container">  {}
             
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>    

        {}
        <div class="logo">
            <a href='./../'>  
                <img src={logo} alt="Logo" />	  
            </a>
        </div>
        {}
    

        <div class="row">  {}      

        </div>  {}


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

    {}
   </div>  


    );
};
 
export default forgotpassword;