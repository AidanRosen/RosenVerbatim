import React from 'react';
import logo from '../a.png'; // Tell webpack this JS file uses this image
import { Player } from '@lottiefiles/react-lottie-player';

import './landingpage.css';
 
const Home = () => {
    return (
        <div class="container">  {/* Main Container Div Start *}
             
            <meta name="viewport" content="width=device-width, initial-scale=1"></meta>    

            {/* Logo Start   */}
            <div class="centerimage">	  
                <img src={logo} alt="Logo" />	  
            </div>
            {/* Logo End */}
        
            <div className="lottie-container">
                <Player
                    autoplay
                    loop
                    src={require('../Pulse2.json')}
                    className="lottie-animation" 
                />
            </div>

            <div class="row buttonrow">  {}      

                <div class="faketab">
                    <div className="faketableft">
                        <a href="/register">
                        <button className="signup_btn" value="SIGN UP" >SIGN UP</button>
                        </a>
                    </div>

                    <div className="faketabright">
                    <a href="/login">
                        <button className="login_btn" value="LOG UP" >LOG IN</button>
                        </a>
                    </div>
                </div>


            </div>  {/* Body Container Div End */}


            <div class="centerMessage">
                AI Voice Recording Enhancement
            </div>

        {/* Main Container Div End */}
       </div>  
    );
};
 
export default Home;