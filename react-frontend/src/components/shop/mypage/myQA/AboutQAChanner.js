import React from 'react'
import ComUtil from "~/util/ComUtil";
import {toast} from "react-toastify";
const AboutQAChanner = (props) => {  // web일 때 전화문의 버튼 클릭
    const callCenter = () => {
        toast.info('모바일 앱에서 사용해주세요')
    }
    return (
        <div>
            <div className='m-3'>
                <p className='text-center font-weight-bold'>카카오톡 채널 문의</p>
                <p className='text-center m-3'>상품, 배송, 이벤트 등 샵블리에 대한 <br/> 궁금한 사항은 [샵블리 카카오톡 채널]을 통해 <br/> 문의해 주시면 보다 빠르게 <br/> 답변 받으실 수 있습니다. </p>
                <p className='text-center'>
                    <a href="http://pf.kakao.com/_GvBnxb" target="_blank" data-rel="external" className='text-info'><u>[샵블리 카카오톡 채널 바로가기]</u></a>
                </p>
            </div>
            <hr/>
            <div className='m-3'>
                <p className='text-center font-weight-bold'>전화문의</p>
                {
                    ComUtil.isPcWeb() ? <p className='text-center cursor-pointer text-info' onClick={callCenter}><u>031-8090-3108</u></p>
                        :
                        <p className='text-center cursor-pointer'><u><a href="tel:031-8090-3108" data-rel="external" className='text-info'>031-8090-3108</a></u></p>
                }
                <p className='text-center'>주중 오전 9시 ~ 오후 6시</p>
                <p className='text-center'>점심시간 낮12시 ~ 오후 1시</p>
            </div>
        </div>
    );
};

export default AboutQAChanner;
