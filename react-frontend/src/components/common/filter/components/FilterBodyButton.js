//필터 토글 버튼 (공통)
import {Space} from "~/styledComponents/shared";
import {IoIosArrowDown, IoIosArrowUp} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import React from "react";
import {MAIN_COLOR_NAME} from '../FilterStore'
import styled from 'styled-components'

const StyledButton = styled(Space)`
    position: relative;
    ${p => p.isActive && `
        &::after {
            position: absolute;
            top: 0;
            right: -3px;
            content: "";
            display: block;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: ${color.danger};
        }
    `}
`

//isActive : 필터가 선택 되었을때
//isOpen : 컨텐츠 박스가 열려있는지 여부
const FilterBodyButton = ({isActive, isOpen, isToggle = true, onClick, children}) => {
    return(
        <StyledButton cursor={1} doActive spaceGap={4} rounded={25}
                      px={12}
                      justifyContent={0}
                      height={36}
                      isActive={isActive}
                      bg={'white'}
                      bc={'light'}
                      fg={isOpen && MAIN_COLOR_NAME}
                      bold={isOpen}
                      onClick={onClick}>
            <div>{children}</div>
            {
                isToggle && (
                    <div>
                        {
                            isOpen ? <IoIosArrowUp /> : <IoIosArrowDown color={color.dark} />
                        }
                    </div>
                )
            }
        </StyledButton>
    )
}
export default FilterBodyButton