import { useEffect } from "react";
import { useOutletContext } from "react-router-dom"


export const HospitalDashboard=()=>{
    const {setHeaderContent}=useOutletContext();

    useEffect(() => {
        setHeaderContent({
          title: "Hospital Dashboard",
          subtitle:"Monitor your hospital operations, resources, and patient services in one place",
          action: undefined,
        });
    }, [setHeaderContent]);

    
    
    return (
        <>
          
        </>
    )
}