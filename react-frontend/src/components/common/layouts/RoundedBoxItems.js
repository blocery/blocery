import React from 'react';
import {goodsSorterList} from "~/lib/bloceryConst";
import {Div, Flex} from "~/styledComponents/shared";

const RoundedBoxItems = ({data, value, onClick}) => {
    return (
        <Flex overflow={'auto'} bg={'backgroundDark'}
              py={10}
              px={16}
              custom={`
            & > div {
                margin-right: 8px;                
            }
            & > div:last-child {
                margin: 0;
            }
        `}>
            {
                data.map(item =>
                    <Div flexShrink={0} rounded={20} minHeight={36} lineHeight={36} px={20} cursor={1}
                         // width={'max-content'}
                         display={'inline-block'}
                         doActive
                         bg={item.value === value ? 'green' : 'white'}
                         fg={item.value === value ? 'white' : 'darkBlack'}
                         bc={'light'}
                         custom={'transition: 0.2s;'}
                         onClick={onClick.bind(this, item)}
                    >
                        {item.label}
                    </Div>
                )
            }
        </Flex>
    );
};

export default RoundedBoxItems;
