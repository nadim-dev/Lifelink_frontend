import { useEffect } from "react";
import { useOutletContext } from "react-router-dom"



export const ServiceAndFacility=()=>{
    const {setHeaderContent}=useOutletContext();

    useEffect(() => {
        setHeaderContent({
          title: "Services & Facility",
          subtitle: "Manage the services and facilities available at your hospital",
          action: undefined,
        });
      }, [setHeaderContent]);


    return (
        <>
        </>
    )
}