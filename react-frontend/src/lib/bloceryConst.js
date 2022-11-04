//배송비 정책 코드
export const TERMS_OF_DELIVERYFEE = {
    NO_FREE: 'NO_FREE',                     //무료배송 없음
    FREE: 'FREE',                           //무료배송
    GTE_FREE: 'GTE_FREE',                   //몇개이상 무료배송
    EACH_GROUP_COUNT: 'EACH_GROUP_COUNT',   //몇개당 배송비 부과
    GTE_PRICE_FREE: 'GTE_PRICE_FREE'        //몇원이상 무료배송
}

export const ProducerPayOutStatusEnum = {
    NotYet: 'NotYet',
    PendingBurnBls: 'PendingBurnBls',
    PendingTransfer: 'PendingTransfer',
    Complete: 'Complete'
}

export const TYPE_OF_IMAGE = {
    IMAGE: 'image',         //기본이미지
    THUMB: 'thumb',         //썸네일(원본 비율 그대로 사이즈만 축소)
    WIDE: 'wide',           //wide(원본을 와이드로 크롭)
    SQUARE: 'square',       //square(원본을 정사각형으로 크롭)
    SMALL_SQUARE: 'small',  //small square(원본을 정사각형으로 크롭: 보통 게시물 리스트의 아주 작은 이미지 용도)
}

export const GOODS_SORTER = {
    NEWEST: 1,
    AVG_SCORE: 2,
    LOWER_PRICE: 3,
    HIGH_PRICE: 4,
    REVIEW_COUNT: 5
}

export const goodsSorterList = [
    {label: '최신순', value: GOODS_SORTER.NEWEST},
    {label: '평점순', value: GOODS_SORTER.AVG_SCORE},
    {label: '낮은 가격순', value: GOODS_SORTER.LOWER_PRICE},
    {label: '높은 가격순', value: GOODS_SORTER.HIGH_PRICE},
    {label: '리뷰 많은순', value: GOODS_SORTER.REVIEW_COUNT},
]

// 인증마크 정보 (MAFRA:농림축산식품부,MOF:해양수산부,MFDS:식품의약품안전처)
export const authMarkTypeInfo = {
    MAFRA: [
        {key:"1_01",img:"/authMarkImg/1_01.png",title:"생산이력추적",desc:"농산물에 대한 추적과 역추적 체계를 확립하여, 문제발생시 신속한 원인규명 및 조치를 취하기위한 제도"},
        {key:"1_02",img:"/authMarkImg/1_02.png",title:"유기농산물",desc:"합성농약과 화학비료를 사용하지 않고 재배한 농산물"},
        {key:"1_03",img:"/authMarkImg/1_03.png",title:"무농약",desc:"합성농약은 사용하지 않고 화학비료는 최소화하여 생산한 농산물"},
        {key:"1_04",img:"/authMarkImg/1_04.png",title:"무농약원료가공식품",desc:"무농약 농산물을 원료 또는 재료로 사용하여 유기식품과 무농약농산물을 혼합하여 제조,가공,유통되는 식품"},
        {key:"1_05",img:"/authMarkImg/1_05.png",title:"GAP",desc:"농산물에 잔류할수 있는 각종 위해요소를 안전하게 관리하는 과학적인 위생안전관리 체계"},
        //{key:"1_06",img:"/authMarkImg/1_06.png",title:"유기축산물",desc:"항생제와 항균제를 첨가하지 않은 유기사료를 먹여 사육한 축산물"},
        {key:"1_07",img:"/authMarkImg/1_07.png",title:"무항생제",desc:"항생제, 항균제 등이 첨가되지 않은 일반 사료를 먹이고, 성장촉진제나 호르몬제를 사용하지 않으며, 축사와 사육 조건, 질병관리 등의 인증기준을 지켜 생산한 축산물"},
        {key:"1_08",img:"/authMarkImg/1_08.png",title:"동물복지",desc:"적합한 환경에서 동물의 고통과 스트레스를 최소화 하는 등 동물복지 기준에 따라 동물을 사육하는 농장"},
        {key:"1_09",img:"/authMarkImg/1_09.png",title:"HACCP(안전관리인증기준)",desc:"식품의 원재료 생산부터, 최종소비자가 섭취하기 전까지의 전 단계에서 발생할 우려가 있는 위해 요소를 규명하여 중점관리함으로써 식품의 안전성을 확보하기 위한 과학적인 위생관리체계 시스템"},
        {key:"1_10",img:"/authMarkImg/1_10.png",title:"유기가공식품",desc:"유기원료(유기농산물, 유기축산물)를 95%이상 사용하여 제조·가공한 식품"},
        {key:"1_11",img:"/authMarkImg/1_11.png",title:"지리적표시제도",desc:"명성,품질 등이 특정지역의 지리적 특성에 기인하였음을 등록하고 표시하는 제도"},
        {key:"1_12",img:"/authMarkImg/1_12.png",title:"전통식품",desc:"국내산 농수산물을 주원(재)료로 하여 제조, 가공, 조리되어 우리 고유의 맛, 향, 색을 내는 우수한 전통식품"},
        //{key:"1_13",img:"/authMarkImg/1_13.png",title:"한국식품명인제도",desc:"전통식품의 계승, 발전과 가공기능인의 명예를 인정하고 보호, 육성하기 위해 만들어진 제도"},
        //{key:"1_14",img:"/authMarkImg/1_14.png",title:"가공식품 KS인증제도",desc:"합리적인 식품 및 관련서비스의 표준을 제정 보급함으로써 가공식품의 품질과 관련 서비스를 향상시키기 위해 만들어진 제도"},
        //{key:"1_15",img:"/authMarkImg/1_15.png",title:"저탄소 농축산물 인증제도",desc:"농축산물 생산 전과정에서 온실가스 배출량을 줄이는 ‘저탄소 농업기술’을 적용하여 생산한 농산물"},
        //{key:"1_16",img:"/authMarkImg/1_16.png",title:"술 품질인증 가형",desc:"우리 술의 품질고급화를 위해 정부가 품질을 보증\n" + "- 가형 : 품질인증을 받은 술"},
        //{key:"1_17",img:"/authMarkImg/1_17.png",title:"술 품질인증 나형",desc:"우리 술의 품질고급화를 위해 정부가 품질을 보증\n" + "- 나형 : 술에 들어가는 원료가 100% 국내산"},
    ],
    MOF: [
        {key:"2_01",img:"/authMarkImg/2_01.png",title:"생산이력추적",desc:"수산물에 대한 추적 체계를 확립하여, 문제발생시 신속한 원인규명 및 조치를 취하기위한 제도"},
        {key:"2_02",img:"/authMarkImg/2_02.png",title:"유기식품",desc:"해당 수산물이 유기적으로 생산되거나 가공되었음을 인증"},
        //{key:"2_03",img:"/authMarkImg/2_03.png",title:"활성처리제 비사용",desc:"활성처리제를 사용하지 않고 양식된 수산물(주로 해조류)"},
        //{key:"2_04",img:"/authMarkImg/2_04.png",title:"품질인증",desc:"농수산물품질관리법에 의거하여 현장조사와 심사를 거쳐 인증된 상품"},
        //{key:"2_05",img:"/authMarkImg/2_05.png",title:"우수천일염인증",desc:"우수한 품질의 천일염에 대하여 인증기준에 따라 생산된 소금에 부착하는 마크"},
        //{key:"2_06",img:"/authMarkImg/2_06.png",title:"무항생제",desc:"해조류를 제외한 「수산업법 시행령」 제27조의 규정과 육상해수양식어업 및 「내수면어업법 시행령」 제9조제1항제5호의 규정에 의한 육상양식어업으로 생산한 수산물"},
        {key:"2_07",img:"/authMarkImg/2_07.png",title:"유기가공식품",desc:"유기수산물을 원료 또는 재료로 하여 제조·가공·유통하는 식품"},
        {key:"2_08",img:"/authMarkImg/2_08.png",title:"지리적표시제도",desc:"명성,품질 등이 특정지역의 지리적 특성에 기인하였음을 등록하고 표시하는 제도"},
        //{key:"2_09",img:"/authMarkImg/2_09.png",title:"전통식품",desc:"국산 수산물을 주원료 하여 예로부터 전승되는 원리에 따라 제조·가공·조리되어 우리 고유의 맛·향 및 색을 내는 수산식품"},
        //{key:"2_10",img:"/authMarkImg/2_10.png",title:"한국식품명인제도",desc:"전통식품의 계승, 발전과 가공기능인의 명예를 인정하고 보호, 육성하기 위해 만들어진 제도"}
    ],
    MFDS: [
        //{key:"3_01",img:"/authMarkImg/3_01.png",title:"건강기능식품",desc:"식약처로부터 기능성과 안전성이 인정된 건강기능식품임을 보증"},
        {key:"3_02",img:"/authMarkImg/3_02.png",title:"GMP(우수건강기능식품제조기준)",desc:"상품의 전 공정에 걸쳐 체계적인 관리와 우수한 품질의 제조 기준으로 만들어지는 건강식품임을 보증"},
        //{key:"3_03",img:"/authMarkImg/3_03.png",title:"어린이 기호식품 품질인증",desc:"아이들이 주로 좋아하는 음식물을 식품안전관리 인증기준에 따라 만든 식품임을 보증"},
        {key:"3_04",img:"/authMarkImg/3_04.png",title:"HACCP(식품안전관리인증기준)",desc:"식품의 원재료 생산부터, 최종소비자가 섭취하기 전까지의 전 단계에서 발생할 우려가 있는 위해 요소를 규명하여 중점관리함으로써 식품의 안전성을 확보하기 위한 과학적인 위생관리체계 시스템"}
    ]
}