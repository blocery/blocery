import React from 'react';
import {Div, Flex} from "~/styledComponents/shared";
import {CartLink} from "~/components/common";
// import Sticky from "~/components/common/layouts/Sticky";
import {Sticky} from "~/styledComponents/shared";

//가장 기본적이 네비게이션
const BasicNavigation = ({hideLine = false, leftContent, rightContent, bottomContent, children}) => {
    return (
        <Sticky top={0} zIndex={4}>
            <Flex justifyContent={'space-between'} height={56} bg={'white'}
                      bc={!hideLine && 'light'}
                  bl={0} bt={0} br={0}
                  lineHeight={'1'}
            >
                <Flex height={'100%'}>
                    {leftContent}
                    <Div fontSize={20} mb={-1}>
                        {children}
                    </Div>
                </Flex>
                <Flex height={'100%'}>
                    {rightContent}
                </Flex>
            </Flex>
            {bottomContent}
        </Sticky>
    );
    return (
        <Sticky top={0} zIndex={4}>
            <Flex justifyContent={'space-between'} height={56} bg={'white'} bc={!hideLine && 'light'}
                // px={16}
                  bl={0} bt={0} br={0}>
                {/* left */}
                <Flex>
                    {leftContent}
                </Flex>
                {/* center */}
                <Div absolute fontSize={20} bold center
                    // width={'max-content'}
                     display={'inline-block'}
                >{children}</Div>
                {/* right */}
                <Flex pr={8}>
                    {rightContent}
                </Flex>
            </Flex>
        </Sticky>
    );
};

export default BasicNavigation;
