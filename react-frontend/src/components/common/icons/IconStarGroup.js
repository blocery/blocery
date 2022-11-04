import React from 'react'
import {FaStar, FaStarHalfAlt} from 'react-icons/fa'
import classNames from 'classnames'

const IconStarGroup = ({score = 0, size = 16}) => [2,4,6,8,10].map(num => {
        // console.log( num, score, score.toFixed(0));
    return (num > score && (num - 1 == score.toFixed(0))) ?  //score가 9이고 num=10일때만 반쪽 별 출력.
            <FaStarHalfAlt
                key={'iconStarGroup_' + num}
                style={{marginRight: 1}}
                className={classNames('b-0', num < 10 && 'mr-1')}
                color={'#ffc600'}
                size={size == 'lg' ? 19 : size}
            />
            :
            <FaStar
                key={'iconStarGroup_' + num}
                style={{marginRight: 1}}
                className={classNames('b-0', num < 10 && 'mr-1')}
                color={num <= score.toFixed(0) ? '#ffc600' : '#e9eaec'}
                size={size == 'lg' ? 19 : size}
            />
    }

)

export default IconStarGroup