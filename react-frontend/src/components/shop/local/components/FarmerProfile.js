import React from 'react';
import {Div, Flex, Img} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";

const FarmerProfile = ({desc, farmerImages}) => {
    return (
        <Div relative>
            <Flex alignItems={'flex-end'} p={15} absolute top={'70%'} left={0} right={0} bottom={0} fg={'white'} zIndex={1}
                // bg={'rgba(0,0,0,0.5)'}
                  fontSize={20}
                  custom={`
                                                background-image: linear-gradient(360deg, #0000008c, transparent);
                                             `}
            >
                {desc}
            </Flex>
            <Img cover src={ComUtil.getFirstImageSrc(farmerImages, 'image')} style={{maxHeight: '60vmin'}} alt={'로컬푸드 농가사진'}/>
        </Div>
    );
};
export default FarmerProfile;
