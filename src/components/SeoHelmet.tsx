import React from 'react'
import { useLocation } from 'react-router-dom'

interface SeoHelmetProps {
  title?: string
  description?: string
  image?: string
  type?: string
  url?: string
}

const SeoHelmet: React.FC<SeoHelmetProps> = ({
  title = 'Options World - #1 Options Trading Simulator | Practice Risk-Free',
  description = 'Master options trading with our advanced paper trading platform. Practice with real market data, learn Greeks, and build confidence before risking real money. Free to start!',
  image = 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
  type = 'website',
  url
}) => {
  const location = useLocation()
  const currentUrl = url || `https://optionsworld.trade${location.pathname}`
  
  // Update document title
  React.useEffect(() => {
    document.title = title
  }, [title])
  
  return (
    <>
      {/* This component doesn't render anything visible, it just updates the document head */}
      {/* In a real app, you would use React Helmet or similar library */}
    </>
  )
}

export default SeoHelmet