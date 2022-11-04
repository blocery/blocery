import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom'
import {getConsumer} from "~/lib/shopApi";
import certApi from "~/lib/certApi";
import KakaoCert from "~/components/shop/mypage/kakaoCert";
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import PointToBly from "~/components/shop/mypage/point/PointToBly";
import PointToCoupon from "~/components/shop/mypage/point/PointToCoupon";
import Withdraw from "~/components/shop/mypage/withdraw";
import WithdrawErcDon from "~/components/shop/mypage/withdrawErcDon";
import WithdrawIrcDon from "~/components/shop/mypage/withdrawIrcDon";

const KakaoCertCheck = ({history}) => {

    const [loading, setLoading] = useState(true)
    const [certDone, setCertDone] = useState()
    const [certType, setCertType] = useState("C")
    console.log({history})

    //bly or don
    const {tokenName, type} = history.location.state ? history.location.state : {tokenName: 'bly'}

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const {data} = await getConsumer()

        if (!data) {
            history.replace('/mypage')
        }

        await searchCertDone()
        setLoading(false)
    }


    //1. 인증서 생성여부 조회
    const searchCertDone = async () => {
        //await 인증서 생성여부 판단
        const {data} = await certApi.getCertDone()
        console.log({certDone: data})
        if (tokenName === 'pointToBly' || tokenName === 'pointToCoupon'){
            setCertType('P');
        }
        setCertDone(data)
    }

    if (loading) return <BlocerySpinner />

    //인증서 생성 하였을 경우 출금페이지
    if (certDone) {
        if (tokenName === 'bly') {
            return <Withdraw />
        } else if (tokenName === 'ircDon') {
            return <WithdrawIrcDon />
        } else if (tokenName === 'ercDon') {
            return <WithdrawErcDon />
        } else if (tokenName === 'pointToBly') {
            return <PointToBly />
        } else if (tokenName === 'pointToCoupon') {
            return <PointToCoupon />
        }
    }

    //인증서 생성 하지 않았을 경우
    return (
        <KakaoCert refresh={searchCertDone} type={certType}/>
    );
};

export default withRouter(KakaoCertCheck);