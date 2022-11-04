import React, {useEffect, useRef, useState} from "react";
// import objectUniqueSample from "~/images/objectUnique/objectUniqueSample.png"

const ObjectUniqueQr = ({objectUniqueNo}) => {
    const objectNo = parseInt(objectUniqueNo.toString().substr(8,4));

    const ObjectUniqueQr = () => {

            return (isNaN(objectNo))? <div></div>
                   :
                   <img src={'https://shopbly.shop/images/objectQr/' + objectNo + '.jpg'} width={70} height={70} />


        // if(objectNo == 1){
        //     return <img src={objectUniqueSample} width={70} height={70} />
        // }else{
        //     return <img src={objectUniqueSample} width={70} height={70} />
        // }
    }
    return(<ObjectUniqueQr/>)
}
export default ObjectUniqueQr