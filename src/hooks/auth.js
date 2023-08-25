import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom";


export function useAuth() {
    const [authUser, isLoading, error] = useAuthState(auth);

    return {user: authUser, isLoading: isLoading, error: error};
}

export function useLogin() {
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    async function login({email, password}) {
        setLoading(true);

        try {
            console.log(email)
            console.log(password)
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/protected/audiomanager");
        }
        catch(error) {
            console.log(error);
            return false;
        }
        return true;
    }

    return { login, isLoading}
}
