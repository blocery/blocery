import React, {useEffect, useState} from "react";
import {withRouter} from 'react-router-dom'
import Profile from "~/components/common/cards/Profile";
import {getProfileByConsumerNo} from "~/lib/shopApi";

const ProfileAuto = withRouter(({consumerNo}) => {
    const [profileInfo, setProfileInfo] = useState()
    useEffect(() => {
        if (consumerNo) {
            getProfileByConsumerNo(consumerNo).then(res => {
                    //console.log({consumer: res.data})
                    setProfileInfo(res.data)
                }


            )
        }
    }, [consumerNo])

    if (!profileInfo) return null

    return <Profile {...profileInfo}/>
})

export default ProfileAuto
