import React from 'react'
import {getValue} from "~/styledComponents/Util";

const BodyFullHeight = (props) => {
    const { nav, homeTabbar, bottomTabbar} = props
    let px = 0;
    if(nav){
        px += 56
    }
    if(homeTabbar){
        px += 45
    }
    if(bottomTabbar){
        px += 54
    }

    return(
        <div style={{
            height: `calc(100vh - ${getValue(px)})`
        }}>
            {props.children}
        </div>
    )
    // return(
    //     <div style={{
    //         height: `calc(100vh - ${px}px)`
    //     }}>
    //         {props.children}
    //     </div>
    // )
}

export default BodyFullHeight