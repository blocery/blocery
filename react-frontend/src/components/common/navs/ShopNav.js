import React from 'react';
import {Div, Flex, Span} from "~/styledComponents/shared";
import {IconBackArrow} from "~/components/common/icons";
import styled from 'styled-components'
import {color, hoverColor} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";

const StyledButton = styled(Flex)`
    justify-content: center;
    width: ${getValue(56)};
    height: 100%;
    cursor: pointer;
    &:hover {
        background: ${hoverColor.white};
    }
`

function ShopNav({onClose, children}) {
    return(
        <Flex relative justifyContent={'space-between'} height={56} bg={'white'} bc={'light'} bl={0} bt={0} br={0}>
            {/* left contents */}
            <Flex height={'100%'} onClick={onClose}>
                <StyledButton>
                    <IconBackArrow />
                </StyledButton>
            </Flex>

            <Div absolute top={0} left={'50%'} xCenter lineHeight={56} textAlign={'center'}>
                <Span fontSize={20}>
                    {children}
                </Span>
            </Div>

            {/* right contents */}
            <Flex height={'100%'} onClick={onClose}>

            </Flex>

        </Flex>
    )
}

export default ShopNav;
