'use client'
import { useEffect } from "react";
import AOS from "aos"
import 'aos/dist/aos.css';

const Aoscompo = ({children}:any) => {
    useEffect(() => {
        AOS.init({
            duration: 300,              // Short, so nothing feels like it is still loading
            once: true,                 // Never re-animate when scrolling back up
            offset: 0,                  // Start as soon as the element enters the viewport
            easing: 'ease-out-cubic',
            // Fade-ins are what make content feel slow on phones: render instantly there.
            disable: 'phone',
        })
    }, [])
  return (
    <div>
      {children}
    </div>
  )
}

export default Aoscompo
