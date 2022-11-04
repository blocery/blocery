

const FAQ_STORE = {
        myInfo : { faqType: 'myInfo', name: '회원 계정', hidden:false},
        orderDelivery : { faqType: 'orderDelivery', name: '주문/결제/배송', hidden:false},
        cancel : { faqType: 'cancel', name: '취소/교환/환불', hidden:false},
        point : { faqType: 'point', name: '쿠폰/포인트/적립금', hidden:false},
        communityService : { faqType: 'communityService', name: '커뮤니티/서비스/기타', hidden:false},

        order : { faqType: 'order', name: '주문/결제', hidden:true},
        delivery : { faqType: 'delivery', name: '배송', hidden:true},
        community : { faqType: 'community', name: '커뮤니티', hidden:true},
        service : { faqType: 'service', name: '서비스/기타', hidden:true},

        // myInfo : { faqType: 'myInfo', name: '회원/정보'},
        // order : { faqType: 'order', name: '주문/결제'},
        // delivery : { faqType: 'delivery', name: '배송'},
        // cancel : { faqType: 'cancel', name: '교환/반품/취소'},
        // point : { faqType: 'point', name: '포인트/등급/적립금'},
        // community : { faqType: 'community', name: '커뮤니티'},
        // service : { faqType: 'service', name: '서비스/기타'},
}

export default FAQ_STORE