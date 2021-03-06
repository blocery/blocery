import React from 'react'
import PropTypes from 'prop-types'
import { Button, Label } from 'reactstrap';
import { Checkbox } from '@material-ui/core'



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

    const checked = props.checkedCount === props.totCount && props.totCount > 0 ? true : false
    return (
        <div className='d-flex align-items-center'>
            <Checkbox id={'checkAll'} className={'p-0 mr-2'} color={'default'} checked={checked} onChange={onChange} />
            <Label for={'checkAll'} className='font-weight-bold m-0'>전체선택 ({props.checkedCount}/{props.totCount})</Label>
            <div className='ml-auto'>
                {
                    props.checkedCount > 0 && props.totCount > 0 && <Button size='sm' className={'m-0'} color={'primary'} outline onClick={onDelete}>삭제({props.checkedCount})</Button>
                }

            </div>
        </div>
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
