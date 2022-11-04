import React, {useEffect, useRef, useState} from "react";
import NumberPad from "~/components/common/keyPad/NumberPad";
const ModalContent = ({keyword, onChange}) => {
    return(
        <NumberPad onChange={onChange} />
    )
}
export default ModalContent