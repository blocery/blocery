import React from 'react'
import PropTypes from 'prop-types'

import Checkbox from '~/components/common/checkboxes/Checkbox'
import {Flex, Button, Div} from "~/styledComponents/shared";
import {MdClose} from "react-icons/all";
import {getValue} from "~/styledComponents/Util";

const CartHeader  = (props) => {
    const onChange = (e) => {
        // props.onChange(e.target.checked)

        props.onChange({
            type: 'CHECKED_ALL',
            state: {
                checked: e.target.checked
            }
        })

    }

    const onDelete = () => {
        props.onChange({
            type: 'DELETE_ITEMS'
        })
    }

    const {totCount, checkedCount} = props

    return (
        <Flex minHeight={55} bg={'background'} px={16}>
            <Checkbox bg={'green'} onChange={onChange} checked={totCount === checkedCount} size={'sm'}>전체선택 ({checkedCount}/{totCount})</Checkbox>
            <div className='ml-auto'>
                {
                    checkedCount > 0 && totCount > 0 &&
                    <Button bc={'green'} fg={'green'} fontSize={13} rounded={1} px={8} py={0} minHeight={30} onClick={onDelete}>
                        <Flex>
                            <MdClose color={'dark'} style={{marginRight:getValue(8)}} size={getValue(20)}/>
                            <Div lineHeight={30}>
                                선택 삭제({checkedCount})
                            </Div>
                        </Flex>
                    </Button>
                }
            </div>
        </Flex>
    )
}

CartHeader.propTypes = {
    checkedCount: PropTypes.number.isRequired,
    totCount: PropTypes.number.isRequired,
}
CartHeader.defaultProps = {
    checkedCount: 0,
    totCount: 0
}

export default CartHeader
