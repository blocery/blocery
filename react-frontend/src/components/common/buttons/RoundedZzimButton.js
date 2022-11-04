import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {Flex} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {IoIosHeart} from "react-icons/io";
import useLogin from "~/hooks/useLogin";
import useZzim from "~/hooks/useZzim";
import {AnimatedHeart} from "~/styledComponents/ShopBlyLayouts";

const RoundedZzimButton = React.memo(({goodsNo}) => {

    const {openLoginModal} = useLogin()
    const {zzimList, addOrRemoveZzim} = useZzim()
    // const [active, setActive] = useState()
    const [scaleUp, setScaleUp] = useState(false)

    // const {addOrRemoveZzim} = useZzim()
    // const active = true

    // const onClick = async e => {
    //     e.stopPropagation()
    //
    //     if (await isServerLoggedIn()) {
    //         const isAdded = await addOrRemoveZzim(goodsNo)
    //         setScaleUp(isAdded)
    //     }
    // }

    // useEffect(() => {
    //     console.log("consumerNo =================================")
    //     setActive(() => {
    //         const res = isZzim(goodsNo)
    //         console.log({isZzim: res})
    //         return res
    //     })
    // }, [consumerNo]);


    // const setZzimList = useSetRecoilState(consumerZzimListState)

    const active = useMemo(() => zzimList.includes(goodsNo),[zzimList]);

    const onClick = async e => {
        e.stopPropagation()

        //등록 true 삭제 false 미로그인 null
        const isAdded = await addOrRemoveZzim(goodsNo)

        //미 로그인시
        if (isAdded === null) {
            openLoginModal()
            return
        }

        setScaleUp(isAdded)
    }

    return(
        <Flex justifyContent={'center'} width={26} height={26}
              bg={color.white} rounded={'50%'} pt={3} cursor={1}
              custom={`
                box-shadow: 1.5px 1.3px 3px 0 rgba(0, 0, 0, 0.15);
              `}
              onClick={onClick}
        >
            <MemoAnimatedHeart scaleUp={scaleUp} active={active}/>
        </Flex>
    )
})

const MemoAnimatedHeart = React.memo(({scaleUp, active}) => {
    console.log("MemoAnimatedHeart =================")
        return(
            <AnimatedHeart
                scaleUp={scaleUp}
                color={active ? color.danger : '#9AA29F'} size={16}/>
        )
    }
)

export default RoundedZzimButton;