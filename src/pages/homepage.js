
import logo from '../a.png'; // Tell webpack this JS file uses this image
import './shared.css';


import React, { useState, useEffect, useRef } from 'react';
 import { process } from '../utilities/process';
 import RecorderJS from 'recorder-js';
 import { exportBuffer } from '../utilities/preprocess';
 import { getAudioStream } from '../utilities/permissions';
 import '../App.css';

let a; 


const homepage = () => {

    //  const [buttonName, setButtonName] = useState('Play');


    
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
                 Log In to your Account
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
                    <a href="AudioManager">
                        <button className="continue_btn">Log In</button>
                    </a>
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
};
 
export default homepage;