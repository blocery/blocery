const basePixel = 15
// const toRem = (num) => num / basePixed
export const toRem = (num) => {
    //console.log({num, basePixel, res: num / basePixel})
    //TODO RENEW : 소수점 너무 길어 2자리 한번 해봄..
    return (num / basePixel).toFixed(4)

    // return num / basePixel
}


export const getValue = (value) => {
    if(typeof value === 'string') return value
    if(!isNaN(value) && value === 0) return value + 'px'
    if(!value) return null
    if(isNaN(value)) return value
    return toRem(value) + "rem" 
}

export const hasValue = (value) => {
    if (value === null || value === undefined) {
        return false
    }
    return true
}