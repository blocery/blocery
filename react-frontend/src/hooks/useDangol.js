import React, {useEffect, useState} from 'react';
import useLogin from "~/hooks/useLogin";
import {getMyFollowFlagByProducerNo, toggleRegularShop} from "~/lib/shopApi";
const useDangol = ({initialValue = false, producerNo}) => {
    const {consumer, isServerLoggedIn} = useLogin()
    const [dangolFlag, setDangolFlag] = useState(initialValue)

    useEffect(() => {
        if (consumer)
            search()
    }, [consumer])

    const search = async () => {
        //regularShop 객체 리턴
        const {data} = await getMyFollowFlagByProducerNo(producerNo)
        if (data) {
            setDangolFlag(true)
        }
    }

    const addDangol = async () => {
        if (await isServerLoggedIn()) {
            if (dangolFlag) {
                if (!window.confirm('단골을 취소하시겠어요? 이후 생산자 알림을 받을 수 없습니다.'))
                    return
            }
            const {data} = await toggleRegularShop(producerNo)
            setDangolFlag(data)

            return data
        }
    }

    return {dangolFlag, addDangol}

}
export default useDangol