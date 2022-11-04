import React from "react"
import { useLocation } from "react-router-dom"

import analytics from "./analytics"

export default function useGoogleAnalytics() {
    const location = useLocation()

    React.useEffect(() => {
        analytics.init()
    }, [])

    React.useEffect(() => {
        const currentPath = location.pathname + location.search
        //console.log("useGoogleAnalytics==",currentPath)
        analytics.sendPageview(currentPath)
    }, [location])
}