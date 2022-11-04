import React, {useState} from 'react';
import {Flex} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import useLogin from "~/hooks/useLogin";
import useZzim from "~/hooks/useZzim";

import {AnimatedHeart} from "~/styledComponents/ShopBlyLayouts";

const ZzimButton = ({goodsNo, ...rest}) => {

    const {isServerLoggedIn} = useLogin()
    const {zzimList, addOrRemoveZzim} = useZzim()
    const [scaleUp, setScaleUp] = useState(false)

    const onClick = async e => {
        e.stopPropagation()
        if (await isServerLoggedIn()) {
            const isAdded = await addOrRemoveZzim(goodsNo)
            setScaleUp(isAdded)
        }
    }
    const active = zzimList ? zzimList.includes(goodsNo) : false
    return(
        <Flex justifyContent={'center'}
              // width={'100%'}
              // height={'100%'}
              // bg={'white'}
              // pt={3}
              cursor={1}
              // custom={`
              //   &:active {
              //       background-color: ${color.light};
              //   }
              //
              // `}
              onClick={onClick}
              {...rest}
        >
            <AnimatedHeart
                scaleUp={scaleUp}
                color={active ? color.danger : 'rgba(0,0,0,0.5)'} size={24}/>
        </Flex>
    )
}

export default ZzimButton;
